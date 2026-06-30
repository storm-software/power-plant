use crate::{IssueKindSwitcher, PowerPlantDiagnostic};

pub fn filter_out_disabled_diagnostics(
  diagnostics: Vec<PowerPlantDiagnostic>,
  switcher: &IssueKindSwitcher,
) -> impl Iterator<Item = PowerPlantDiagnostic> {
  diagnostics
    .into_iter()
    .filter(|d| switcher.contains(IssueKindSwitcher::from_bits_truncate(1 << d.kind() as u32)))
}
