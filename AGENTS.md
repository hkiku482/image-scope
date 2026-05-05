# AGENTS.md

## Project Overview

Image Scope is a Tauri 2 + React 19 + Vite image viewer. The main UI lives in
`src/features`, shared UI building blocks live in `src/components`, and Tauri
API helpers live in `src/lib/tauri-api.ts`.

Use Bun for JavaScript commands. The important scripts are:

- `bun run dev` starts Vite.
- `bun run build` runs `tsc && vite build`.
- `bun run tauri build` builds the desktop app.

## Component Boundaries

- Keep `src/components` generic. Components here must not import from
  `src/features` or know about image-viewer domain concepts such as paths,
  resolution, zoom, color picker mode, or selected image state.
- Put reusable layout shells in `src/components/layout`. Existing examples are
  `AppFrame`, `AppBody`, `InlineField`, `SidebarPanel`, `FloatingCorner`,
  `EmptyState`, and `FloatingPanel`.
- Prefer composition over feature-specific composite widgets. For example,
  status bar switches are built from `InlineField`, `Kbd`, `Text`, and `Switch`
  instead of a dedicated `SwitchField`.
- Keep feature components in `src/features/components` focused on wiring
  feature state, domain labels, and event handlers into generic components.
- If a feature component contains reusable markup for a list row, floating
  panel, metric badge, text style, button with tooltip, or layout wrapper,
  move that markup to `src/components` or `src/components/layout`.

## UI And Styling Rules

- Use Tailwind utility classes and the theme tokens defined in `src/App.css`.
- Use `cn` from `src/lib/utils.ts` for class merging whenever a component accepts
  `className`.
- Use lucide-react icons for icon buttons and visual affordances.
- Preserve compact desktop-tool styling: dense bars, restrained colors, small
  controls, and predictable scan-friendly layouts.
- Keep existing UI behavior and labels stable unless the task explicitly asks
  for a user-facing change.
- Avoid adding barrel exports or path aliases; current imports are relative.

## State And Data Flow

- `src/features/AppShell.tsx` composes the viewer and owns cross-feature state
  such as grayscale, scale, and selected image resolution.
- `useImageViewer` owns file/folder loading and selection state.
- `useViewportTransform` owns pan/zoom interaction state.
- `useColorPicker` owns hover/picked color state and dynamic color mode.
- Canvas drawing and pixel sampling stay near the viewport/color feature code
  unless there is a clear reusable utility boundary.

## Verification

- Run `bun run build` after TypeScript or React changes.
- For targeted formatting/linting, run Biome on the files you touched, e.g.
  `bunx biome check --write src/features/components/Foo.tsx`.
- Be aware that `bunx biome check src` currently reports existing issues in
  `src/App.css` because Biome is not configured for Tailwind `@theme` parsing,
  and it may also report repository-wide formatting noise. Do not treat those
  pre-existing diagnostics as part of an unrelated change.

## Build Notes

On Windows, if Tauri/Rust build scripts are blocked under `src-tauri/target`,
use a temporary Cargo target directory:

```powershell
$env:CARGO_TARGET_DIR="$env:TEMP\image-scope-tauri-target"
bun run tauri build
```

