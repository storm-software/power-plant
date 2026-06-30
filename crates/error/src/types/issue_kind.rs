//! Naming convention:
//! - All kinds that will terminate the build process should be named with a postfix "Error".
use std::fmt::Display;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum IssueKind {
  // --- These kinds are copied from rollup: https://github.com/rollup/rollup/blob/0b665c31833525c923c0fc20f43ebfca748c6670/src/utils/logs.ts#L102-L179
  AmbiguousExternalNamespaceError = 0,
  /// Whether to emit warning when detecting circular dependency
  CircularDependency = 1,
  Eval = 2,
  IllegalIdentifierAsNameError = 3,
  InvalidExportOptionError = 4,
  InvalidOptionError = 5,
  MissingExportError = 6,
  MissingGlobalName = 7,
  MissingNameOptionForIifeExport = 8,
  MissingNameOptionForUmdExportError = 9,
  MixedExport = 10,
  ParseError = 11,
  UnresolvedEntry = 12,
  UnresolvedImport = 13,
  FilenameConflict = 14,
  // !! Only add new kind if it's not covered by the kinds from rollup !!

  // --- These kinds are derived from esbuild
  AssignToImportError = 15,
  CommonJsVariableInEsm = 16,
  ExportUndefinedVariableError = 17,
  ImportIsUndefined = 18,
  UnsupportedFeatureError = 19,
  EmptyImportMeta = 20,

  // --- These kinds are Power Plant specific
  JsonParseError = 21,
  IllegalReassignmentError = 22,
  InvalidDefineConfigError = 23,
  ResolveError = 24,
  UnhandleableError = 25,
  UnloadableDependencyError = 26,

  NapiError = 27,
  ConfigurationFieldConflict = 28,
  PreferBuiltinFeature = 29,
  BundlerInitializeError = 30,
  PluginError = 31,
  AlreadyClosedError = 32,
  CouldNotCleanDirectory = 33,

  // --- Route path indexing
  PathIsNotValidUtf8 = 34,
  UnableToReadFileName = 35,
  UnableToReadFile = 36,
  UnableToReadDir = 37,
  UnableToStripRootPrefix = 38,
}

impl Display for IssueKind {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      // --- Copied from rollup
      IssueKind::AmbiguousExternalNamespaceError => write!(f, "AMBIGUOUS_EXTERNAL_NAMESPACES"),
      IssueKind::CircularDependency => write!(f, "CIRCULAR_DEPENDENCY"),
      IssueKind::Eval => write!(f, "EVAL"),
      IssueKind::IllegalIdentifierAsNameError => write!(f, "ILLEGAL_IDENTIFIER_AS_NAME"),
      IssueKind::InvalidExportOptionError => write!(f, "INVALID_EXPORT_OPTION"),
      IssueKind::InvalidOptionError => write!(f, "INVALID_OPTION"),
      IssueKind::MixedExport => write!(f, "MIXED_EXPORT"),
      IssueKind::MissingGlobalName => write!(f, "MISSING_GLOBAL_NAME"),
      IssueKind::MissingNameOptionForIifeExport => {
        write!(f, "MISSING_NAME_OPTION_FOR_IIFE_EXPORT")
      }
      IssueKind::MissingNameOptionForUmdExportError => {
        write!(f, "MISSING_NAME_OPTION_FOR_UMD_EXPORT")
      }
      IssueKind::MissingExportError => write!(f, "MISSING_EXPORT"),
      IssueKind::ParseError => write!(f, "PARSE_ERROR"),
      IssueKind::UnresolvedEntry => write!(f, "UNRESOLVED_ENTRY"),
      IssueKind::UnresolvedImport => write!(f, "UNRESOLVED_IMPORT"),
      IssueKind::FilenameConflict => write!(f, "FILE_NAME_CONFLICT"),

      // --- Derived from esbuild
      IssueKind::AssignToImportError => write!(f, "ASSIGN_TO_IMPORT"),
      IssueKind::CommonJsVariableInEsm => write!(f, "COMMONJS_VARIABLE_IN_ESM"),
      IssueKind::ExportUndefinedVariableError => write!(f, "EXPORT_UNDEFINED_VARIABLE"),
      IssueKind::ImportIsUndefined => write!(f, "IMPORT_IS_UNDEFINED"),
      IssueKind::UnsupportedFeatureError => write!(f, "UNSUPPORTED_FEATURE"),
      IssueKind::EmptyImportMeta => write!(f, "EMPTY_IMPORT_META"),

      // --- Power Plant specific
      IssueKind::JsonParseError => write!(f, "JSON_PARSE"),
      IssueKind::IllegalReassignmentError => write!(f, "ILLEGAL_REASSIGNMENT"),
      IssueKind::InvalidDefineConfigError => write!(f, "INVALID_DEFINE_CONFIG"),
      IssueKind::ResolveError => write!(f, "RESOLVE_ERROR"),
      IssueKind::UnhandleableError => write!(f, "UNHANDLEABLE_ERROR"),
      IssueKind::UnloadableDependencyError => write!(f, "UNLOADABLE_DEPENDENCY"),

      IssueKind::NapiError => write!(f, "NAPI_ERROR"),
      IssueKind::ConfigurationFieldConflict => write!(f, "CONFIGURATION_FIELD_CONFLICT"),
      IssueKind::PreferBuiltinFeature => write!(f, "PREFER_BUILTIN_FEATURE"),
      IssueKind::BundlerInitializeError => write!(f, "BUNDLER_INITIALIZE_ERROR"),
      IssueKind::PluginError => write!(f, "PLUGIN_ERROR"),
      IssueKind::AlreadyClosedError => write!(f, "ALREADY_CLOSED"),
      IssueKind::CouldNotCleanDirectory => write!(f, "COULD_NOT_CLEAN_DIRECTORY"),

      // --- Route path indexing
      IssueKind::PathIsNotValidUtf8 => write!(f, "PATH_IS_NOT_VALID_UTF8"),
      IssueKind::UnableToReadFileName => write!(f, "UNABLE_TO_READ_FILE_NAME"),
      IssueKind::UnableToReadFile => write!(f, "UNABLE_TO_READ_FILE"),
      IssueKind::UnableToReadDir => write!(f, "UNABLE_TO_READ_DIR"),
      IssueKind::UnableToStripRootPrefix => write!(f, "UNABLE_TO_STRIP_ROOT_PREFIX"),
    }
  }
}
