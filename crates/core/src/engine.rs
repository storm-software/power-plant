use power_plant_common::{NormalizedOptions, Options, StoreInput, StoreOutput};
use power_plant_error::PowerPlantResult;
use power_plant_tracing::Session;
use std::future::{Future, ready};

#[derive(Debug)]
pub struct Engine {
  pub(super) session: Session,
  pub(super) options: NormalizedOptions,
  pub(super) is_closed: bool,
}

impl Engine {
  pub fn new(options: Options) -> PowerPlantResult<Self> {
    let normalized_options = NormalizedOptions::from(options);

    Ok(Self { options: normalized_options, is_closed: false, session: Session::dummy() })
  }

  pub fn is_closed(&self) -> bool {
    self.is_closed
  }

  pub fn store<'a>(&mut self, input: StoreInput) -> PowerPlantResult<StoreOutput> {
    self.create_error_if_closed()?;

    // let ret: Result<StoreOutput, _> = self.session.store();
    // if let Ok(ret) = ret {
    //   return Ok(ret);
    // }

    Ok(StoreOutput { success: false, warnings: vec![] })
  }

  #[must_use = "Future must be awaited to do the actual cleanup work"]
  pub fn close(&mut self) -> impl Future<Output = anyhow::Result<()>> + Send + 'static {
    self.is_closed = true;
    ready(Ok(()))
  }

  pub(super) fn create_error_if_closed(&self) -> PowerPlantResult<()> {
    if self.is_closed {
      Err(anyhow::anyhow!("Engine is closed"))?;
    }

    Ok(())
  }
}
