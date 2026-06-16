{ ... }:
{
  name = "storm-software/powerlines-monorepo-template";

  dotenv.enable = true;
  dotenv.filename = [
    ".env"
    ".env.local"
  ];
  dotenv.disableHint = true;
}
