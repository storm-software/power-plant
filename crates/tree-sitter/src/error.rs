use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PipelineError {
    NotFound,
    Cancelled,
    DiscoverFailed(i32),
    ExtractionFailed(i32),
    DumpFailed(i32),
    ArtifactExportFailed,
    InvalidProjectName,
    Other(String),
}

impl fmt::Display for PipelineError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound => write!(f, "pipeline resource not found"),
            Self::Cancelled => write!(f, "pipeline run cancelled"),
            Self::DiscoverFailed(rc) => write!(f, "file discovery failed (rc={rc})"),
            Self::ExtractionFailed(rc) => write!(f, "extraction phase failed (rc={rc})"),
            Self::DumpFailed(rc) => write!(f, "graph dump failed (rc={rc})"),
            Self::ArtifactExportFailed => write!(f, "artifact export failed"),
            Self::InvalidProjectName => write!(f, "invalid project name"),
            Self::Other(msg) => write!(f, "{msg}"),
        }
    }
}

impl std::error::Error for PipelineError {}

pub type PipelineResult<T> = Result<T, PipelineError>;
