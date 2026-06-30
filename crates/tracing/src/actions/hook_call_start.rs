#[derive(ts_rs::TS, serde::Serialize, Debug)]
#[ts(export)]
pub struct HookCallStart {
  #[ts(type = "'HookCallStart'")]
  pub action: &'static str,
  pub id: String,
  pub path: String,
  pub code: String,
  pub plugin_name: String,
  /// The index of the plugin in the plugin list. It's unique to each plugin.
  pub plugin_id: u32,
  pub call_id: &'static str,
}
