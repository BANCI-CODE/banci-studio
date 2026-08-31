"""Build the unified, data-driven AKU content layer.

The script never modifies source/detail artwork. It creates lightweight WebP
thumbnails and JSON manifests consumed by the public site.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
CONTENT_DIR = SITE / "content" / "aku"
THUMB_ROOT = SITE / "aku-thumbs"

DAILY_SOURCE = SITE / "aku-archive.json"
EXPERIENCE_SOURCE = SITE / "aku-experience.json"

MINIMUM_TOTAL_DAYS = 365
THUMB_WIDTH = 480
THUMB_QUALITY = 70


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def build_thumb(source: Path, destination: Path) -> tuple[int, int]:
    if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
        with Image.open(destination) as image:
            return image.size

    with Image.open(source) as image:
        image = image.convert("RGB")
        target_height = round(image.height * THUMB_WIDTH / image.width)
        image.thumbnail((THUMB_WIDTH, target_height), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(
            destination,
            format="WEBP",
            quality=THUMB_QUALITY,
            method=6,
            optimize=True,
        )
        return image.size


def source_path(public_path: str) -> Path:
    return SITE / public_path.lstrip("/")


def build_daily(
    source_items: list[dict[str, Any]], current_day: int
) -> tuple[list[dict[str, Any]], list[int]]:
    by_day = {int(item["day"]): item for item in source_items}
    items: list[dict[str, Any]] = []
    missing: list[int] = []

    for day in range(1, current_day + 1):
        source_item = by_day.get(day, {})
        detail = SITE / "aku-archive" / f"day-{day:03d}.webp"
        thumb = THUMB_ROOT / "daily" / f"day-{day:03d}.webp"
        has_art = detail.exists()
        thumb_width, thumb_height = build_thumb(detail, thumb) if has_art else (0, 0)
        if not has_art:
            missing.append(day)

        items.append(
            {
                "day": day,
                "date": source_item.get("date", ""),
                "title": source_item.get("title", "作品整理中"),
                "story": source_item.get("story", ""),
                "week": int(source_item.get("week", (day - 1) // 7 + 1)),
                "thumb": f"/aku-thumbs/daily/day-{day:03d}.webp" if has_art else "",
                "detail": f"/aku-archive/day-{day:03d}.webp" if has_art else "",
                "thumbWidth": thumb_width,
                "thumbHeight": thumb_height,
            }
        )

    return items, missing


def build_calendar(source_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    items = []
    for source_item in source_items:
        month = int(source_item["month"])
        detail_path = str(source_item["src"])
        detail = source_path(detail_path)
        thumb = THUMB_ROOT / "calendar" / f"month-{month:02d}.webp"
        thumb_width, thumb_height = build_thumb(detail, thumb)
        items.append(
            {
                "month": month,
                "year": int(source_item.get("year", 2025)),
                "title": source_item.get("title", f"{month}月"),
                "thumb": f"/aku-thumbs/calendar/month-{month:02d}.webp",
                "detail": detail_path,
                "thumbWidth": thumb_width,
                "thumbHeight": thumb_height,
            }
        )
    return items


def build_pins(source_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    items = []
    for index, source_item in enumerate(source_items, start=1):
        detail_path = str(source_item["src"])
        detail = source_path(detail_path)
        thumb = THUMB_ROOT / "pins" / f"pin-{index:03d}.webp"
        thumb_width, thumb_height = build_thumb(detail, thumb)
        items.append(
            {
                "id": f"pin-{index:03d}",
                "title": source_item.get("title", f"PIN {index:03d}"),
                "thumb": f"/aku-thumbs/pins/pin-{index:03d}.webp",
                "detail": detail_path,
                "thumbWidth": thumb_width,
                "thumbHeight": thumb_height,
            }
        )
    return items


def main() -> None:
    daily_source = json.loads(DAILY_SOURCE.read_text(encoding="utf-8"))
    experience_source = json.loads(EXPERIENCE_SOURCE.read_text(encoding="utf-8"))

    daily_source_items = daily_source.get("items", [])
    current_day = max((int(item["day"]) for item in daily_source_items), default=0)
    total_days = max(MINIMUM_TOTAL_DAYS, current_day)
    daily, missing_days = build_daily(daily_source_items, current_day)
    calendar = build_calendar(experience_source.get("months", []))
    pins = build_pins(experience_source.get("pins", []))

    config = {
        "version": 1,
        "totalDays": total_days,
        "currentDay": current_day,
        "manifests": {
            "daily": "/content/aku/aku-daily.json",
            "calendar": "/content/aku/aku-calendar.json",
            "pins": "/content/aku/aku-pins.json",
        },
        "loading": {
            "initial": "current-only",
            "adjacentPreload": 1,
            "pinBatchMobile": 16,
            "pinBatchDesktop": 24,
        },
    }

    write_json(CONTENT_DIR / "aku-config.json", config)
    write_json(CONTENT_DIR / "aku-daily.json", daily)
    write_json(CONTENT_DIR / "aku-calendar.json", calendar)
    write_json(CONTENT_DIR / "aku-pins.json", pins)

    thumb_files = [
        path
        for collection in ("daily", "calendar", "pins")
        for path in (THUMB_ROOT / collection).glob("*.webp")
    ]
    print(
        json.dumps(
            {
                "daily": len(daily),
                "calendar": len(calendar),
                "pins": len(pins),
                "missingDaily": missing_days,
                "thumbFiles": len(thumb_files),
                "thumbBytes": sum(path.stat().st_size for path in thumb_files),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
