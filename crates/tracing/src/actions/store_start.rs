#[derive(ts_rs::TS, serde::Serialize, Debug)]
#[ts(export)]
pub struct StoreStart {
  #[ts(type = "'StoreStart'")]
  pub action: &'static str,
  pub execution_id: String,
}
