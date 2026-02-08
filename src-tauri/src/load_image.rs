use std::path::Path;

use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};

#[tauri::command]
pub async fn get_image_base64(path: &Path) -> Result<String, String> {
    let kind = infer::get_from_path(path)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Could not determine file type".to_string())?;

    let mime = kind.mime_type();
    if mime != "image/jpeg" && mime != "image/png" && mime != "image/gif" && mime != "image/webp" {
        return Err(format!("Unsupported image type: {}", mime));
    }

    let bytes = tokio::fs::read(path).await.map_err(|e| e.to_string())?;
    let base64_str = general_purpose::STANDARD.encode(bytes);

    Ok(format!("data:{};base64,{}", mime, base64_str))
}
