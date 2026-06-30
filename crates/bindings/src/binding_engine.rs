use crate::{
  types::{
    binding_error::{BindingError, BindingErrors, BindingResult},
    binding_input::BindingStoreInput,
    binding_options::BindingOptions,
    binding_output::BindingStoreOutput,
  },
  utils::{handle_result, to_binding_error},
};
use napi::{Env, bindgen_prelude::PromiseRaw};
use napi_derive::napi;
use power_plant_core::Engine;

#[napi]
#[derive(Debug)]
pub struct BindingEngine {
  inner: Engine,
}

#[napi]
impl BindingEngine {
  #[napi(constructor)]
  pub fn new(options: BindingOptions) -> napi::Result<Self> {
    let inner = Engine::new(options.into());
    if inner.is_err() {
      return Err(napi::Error::from_reason(
        inner
          .err()
          .unwrap()
          .iter()
          .map(|e| e.to_diagnostic().to_string())
          .collect::<Vec<_>>()
          .join("\n"),
      ));
    }

    Ok(Self { inner: inner.expect("Unable to create Power Plant engine") })
  }

  #[napi]
  pub fn store<'env>(
    &mut self,
    env: &'env Env,
    input: BindingStoreInput,
  ) -> napi::Result<PromiseRaw<'env, BindingResult<BindingStoreOutput>>> {
    let execution_id = input.execution.meta.id.clone();
    let result = self.inner.store(input.into());
    let fut = async move {
      let store_output = match result {
        Ok(output) => output,
        Err(errs) => {
          let errors: Vec<BindingError> = errs
            .into_vec()
            .iter()
            .map(|diagnostic| to_binding_error(diagnostic, execution_id.clone().into()))
            .collect();
          return Ok(napi::Either::A(BindingErrors::new(errors)));
        }
      };

      Ok(napi::Either::B(BindingStoreOutput::from(store_output)))
    };

    env.spawn_future(fut)
  }

  #[napi]
  // - `Engine::close()/inner.close()` requires acquiring `&mut self`
  // - Acquiring `&mut self` in async napi `fn` is unsafe, so we must use a sync `fn` here.
  // - But `Engine::close()/inner.close()` contains async cleanup operations, so we have await its returned future
  // in another async context instead of directly calling `close().await`.
  // - This also affects how the code is written in `Engine::close()/inner.close()`, see the implementation there for more details.
  pub fn close<'env>(&mut self, env: &'env Env) -> napi::Result<PromiseRaw<'env, ()>> {
    let cleanup_fut = self.inner.close();
    env.spawn_future(async move {
      let res = cleanup_fut.await;
      handle_result(res)?;
      Ok(())
    })
  }

  #[napi(getter)]
  pub fn is_closed(&self) -> bool {
    self.inner.is_closed()
  }
}
