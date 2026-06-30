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
    cargo-zigbuild
  ];

  scripts = {
    build-native.exec = "pnpm build-native --target=$1 --buildFlags=$2";
  };

  languages = {
    zig = {
      enable = true;
      lsp.enable = false;
    };
  };
}
