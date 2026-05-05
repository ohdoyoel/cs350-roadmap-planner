import argparse
import asyncio
import json
import os
from pathlib import Path

from db.client import close_database, init_database, load_dotenv
from db.models.course import Course


BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATA_FILE = BACKEND_DIR / "data" / "courses.json"


def configure_mongodb_uri_for_seed() -> None:
    load_dotenv()
    mongodb_uri = os.getenv("MONGODB_URI")
    if mongodb_uri is None or Path("/.dockerenv").exists():
        return

    os.environ["MONGODB_URI"] = mongodb_uri.replace("@mongodb:", "@localhost:")


async def seed_courses(data_file: Path, drop_existing: bool) -> None:
    configure_mongodb_uri_for_seed()
    await init_database()
    try:
        raw_courses = json.loads(data_file.read_text(encoding="utf-8"))
        courses = [Course.model_validate(raw_course) for raw_course in raw_courses]

        if drop_existing:
            await Course.delete_all()

        inserted = 0
        updated = 0
        for course in courses:
            existing = await Course.find_one(Course.code == course.code)
            if existing is None:
                await course.insert()
                inserted += 1
                continue

            course.id = existing.id
            await course.replace()
            updated += 1

        print(
            f"Seeded {len(courses)} courses "
            f"({inserted} inserted, {updated} updated) from {data_file}"
        )
    finally:
        await close_database()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed KAIST SoC course data into MongoDB.")
    parser.add_argument(
        "--data-file",
        type=Path,
        default=DEFAULT_DATA_FILE,
        help="Path to the course JSON file.",
    )
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Delete the existing courses collection before seeding.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    asyncio.run(seed_courses(args.data_file, args.drop))


if __name__ == "__main__":
    main()
