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

    release-unix = {
      extends = [
        "release"
      ];
      module = {
        packages = with pkgs; [
          gcc
          glibc
          gnumake
          cmake
        ];
      };
    };

    release-cross = {
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
        "release-unix"
      ];
      module = {
        env = {
          NIXPKGS_ALLOW_UNSUPPORTED_SYSTEM = "1";
        };
        languages.rust.targets = [ "x86_64-apple-darwin" ];
      };
    };

    release-linux-musl-x86_64 = {
      extends = [
        "release-cross"
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "x86_64-unknown-linux-musl" ];
      };
    };

    release-linux-gnu-x86_64 = {
      extends = [
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "x86_64-unknown-linux-gnu" ];
      };
    };

    release-linux-gnu-aarch64 = {
      extends = [
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "aarch64-unknown-linux-gnu" ];
      };
    };

    release-linux-musl-aarch64 = {
      extends = [
        "release-cross"
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "aarch64-unknown-linux-musl" ];
      };
    };

    release-linux-gnueabihf-armv7 = {
      extends = [
        "release-cross"
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "armv7-unknown-linux-gnueabihf" ];
      };
    };

    release-linux-android-aarch64 = {
      extends = [
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "aarch64-linux-android" ];
      };
    };

    release-linux-android-armv7 = {
      extends = [
        "release-unix"
      ];
      module = {
        languages.rust.targets = [ "armv7-linux-androideabi" ];
      };
    };
  };
}
