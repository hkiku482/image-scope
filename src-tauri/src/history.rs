use std::path::PathBuf;

use tauri::path::BaseDirectory;
use tauri::Manager;

const HISTORY_FILE_NAME: &str = "history.txt";

fn get_history_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    app_handle
        .path()
        .resolve(HISTORY_FILE_NAME, BaseDirectory::AppData)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_history(app_handle: tauri::AppHandle, path: PathBuf) -> Result<(), String> {
    let history_path = get_history_path(&app_handle)?;

    // 親ディレクトリ（AppData）が存在することを確認
    if let Some(parent) = history_path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;
    }

    // パスを文字列として保存
    tokio::fs::write(&history_path, path.to_string_lossy().as_bytes())
        .await
        .map_err(|e| format!("履歴ファイルの書き込みに失敗しました: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn read_history(app_handle: tauri::AppHandle) -> Result<PathBuf, String> {
    let history_path = get_history_path(&app_handle)?;

    // 読み込みを試行
    match tokio::fs::read_to_string(&history_path).await {
        Ok(content) => {
            let path_str = content.trim();
            Ok(PathBuf::from(path_str))
        }
        Err(_) => {
            // エラーが発生した場合（ファイルがない、読み込めない等）、
            // ファイルを再生成（空で作成）して再度読み込みを試みる
            if let Some(parent) = history_path.parent() {
                let _ = tokio::fs::create_dir_all(parent).await;
            }

            match tokio::fs::write(&history_path, "").await {
                Ok(_) => Ok(PathBuf::new()),
                Err(e) => Err(format!("履歴ファイルの再生成に失敗しました: {}", e)),
            }
        }
    }
}
