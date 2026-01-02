use std::path::{Path, PathBuf};

const ALLOWED_EXTENSIONS_LOWERCASE: &[&str] = &["jpeg", "jpg", "png", "gif", "webp"];

#[derive(serde::Serialize)]
pub struct PathItem {
    pub is_directory: bool,
    pub path: PathBuf,
}

#[tauri::command]
pub fn get_path_items(base_path: &Path) -> Vec<PathItem> {
    let entries = std::fs::read_dir(base_path)
        .map(|entries| {
            entries
                .filter_map(|entry| entry.ok().map(|e| e.path()))
                .collect()
        })
        .unwrap_or_else(|_| Vec::new());

    let allowed_entries = entries.into_iter().filter(|entry| {
        if entry.is_dir() {
            return true;
        }
        let extension = entry.extension().and_then(|ext| ext.to_str()).unwrap_or("");
        ALLOWED_EXTENSIONS_LOWERCASE.contains(&extension.to_lowercase().as_str())
    });

    let mut items = allowed_entries
        .map(|path| PathItem {
            is_directory: path.is_dir(),
            path,
        })
        .collect::<Vec<PathItem>>();

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
    items
}

#[tauri::command]
pub fn get_parent_path(path: &Path) -> PathBuf {
    match path.parent() {
        Some(parent) => parent.to_path_buf(),
        None => path.to_path_buf(), // すでにルートの場合はそのまま返す
    }
}
