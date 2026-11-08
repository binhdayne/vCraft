"""Extract user-supplied green-screen footage into transparent web assets.

Run: py -3.12 scripts/prepare-mice.py path/to/source.mp4
Dependencies are kept in .local/video-tools; original video is never modified.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.local/video-tools'))
import numpy as np
from PIL import Image
from scipy import ndimage

FFMPEG = ROOT / '.local/font-audit-tools/node_modules/ffmpeg-static/ffmpeg.exe'
SOURCE = Path(sys.argv[1]).resolve()
DEST = ROOT / 'frontend/public/animation'
TEMP = ROOT / '.local/mice'
DEST.mkdir(parents=True, exist_ok=True)
TEMP.mkdir(parents=True, exist_ok=True)
# Discard the opening painting transition and top-edge label. Retain natural speed.
WIDTH, HEIGHT, FPS = 720, 354, 18
command = [str(FFMPEG), '-hide_banner', '-loglevel', 'error', '-ss', '1',
           '-i', str(SOURCE), '-t', '7', '-vf',
           f'crop=1280:630:0:80,fps={FPS},scale={WIDTH}:{HEIGHT}',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']
process = subprocess.Popen(command, stdout=subprocess.PIPE)
frames = []
size = WIDTH * HEIGHT * 3
while True:
    data = process.stdout.read(size)
    if not data:
        break
    if len(data) != size:
        raise RuntimeError('Incomplete decoded frame')
    rgb = np.frombuffer(data, dtype=np.uint8).reshape(HEIGHT, WIDTH, 3).copy()
    color = rgb.astype(np.float32)
    dominance = color[:, :, 1] - np.maximum(color[:, :, 0], color[:, :, 2])
    alpha = np.clip((70 - dominance) / 30, 0, 1)
    # Keep the darker green clothing; remove isolated pale-green watermark sparkle.
    labels, _ = ndimage.label(alpha > .45)
    counts = np.bincount(labels.ravel())
    keep = counts >= 190
    keep[0] = False
    mask = ndimage.binary_dilation(keep[labels], iterations=1)
    alpha *= mask
    # Remove green spill from partially transparent antialiased outlines.
    edge = (alpha > 0) & (alpha < 1)
    color[:, :, 1] = np.where(edge, np.minimum(color[:, :, 1], np.maximum(color[:, :, 0], color[:, :, 2]) + 12), color[:, :, 1])
    rgba = np.dstack((np.clip(color, 0, 255).astype(np.uint8), (alpha * 255).astype(np.uint8)))
    frames.append(Image.fromarray(rgba))
if process.wait() != 0 or not frames:
    raise RuntimeError('Video decode failed')
durations = [round((i + 1) * 1000 / FPS) - round(i * 1000 / FPS) for i in range(len(frames))]
frames[0].save(DEST / 'mice-running.webp', save_all=True, append_images=frames[1:],
               duration=durations, loop=0, quality=83, method=5, minimize_size=True)
frames[18].save(DEST / 'mice-still.webp', quality=90, method=5)
# Review frames on the exact page background; alpha is retained in delivery assets.
sheet = Image.new('RGB', (WIDTH * 2, HEIGHT * 3), '#f7f3e9')
for i, index in enumerate([0, 18, 42, 66, 90, len(frames)-1]):
    frame = frames[index]
    sheet.paste(frame, ((i % 2) * WIDTH, (i // 2) * HEIGHT), frame)
sheet.save(TEMP / 'keyed-contact.png')
manifest = {'source': SOURCE.name, 'sourceRangeSeconds': [1,8],
            'fps': FPS, 'frames': len(frames), 'durationMs': sum(durations),
            'size': [WIDTH,HEIGHT], 'audio': False,
            'processing': 'Top-edge logo crop, chroma key, isolated sparkle removal, edge despill',
            'output': 'mice-running.webp', 'bytes': (DEST/'mice-running.webp').stat().st_size}
(DEST/'mice-source.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print(json.dumps(manifest))
