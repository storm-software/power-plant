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
    debug = {
      extends = [
        "development"
      ];
      module = {
        languages.rust = {
          cranelift.enable = true;
          wild.enable = true;
        };
      };
    };

    release = {
      extends = [
        "production"
      ];
      module = {
        languages.rust = {
          lld.enable = false;
          cranelift.enable = false;
          wild.enable = false;
        };
      };
    };

    release-native = {
      extends = [
        "release"
      ];
      module = {
        languages.rust = {
          enable = true;
          channel = "nightly";
          components = [
            "rustc"
            "cargo"
            "rust-std"
          ];
        };
      };
    };

    release-native-musl = {
      extends = [
        "release-native"
      ];
      module = {

        packages = with pkgs; [
          cargo-zigbuild
        ];

        languages = {
          zig = {
            enable = true;
            lsp.enable = false;
          };
        };
      };
    };

    release-native-darwin = {
      extends = [
        "release-native"
      ];
      module = {
        languages.rust = {
          lld.enable = true;
        };
      };
    };
  };
}
