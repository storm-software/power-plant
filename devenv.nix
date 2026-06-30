{ pkgs, ... }:
{
  name = "storm-software/power-plant";

  dotenv.enable = true;
  dotenv.filename = [
    ".env"
    ".env.local"
  ];
  dotenv.disableHint = true;

  packages = with pkgs; [
    sccache
  ];

  languages.rust = {
    targets = [
      "x86_64-unknown-linux-gnu"
      "wasm32-wasip1-threads"
    ];
  };
}
