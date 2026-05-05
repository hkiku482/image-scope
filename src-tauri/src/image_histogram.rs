use std::path::PathBuf;

#[derive(serde::Serialize)]
pub struct ImageRgbHistogram {
    pub red: Vec<u64>,
    pub green: Vec<u64>,
    pub blue: Vec<u64>,
    pub pixel_count: u64,
}

#[tauri::command]
pub async fn get_image_rgb_histogram(path: PathBuf) -> Result<ImageRgbHistogram, String> {
    tokio::task::spawn_blocking(move || {
        let image = image::ImageReader::open(&path)
            .map_err(|e| e.to_string())?
            .with_guessed_format()
            .map_err(|e| e.to_string())?
            .decode()
            .map_err(|e| e.to_string())?
            .to_rgba8();

        let mut red = vec![0; 256];
        let mut green = vec![0; 256];
        let mut blue = vec![0; 256];
        let mut pixel_count = 0;

        for pixel in image.pixels() {
            let [r, g, b, a] = pixel.0;
            if a == 0 {
                continue;
            }

            red[r as usize] += 1;
            green[g as usize] += 1;
            blue[b as usize] += 1;
            pixel_count += 1;
        }

        Ok(ImageRgbHistogram {
            red,
            green,
            blue,
            pixel_count,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}
