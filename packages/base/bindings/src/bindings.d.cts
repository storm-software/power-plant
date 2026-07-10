export type MaybePromise<T> = T | Promise<T>;
export type Nullable<T> = T | null | undefined;
type VoidNullable<T = void> = T | null | undefined | void;
export type BindingStringOrRegex = string | RegExp;
type BindingResult<T> =
  { errors: BindingError[]; isBindingErrors: boolean } | T;

export declare class BindingEngine {
  constructor(options: BindingOptions);
  getSettings(): Promise<BindingResult<BindingGetSettingsOutput>>;
  getSession(): Promise<BindingResult<BindingGetSessionOutput>>;
  store(input: BindingStoreInput): Promise<BindingResult<BindingStoreOutput>>;
  recall(
    input: BindingRecallInput
  ): Promise<BindingResult<BindingRecallOutput>>;
  search(
    input: BindingSearchInput
  ): Promise<BindingResult<BindingSearchOutput>>;
  close(): Promise<undefined>;
  get isClosed(): boolean;
}

export declare class TraceSubscriberGuard {
  close(): void;
}

export interface BindingDevice {
  name: string;
  displayName: string;
  platform: string;
  distro: string;
  desktopEnv: string;
  cpuArch: string;
}

export interface BindingEnvPaths {
  /** Path to the cache directory. */
  cache: string;
  /** Path to the configuration directory. */
  config: string;
  /** Path to the data directory. */
  data: string;
  /** Path to the log directory. */
  logs: string;
  /** Path to the temporary directory. */
  temp: string;
  /** Path to the downloads directory. */
  downloads: string;
  /** Path to the executable directory. */
  executable: string;
}

export type BindingError =
  | { type: "JsError"; field0: Error }
  | { type: "NativeError"; field0: NativeError };

export interface BindingErrors {
  errors: Array<BindingError>;
  isBindingErrors: boolean;
}

export interface BindingExecution {
  /** The documents of the execution. */
  documents: Array<BindingExecutionDocument>;
  /** The metadata of the execution. */
  meta: BindingExecutionMeta;
}

export interface BindingExecutionDocument {
  /** The path of the document. */
  path: string;
  /** The sources of the document. */
  source: Array<BindingExecutionSource>;
}

export interface BindingExecutionMeta {
  /** The id of the execution. */
  id: string;
  /** The date and time when the execution was performed. */
  executedAt: number;
  /** The user who performed the execution. */
  executedBy: string;
}

export interface BindingExecutionSearchHit {
  /** The id of the matching execution. */
  executionId: string;
  /** Relevance score when provided by the search backend. */
  score?: number;
  /** Short excerpt from the matched metadata, when available. */
  snippet?: string;
}

export interface BindingExecutionSource {
  /** The language of the generated source code. */
  language?: string;
  /** The content of the generated source code. */
  content: string;
  /** Metadata about how the source code was generated. */
  meta: BindingExecutionSourceMeta;
}

export interface BindingExecutionSourceMeta {
  /** The options used to generate the source code during the execution. */
  options: any;
  /** The specification used to generate the source code during the execution. */
  spec: any;
  /** The metadata of the generator used to generate the source code during the execution. */
  generator: BindingGeneratorMeta;
  /** The metadata of the schema used to generate the source code during the execution. */
  schema: BindingSchemaMeta;
  /** The metadata of the input used to generate the source code during the execution. */
  input: BindingInputMeta;
  /** The metadata of the output used to generate the source code during the execution. */
  output: BindingOutputMeta;
}

export interface BindingGeneratorMeta {
  /** A description of the generator's purpose or behavior. */
  description?: string;
}

export interface BindingGetSessionOutput {
  /** The current session. */
  session: BindingSession;
}

export interface BindingGetSettingsOutput {
  /** The loaded settings. */
  settings: BindingSettings;
}

export interface BindingInputMeta {
  /** A unique identifier for the component. */
  id: string;
  /** A human-readable name for the component. */
  name: string;
  /** The version of the component. */
  version: any;
  /** A description of the component. */
  description: string;
  /** A human-readable title for the component. */
  title: string;
  /** A description of when the component is used. */
  usage?: string;
  /** Deprecation information for the component. */
  deprecated?: any;
  /** Tags associated with the component. */
  tags?: Array<string>;
  /** Links associated with the component. */
  links: Array<any>;
  /** A description of how the specification is extracted or generated. */
  input?: string;
}

/** Represents a log entry in the Power Plant binding. */
export interface BindingLog {
  /** The log message. */
  message: string;
  /** The log code. */
  code?: string;
  /** Additional details about the log. */
  details?: string;
  /** The log level. */
  level: BindingLogLevel;
  /** The plugin that generated the log. */
  plugin?: string;
}

