#!/usr/bin/env python3
"""Rebuild fonts/jost-*.woff2 from Google Fonts' variable Jost.

The files keep the OpenType features the site uses:
- ss01: the Futura-style single-story "a" (turned on in base.css),
- tnum: lined-up numbers (.bv-num),
- kern.

Usage (needs fonttools and brotli: pip install fonttools brotli):

    curl -LO "https://raw.githubusercontent.com/google/fonts/main/ofl/jost/Jost%5Bwght%5D.ttf"
    python3 scripts/build_fonts.py "Jost[wght].ttf"

The unicode ranges match the @font-face rules in base.css. Change both
together.
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS = Path(__file__).resolve().parent.parent / "fonts"
WEIGHTS = (400, 500, 600, 700)
FEATURES = ["kern", "ss01", "tnum"]

# Same ranges as base.css.
RANGES = {
    "latin": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, "
    "U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, "
    "U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
}


def codepoints(ranges: str) -> list[int]:
    out = []
    for part in ranges.split(","):
        part = part.strip().removeprefix("U+")
        lo, _, hi = part.partition("-")
        out.extend(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


def build(source: Path) -> None:
    options = subset.Options()
    options.layout_features = FEATURES
    for weight in WEIGHTS:
        for name, ranges in RANGES.items():
            # Subsetting changes the font in place, so each file starts fresh.
            font = instantiateVariableFont(TTFont(source), {"wght": weight}, updateFontNames=True)
            sub = subset.Subsetter(options)
            sub.populate(unicodes=codepoints(ranges))
            sub.subset(font)
            font.flavor = "woff2"
            out = FONTS / f"jost-{name}-{weight}-normal.woff2"
            font.save(out)
            print(f"{out.name}: {out.stat().st_size:,} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    build(Path(sys.argv[1]))
