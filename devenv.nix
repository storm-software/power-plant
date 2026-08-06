{ pkgs, ... }:
{
  # hdrhistogram_c 0.11.10 unconditionally references no-avx2-i386.patch in
  # nixpkgs, which breaks devenv shell evaluation on x86_64-linux CI when the
  # patch store path is missing from the binary cache.
  #   overlays = [
  #     (final: prev: {
  #       hdrhistogram_c = prev.hdrhistogram_c.overrideAttrs (old: {
  #         patches = lib.optionals final.stdenv.hostPlatform.isi686 (old.patches or [ ]);
  #       });
  #     })
  #   ];

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
}