export declare const enum BindingLogLevel {
  Silent = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4
}

export declare const enum BindingMode {
  /** Development mode. */
  Development = 0,
  /** Production mode. */
  Production = 1,
  /** Test mode. */
  Test = 2
}

export interface BindingOptions {
  /** The mode. */
  mode?: "development" | "production" | "test";
  /** The username of the user currently using the application */
  username?: string;
  /** The log level. */
  logLevel?: "debug" | "info" | "warn" | "error" | "silent";
  /** Callback for log messages. */
  customLogger?: (
    logLevel: "debug" | "info" | "warn" | "error",
    log: BindingLog
  ) => Promise<void>;
  /** The current working directory. */
  cwd?: string;
  /** The repository root. */
  repositoryRoot?: string;
}

export interface BindingOutputMeta {
  /** A unique identifier for the component. */
  id: string;
  /** A human-readable name for the component. */
  name: string;
  /** The version of the component. */
  version: any;
  /** A description of the component. */
  description: string;
  /** A human-readable title for the component. */
  title: string;
  /** A description of when the component is used. */
  usage?: string;
  /** Deprecation information for the component. */
  deprecated?: any;
  /** Tags associated with the component. */
  tags?: Array<string>;
  /** Links associated with the component. */
  links: Array<any>;
  /** A description of what the output produces. */
  produces?: string;
}

export interface BindingRecallInput {
  /** The id of the execution to recall. */
  executionId: string;
}

export interface BindingRecallOutput {
  /** The recalled execution. */
  execution: BindingExecution;
}

export interface BindingSchemaMeta {
  /** A unique identifier for the component. */
  id: string;
  /** A human-readable name for the component. */
  name: string;
  /** The version of the component. */
  version: any;
  /** A description of the component. */
  description: string;
  /** A human-readable title for the component. */
  title: string;
  /** A description of when the component is used. */
  usage?: string;
  /** Deprecation information for the component. */
  deprecated?: any;
  /** Tags associated with the component. */
  tags?: Array<string>;
  /** Links associated with the component. */
  links: Array<any>;
  /** Examples of valid data for the schema. */
  examples: Array<any>;
}

export interface BindingSearchInput {
  /** Free-text query matched against indexed execution metadata. */
  query?: string;
  /** Filter by the user who performed the execution. */
  executedBy?: string;
  /** Filter by schema name or id. */
  schema?: string;
  /** Filter by generator name or id. */
  generator?: string;
  /** Filter by tags; an execution matches when any tag is present. */
  tags?: Array<string>;
  /** Optional embedding vector for semantic similarity search. */
  embedding?: Array<number>;
  /** Maximum number of results to return. */
  limit?: number;
}

export interface BindingSearchOutput {
  /** Matching executions ordered by relevance. */
  hits: Array<BindingExecutionSearchHit>;
}

export interface BindingSession {
  sessionId: string;
  startedAt: number;
  user: BindingUser;
  device: BindingDevice;
}

export interface BindingSettings {
  /** The app mode to use. */
  mode: "development" | "production" | "test";
  /** The default username to use. */
  defaultUser: string;
  /** The paths to use.`` */
  paths: {
    cache: string;
    config: string;
    data: string;
    logs: string;
    temp: string;
    downloads: string;
    executable: string;
  };
  /** The log level to use. */
  logLevel: "debug" | "info" | "warn" | "error" | "silent";
  /** Whether to skip storage. */
  skipStorage: boolean;
}

export interface BindingStoreInput {
  /** The execution that produced the input. */
  execution: BindingExecution;
}

export interface BindingStoreOutput {
  /** Whether the store operation was successful. */
  success: boolean;
  /** Any warnings encountered during the store operation. */
  errors: Array<string>;
}

export interface BindingUser {
  name: string;
  displayName: string;
  languagePreferences: Array<string>;
}

export declare function createTokioRuntime(
  blockingThreads?: number | undefined | null
): void;

export declare function initTraceSubscriber(): TraceSubscriberGuard | null;

/** Error emitted from native side, it only contains kind and message, no stack trace. */
export interface NativeError {
  kind: string;
  message: string;
}

/**
 * Shutdown the tokio runtime manually.
 *
 * This is required for the wasm target with `tokio_unstable` cfg.
 * In the wasm runtime, the `park` threads will hang there until the tokio::Runtime is shutdown.
 */
export declare function shutdownAsyncRuntime(): void;

/**
 * Start the async runtime manually.
 *
 * This is required when the async runtime is shutdown manually.
 * Usually it's used in test.
 */
export declare function startAsyncRuntime(): void;
