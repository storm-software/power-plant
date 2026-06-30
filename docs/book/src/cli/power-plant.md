# power-plant

The verbosity settings for the cli

```bash
$ power-plant --help
Usage: power-plant [OPTIONS] <COMMAND>

Commands:
  run   Run power-plant
  db    power-plant database commands
  help  Print this message or the help of the given subcommand(s)

Options:
      --power-plant-db-path <POWER_PLANT_DB_PATH>
          path to the power-plant libmdbx db

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version

Display:
  -v, --verbosity...
          Set the minimum log level.

          -v      Errors
          -vv     Warnings
          -vvv    Info
          -vvvv   Debug
          -vvvvv  Traces (warning: very verbose!)

      --quiet
          Silence all log output

      --metrics-port <METRICS_PORT>
          [default: 6923]

      --skip-prometheus
```
