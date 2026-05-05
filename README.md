# Image Scope

Simple image viewer made with Tauri 2.0

## Build

- Bun
- Rustup

```
$ bun tauri build
```

### Windows

If the build is blocked by Windows application control policy while running
Rust build scripts from `src-tauri/target`, set `CARGO_TARGET_DIR` to a
temporary directory before building.

```powershell
$env:CARGO_TARGET_DIR="$env:TEMP\image-scope-tauri-target"
bun run tauri build
```

The generated installers are written under:

```txt
%TEMP%\image-scope-tauri-target\release\bundle\
```

```powershell
& "$env:TEMP\image-scope-tauri-target\release\bundle\nsis\Image Scope_0.1.0_x64-setup.exe"
```

## Usage

- Drop an image file or folder into the window to open it.
- Use the sidebar to browse folders and select images.
- Use the arrow keys or toolbar buttons to move to the previous/next image.
- Drag with the left mouse button to pan the image.
- Use the mouse wheel to zoom in/out.
- Double-click the image to reset zoom and pan.
- Right-click the image to pick a color and show the color palette.
- Toggle **GrayScale** in the status bar to display the image in grayscale.
- Toggle **Dynamic** in the status bar to update the palette while hovering over image pixels.
- Press `G` to toggle GrayScale.
- Press `D` to toggle Dynamic.
