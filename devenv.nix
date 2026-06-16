{ ... }:
{
  name = "storm-software/power-plant";

  dotenv.enable = true;
  dotenv.filename = [
    ".env"
    ".env.local"
  ];
  dotenv.disableHint = true;
}
