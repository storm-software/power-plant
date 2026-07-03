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

    release-native-std = {
      extends = [
        "release-native"
      ];
      module = {
        languages.rust = {
          enable = true;
          channel = "nightly";
          components = [
            "rustc"
            "cargo"
            "rust-std"
            "rust-src"
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

    release-native-darwin-x86_64 = {
      extends = [
        "release-native-darwin"
        "release-native-std"
      ];
      module = {
        languages.rust.targets = [ "x86_64-apple-darwin" ];
      };
    };

    release-native-linux-musl-x86_64 = {
      extends = [
        "release-native-musl"
        "release-native-std"
      ];
      module = {
        languages.rust.targets = [ "x86_64-unknown-linux-musl" ];
      };
    };

    release-native-linux-musl-aarch64 = {
      extends = [
        "release-native-musl"
        "release-native-std"
      ];
      module = {
        languages.rust.targets = [ "aarch64-unknown-linux-musl" ];
      };
    };

    release-native-linux-powerpc64le = {
      extends = [
        "release-native-std"
      ];
      module = {
        languages.rust.targets = [ "powerpc64le-unknown-linux-gnu" ];
      };
    };

    release-native-linux-gnueabihf-armv7 = {
      extends = [
        "release-native-std"
      ];
      module = {
        languages.rust.targets = [ "armv7-unknown-linux-gnueabihf" ];
      };
    };
  };
}
