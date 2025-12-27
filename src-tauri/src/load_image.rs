use std::fs;
use std::path::Path;

use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};

fn is_jpeg_or_png(path: &Path) -> bool {
    infer::get_from_path(path)
        .ok()
        .flatten()
        .map(|kind| kind.mime_type() == "image/jpeg" || kind.mime_type() == "image/png")
        .unwrap_or(false)
}

#[tauri::command]
pub fn get_image_base64(path: &Path) -> Result<String, String> {
    if !is_jpeg_or_png(path) {
        return Err("File is not a valid JPEG or PNG image".to_string());
    }
    let bytes = fs::read(path).map_err(|e| e.to_string())?;
    let base64_str = general_purpose::STANDARD.encode(bytes);
    Ok(base64_str)
}
