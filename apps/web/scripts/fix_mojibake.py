import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # apps/web

INCLUDE_EXT = {".ts", ".tsx", ".js", ".css", ".md", ".json"}


def should_skip(path: Path) -> bool:
    p = str(path).replace("\\", "/")
    return "/.next/" in p or "/node_modules/" in p


PATTERNS = [
    # Typical UTF-8 bytes decoded as Windows-1251 (Cyrillic mojibake)
    re.compile(r"(?:[\u0420\u0421][\u0400-\u04FF]){2,}"),
    # Typical UTF-8 bytes decoded as Windows-1251 (bullet/dash mojibake)
    re.compile(r"\u0432[\u0402\u2020][\u0400-\u04FF\u2019\u201D\u00A9]{1,}"),
    # "В©" -> "©"
    re.compile(r"\u0412\u00A9"),
]

BAD_MARKERS = ("\u0432\u0402", "\u0420", "\u0421")


def try_fix(segment: str) -> str | None:
    try:
        fixed = segment.encode("cp1251").decode("utf-8")
    except Exception:
        return None

    if any(m in fixed for m in BAD_MARKERS):
        return None

    return fixed


def fix_text(text: str) -> str:
    for _ in range(3):
        changed = False
        for pat in PATTERNS:
            def repl(m: re.Match[str]) -> str:
                nonlocal changed
                seg = m.group(0)
                fixed = try_fix(seg)
                if fixed is None or fixed == seg:
                    return seg
                changed = True
                return fixed

            text = pat.sub(repl, text)

        if not changed:
            break

    return text


def main() -> int:
    changed_files: list[str] = []

    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in INCLUDE_EXT or should_skip(path):
            continue

        try:
            original = path.read_text(encoding="utf-8")
        except Exception:
            # Skip binary or oddly-encoded files
            continue

        fixed = fix_text(original)
        if fixed != original:
            path.write_text(fixed, encoding="utf-8")
            changed_files.append(str(path.relative_to(ROOT)))

    if changed_files:
        print("Updated files:")
        for f in changed_files:
            print(f"- {f}")
    else:
        print("No mojibake patterns found.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
