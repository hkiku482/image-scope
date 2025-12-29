use std::path::{Path, PathBuf};

const ALLOWED_EXTENSIONS_LOWERCASE: &[&str] = &["jpeg", "jpg", "png", "gif", "webp"];

#[tauri::command]
pub fn get_path_items(base_path: &Path) -> Vec<PathBuf> {
    let entries = std::fs::read_dir(base_path)
        .map(|entries| {
            entries
                .filter_map(|entry| entry.ok().map(|e| e.path()))
                .collect()
        })
        .unwrap_or_else(|_| Vec::new());

    let allowed_entries = entries.into_iter().filter(|entry| {
        let extension = entry.extension().and_then(|ext| ext.to_str()).unwrap_or("");
        ALLOWED_EXTENSIONS_LOWERCASE.contains(&extension.to_lowercase().as_str())
    });

    let mut paths = allowed_entries.collect::<Vec<PathBuf>>();
    paths.sort_by(|a, b| {
        let a_str = a.to_string_lossy().to_string();
        let b_str = b.to_string_lossy().to_string();
        natord::compare(&a_str, &b_str)
    });
    paths
}
