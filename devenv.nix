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
          enable = true;
          channel = "stable";
          components = [
            "rustc"
            "cargo"
            "rust-std"
          ];
          lld.enable = false;
          cranelift.enable = false;
          wild.enable = false;
        };
      };
    };

    release-std = {
      extends = [
        "release"
      ];
      module = {
        languages.rust = {
          enable = true;
          channel = "stable";
          components = [
            "rustc"
            "cargo"
            "rust-std"
            "rust-src"
          ];
        };
      };
    };

    release-musl = {
      extends = [
        "release"
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

    release-darwin = {
      extends = [
        "release"
      ];
      module = {
        languages.rust = {
          lld.enable = true;
        };
      };
    };

    release-darwin-x86_64 = {
      extends = [
        "release-darwin"
        "release-std"
      ];
      module = {
        languages.rust.targets = [ "x86_64-apple-darwin" ];
      };
    };

    release-linux-musl-x86_64 = {
      extends = [
        "release-musl"
        "release-std"
      ];
      module = {
        languages.rust.targets = [ "x86_64-unknown-linux-musl" ];
      };
    };

    release-linux-musl-aarch64 = {
      extends = [
        "release-musl"
        "release-std"
      ];
      module = {
        languages.rust.targets = [ "aarch64-unknown-linux-musl" ];
      };
    };

    release-linux-powerpc64le = {
      extends = [
        "release-std"
      ];
      module = {
        languages.rust.targets = [ "powerpc64le-unknown-linux-gnu" ];
      };
    };

    release-linux-gnueabihf-armv7 = {
      extends = [
        "release-std"
      ];
      module = {
        languages.rust.targets = [ "armv7-unknown-linux-gnueabihf" ];
      };
    };
  };
}
