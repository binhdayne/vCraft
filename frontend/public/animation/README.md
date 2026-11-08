# Đông Hồ mouse procession

Derived from the user-supplied `gemini_generated_video_d9076fd7.mp4` for the homepage ground strip. The original remains unchanged in the user's Downloads folder and is not committed here.

- Source: 1280×720, 24fps, approximately 10 seconds, with audio.
- Selected interval: seconds 1–8, played at original speed; sampled at 18fps.
- Delivery: transparent animated WebP, 720×354, 126 frames, 7-second loop, no audio; still WebP for pause/reduced motion.
- Processing: crop the top label, remove the green screen and isolated sparkle, reduce green spill around outlines. Green clothing is retained.
- The CSS moves the transparent group across the page; the animation itself supplies the running legs and drum movement. Source character changes remain from the generated clip.

Rebuild from the repository root:

```powershell
npm.cmd install --prefix .local/font-audit-tools --no-audit --no-fund ffmpeg-static ffprobe-static
py -3.12 -m pip install --target .local/video-tools pillow numpy scipy
py -3.12 scripts/prepare-mice.py C:/path/to/source.mp4
npm.cmd run build:web
```

The renderer also creates a contact sheet in `.local/mice/`. Browser checks cover playback, pause/resume, mobile overflow, reduced-motion preference and offscreen suspension. Source metadata is recorded in `mice-source.json`.
