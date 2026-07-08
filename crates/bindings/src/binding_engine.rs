use crate::{
  types::{
    binding_error::{BindingErrors, BindingResult},
    binding_input::{
      BindingGetSettingsInput, BindingRecallInput, BindingSearchInput, BindingStoreInput,
    },
    binding_options::BindingOptions,
    binding_output::{
      BindingGetSettingsOutput, BindingRecallOutput, BindingSearchOutput, BindingStoreOutput,
    },
  },
  utils::to_binding_error,
};
use napi::{Either, Env, bindgen_prelude::PromiseRaw};
use napi_derive::napi;
use power_plant_engine::Engine;

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
      return Err(napi::Error::from_reason(inner.err().unwrap().to_string()));
    }

    Ok(Self { inner: inner.expect("Unable to create Power Plant engine") })
  }

  #[napi]
  pub fn get_settings<'env>(
    &mut self,
    env: &'env Env,
    input: BindingGetSettingsInput,
  ) -> napi::Result<PromiseRaw<'env, BindingResult<BindingGetSettingsOutput>>> {
    let result = self.inner.get_settings(input.into());
    let fut = async move {
      match result {
        Ok(output) => Ok(Either::B(output.into())),
        Err(err) => Ok(Either::A(BindingErrors::new(vec![to_binding_error(&err)]))),
      }
    };

    env.spawn_future(fut)
  }

  #[napi]
  pub fn store<'env>(
    &mut self,
    env: &'env Env,
    input: BindingStoreInput,
  ) -> napi::Result<PromiseRaw<'env, BindingResult<BindingStoreOutput>>> {
    let result = self.inner.store(input.into());
    let fut = async move {
      match result {
        Ok(output) => Ok(Either::B(BindingStoreOutput::from(output))),
        Err(err) => Ok(Either::A(BindingErrors::new(vec![to_binding_error(&err)]))),
      }
    };

    env.spawn_future(fut)
  }

  #[napi]
  pub fn recall<'env>(
    &mut self,
    env: &'env Env,
    input: BindingRecallInput,
  ) -> napi::Result<PromiseRaw<'env, BindingResult<BindingRecallOutput>>> {
    let result = self.inner.recall(input.into());
    let fut = async move {
      match result {
        Ok(output) => Ok(Either::B(BindingRecallOutput::from(output))),
        Err(err) => Ok(Either::A(BindingErrors::new(vec![to_binding_error(&err)]))),
      }
    };

    env.spawn_future(fut)
  }

  #[napi]
  pub fn search<'env>(
    &mut self,
    env: &'env Env,
    input: BindingSearchInput,
  ) -> napi::Result<PromiseRaw<'env, BindingResult<BindingSearchOutput>>> {
    let result = self.inner.search(input.into());
    let fut = async move {
      match result {
        Ok(output) => Ok(Either::B(BindingSearchOutput::from(output))),
        Err(err) => Ok(Either::A(BindingErrors::new(vec![to_binding_error(&err)]))),
      }
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
      if res.is_err() {
        return Err(napi::Error::from_reason(res.err().unwrap().to_string()));
      }
      Ok(())
    })
  }

  #[napi(getter)]
  pub fn is_closed(&self) -> bool {
    self.inner.is_closed()
  }
}
