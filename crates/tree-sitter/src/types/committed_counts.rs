/// Committed graph size captured at dump time (-1 when dump did not run).
#[derive(Debug, Clone, Copy, Default)]
pub struct CommittedCounts {
  pub nodes: i32,
  pub edges: i32,
}

impl CommittedCounts {
  pub const UNSET: Self = Self { nodes: -1, edges: -1 };
}
