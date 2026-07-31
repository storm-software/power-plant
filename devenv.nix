{ inputs, pkgs, ... }:
{
  name = "storm-software/power-plant";

  dotenv.enable = true;
  dotenv.filename = [
    ".env"
    ".env.local"
  ];
  dotenv.disableHint = true;

  packages = with pkgs; [
    capnproto
  ];

  env = {
    CAPNP_HOME = "${pkgs.capnproto}/share/capnproto";
  };
}
