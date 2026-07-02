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

  scripts = {
    build-native.exec = "pnpm build-native --target=$1 --buildFlags=$2";
  };

  profiles = {
    native.module = {
      languages.rust = {
        enable = true;
        channel = "nightly";
        components = [
          "rustc"
          "cargo"
        ];
      };
    };

    native-linux.module = {
      extends = [
        "native"
      ];

      languages.rust = {
        cranelift.enable = true;
        wild.enable = true;
      };
    };

    native-linux-musl.module = {
      extends = [
        "native-linux"
      ];

      packages = with pkgs; [
        cargo-zigbuild
      ];

      languages = {
        zig = {
          enable = true;
          lsp.enable = false;
        };
        rust = {
          components = [
            "rustc"
            "cargo"
            "cargo-zigbuild"
          ];
        };
      };
    };

    native-darwin.module = {
      extends = [
        "native"
      ];
      languages.rust = {
        lld.enable = true;
      };
    };
  };
}
