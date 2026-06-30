#![allow(missing_docs)]

fn main() {
  println!("cargo::rustc-check-cfg=cfg(tokio_unstable)");

  static_vcruntime::metabuild();
  napi_build::setup();

  // Embed Windows resource metadata to establish binary legitimacy
  // and reduce false positive detections from security software
  #[cfg(windows)]
  {
    let mut res = winres::WindowsResource::new();
    res
      .set("ProductName", "Power Plant")
      .set(
        "FileDescription",
        "Power Plant Native Module - Text generation that gives your AI superpowers",
      )
      .set("CompanyName", "Storm Software")
      .set("LegalCopyright", "Copyright (c) Storm Software. MIT License.")
      .set("OriginalFilename", "power-plant.node")
      .set("InternalName", "power-plant");

    if let Err(e) = res.compile() {
      // Don't fail the build if resource compilation fails
      // (e.g., when cross-compiling from non-Windows)
      eprintln!("cargo:warning=Failed to compile Windows resources: {}", e);
    }
  }
}
