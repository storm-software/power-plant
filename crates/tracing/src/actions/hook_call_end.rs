#[derive(ts_rs::TS, serde::Serialize, Debug)]
#[ts(export)]
pub struct HookCallEnd {
  #[ts(type = "'HookCallEnd'")]
  pub action: &'static str,
  pub id: String,
  pub path: String,
  pub original_code: String,
  pub code: Option<String>,
  pub plugin_name: String,
  /// The index of the plugin in the plugin list. It's unique to each plugin.
  pub plugin_id: u32,
  pub call_id: &'static str,
}
