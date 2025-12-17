#!/usr/bin/env python3
"""
Quick utility to split a sprite sheet of icons into individual PNGs with transparency.

Default grid: 4 columns x 2 rows (matches the provided sample). Override with CLI flags.

Usage:
  python main.py --input sheet.png --cols 4 --rows 2 --outdir ./icons

Optional background removal:
  The script samples edge pixels to find the checkerboard/solid background colors and
  makes them transparent with a configurable tolerance.
"""

from __future__ import annotations

import argparse
import os
from collections import Counter, deque
from typing import Iterable, List, Set, Tuple

from PIL import Image

Color = Tuple[int, int, int]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Split a grid image into transparent PNG icons."
    )
    parser.add_argument("--input", required=True, help="Path to the source grid image.")
    parser.add_argument("--outdir", default="icons", help="Where to write the icons.")
    parser.add_argument("--cols", type=int, default=4, help="Number of columns.")
    parser.add_argument("--rows", type=int, default=2, help="Number of rows.")
    parser.add_argument(
        "--tolerance",
        type=int,
        default=50,
        help="RGB distance threshold for background removal.",
    )
    parser.add_argument(
        "--no-flood",
        action="store_true",
        help="Disable edge flood-fill background removal (falls back to per-pixel match).",
    )
    parser.add_argument(
        "--keep-bg",
        action="store_true",
        help="Skip background removal (just crop).",
    )
    return parser.parse_args()


def load_image(path: str) -> Image.Image:
    return Image.open(path).convert("RGBA")


def dominant_edge_colors(img: Image.Image, sample_margin: int = 6, top_k: int = 4) -> List[Color]:
    w, h = img.size
    pixels = img.convert("RGB").load()
    samples: List[Color] = []

    # sample thin borders to capture background/checker colors
    for x in range(w):
        for y in range(sample_margin):
            samples.append(pixels[x, y])
            samples.append(pixels[x, h - 1 - y])
    for y in range(h):
        for x in range(sample_margin):
            samples.append(pixels[x, y])
            samples.append(pixels[w - 1 - x, y])

    counts = Counter(samples)
    return [color for color, _ in counts.most_common(top_k)]


def within_tolerance(a: Color, b: Color, tol: int) -> bool:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5 <= tol


def flood_fill_transparent(img: Image.Image, seed_colors: Iterable[Color], tol: int) -> Image.Image:
    """Flood fill from edges for colors matching the background; safer for icons with dark strokes."""
    bg_list = list(seed_colors)
    if not bg_list:
        return img

    w, h = img.size
    pixels = img.load()
    visited: Set[Tuple[int, int]] = set()
    q = deque()

    # enqueue border pixels
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
        if any(within_tolerance((r, g, b), bg, tol) for bg in bg_list):
            pixels[x, y] = (r, g, b, 0)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    q.append((nx, ny))
    return img


def remove_background(img: Image.Image, bg_colors: Iterable[Color], tol: int, use_flood: bool) -> Image.Image:
    bg_list = list(bg_colors)
    if not bg_list:
        return img

    if use_flood:
        return flood_fill_transparent(img.copy(), bg_list, tol)

    data = img.getdata()
    out = []
    for pixel in data:
        r, g, b, a = pixel
        if a == 0:
            out.append(pixel)
            continue
        if any(within_tolerance((r, g, b), bg, tol) for bg in bg_list):
            out.append((r, g, b, 0))
        else:
            out.append((r, g, b, a))
    img_out = Image.new("RGBA", img.size)
    img_out.putdata(out)
    return img_out


def slice_grid(img: Image.Image, cols: int, rows: int) -> List[Image.Image]:
    w, h = img.size
    tile_w, tile_h = w // cols, h // rows
    tiles = []
    for r in range(rows):
        for c in range(cols):
            box = (c * tile_w, r * tile_h, (c + 1) * tile_w, (r + 1) * tile_h)
            tiles.append(img.crop(box))
    return tiles


def main() -> None:
    args = parse_args()
    os.makedirs(args.outdir, exist_ok=True)

    img = load_image(args.input)
    if args.keep_bg:
        processed = img
    else:
        bg_colors = dominant_edge_colors(img)
        processed = remove_background(img, bg_colors, args.tolerance, use_flood=not args.no_flood)

    tiles = slice_grid(processed, args.cols, args.rows)
    digits = len(str(len(tiles) - 1))
    for idx, tile in enumerate(tiles):
        name = f"icon_{idx:0{digits}d}.png"
        tile.save(os.path.join(args.outdir, name))

    print(f"Saved {len(tiles)} icons to {os.path.abspath(args.outdir)}")


if __name__ == "__main__":
    main()
