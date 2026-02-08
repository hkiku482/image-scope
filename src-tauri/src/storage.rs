use std::path::{Path, PathBuf};

const ALLOWED_EXTENSIONS_LOWERCASE: &[&str] = &["jpeg", "jpg", "png", "gif", "webp"];

#[derive(serde::Serialize)]
pub struct PathItem {
    pub is_directory: bool,
    pub path: PathBuf,
}

#[tauri::command]
pub async fn get_path_items(base_path: &Path) -> Result<Vec<PathItem>, String> {
    let base_path = if base_path.is_dir() {
        base_path.to_path_buf()
    } else {
        base_path.parent().unwrap_or(base_path).to_path_buf()
    };

    let mut dir = match tokio::fs::read_dir(base_path).await {
        Ok(dir) => dir,
        Err(_) => return Ok(Vec::new()),
    };

    let mut items = Vec::new();
    while let Ok(Some(entry)) = dir.next_entry().await {
        let path = entry.path();
        let is_directory = tokio::fs::metadata(&path)
            .await
            .map(|meta| meta.is_dir())
            .unwrap_or(false);

        if is_directory {
            items.push(PathItem { is_directory, path });
            continue;
        }

        let extension = path.extension().and_then(|ext| ext.to_str()).unwrap_or("");
        if ALLOWED_EXTENSIONS_LOWERCASE.contains(&extension.to_lowercase().as_str()) {
            items.push(PathItem { is_directory, path });
        }
    }

    items.sort_by(|a, b| {
        // ディレクトリを優先
        match b.is_directory.cmp(&a.is_directory) {
            std::cmp::Ordering::Equal => {
                let a_str = a.path.to_string_lossy().to_string();
                let b_str = b.path.to_string_lossy().to_string();
                natord::compare(&a_str, &b_str)
            }
            ord => ord,
        }
    });
    Ok(items)
}

#[tauri::command]
pub async fn get_parent_path(path: &Path) -> Result<PathBuf, String> {
    Ok(match path.parent() {
        Some(parent) => parent.to_path_buf(),
        None => path.to_path_buf(), // すでにルートの場合はそのまま返す
    })
}
