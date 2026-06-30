#[derive(ts_rs::TS, serde::Serialize, Debug)]
#[ts(export)]
pub struct StoreEnd {
  #[ts(type = "'StoreEnd'")]
  pub action: &'static str,
  pub execution_id: String,
}
