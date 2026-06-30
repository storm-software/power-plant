use crate::types::PluginItem;

#[derive(ts_rs::TS, serde::Serialize, Debug)]
#[ts(export)]
pub struct SessionMeta {
  #[ts(type = "'SessionMeta'")]
  pub action: &'static str,
  pub plugins: Vec<PluginItem>,
  pub workspace_root: String,
  pub project_root: String,
  pub file: Option<String>,
}
