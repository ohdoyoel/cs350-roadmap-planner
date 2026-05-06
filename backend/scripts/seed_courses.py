import argparse
import asyncio
import json
import os
from pathlib import Path

from db.client import close_database, init_database, load_dotenv
from db.models.course import Course
from db.models.course_category import CourseCategory
from db.models.course_sector import CourseSector


BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATA_FILE = BACKEND_DIR / "data" / "courses.json"
DEFAULT_CATEGORIES_FILE = BACKEND_DIR / "data" / "course_categories.json"
DEFAULT_SECTORS_FILE = BACKEND_DIR / "data" / "course_sectors.json"


def configure_mongodb_uri_for_seed() -> None:
    load_dotenv()
    mongodb_uri = os.getenv("MONGODB_URI")
    if mongodb_uri is None or Path("/.dockerenv").exists():
        return

    os.environ["MONGODB_URI"] = mongodb_uri.replace("@mongodb:", "@localhost:")


async def upsert_documents(
    model: type[Course] | type[CourseCategory] | type[CourseSector],
    key_name: str,
    documents: list[Course] | list[CourseCategory] | list[CourseSector],
) -> tuple[int, int]:
    inserted = 0
    updated = 0

    for document in documents:
        key_value = getattr(document, key_name)
        existing = await model.find_one(getattr(model, key_name) == key_value)
        if existing is None:
            await document.insert()
            inserted += 1
            continue

        document.id = existing.id
        await document.replace()
        updated += 1

    return inserted, updated


async def seed_courses(
    data_file: Path,
    categories_file: Path,
    sectors_file: Path,
    drop_existing: bool,
) -> None:
    configure_mongodb_uri_for_seed()
    await init_database()
    try:
        raw_courses = json.loads(data_file.read_text(encoding="utf-8"))
        raw_categories = json.loads(categories_file.read_text(encoding="utf-8"))
        raw_sectors = json.loads(sectors_file.read_text(encoding="utf-8"))

        courses = [Course.model_validate(raw_course) for raw_course in raw_courses]
        categories = [
            CourseCategory.model_validate(raw_category)
            for raw_category in raw_categories
        ]
        sectors = [
            CourseSector.model_validate(raw_sector)
            for raw_sector in raw_sectors
        ]

        if drop_existing:
            await CourseCategory.delete_all()
            await CourseSector.delete_all()
            await Course.delete_all()

        category_inserted, category_updated = await upsert_documents(
            CourseCategory,
            "category",
            categories,
        )
        sector_inserted, sector_updated = await upsert_documents(
            CourseSector,
            "sector",
            sectors,
        )
        course_inserted, course_updated = await upsert_documents(
            Course,
            "course_code",
            courses,
        )

        print(
            f"Seeded {len(categories)} course categories "
            f"({category_inserted} inserted, {category_updated} updated)"
        )
        print(
            f"Seeded {len(sectors)} course sectors "
            f"({sector_inserted} inserted, {sector_updated} updated)"
        )
        print(
            f"Seeded {len(courses)} courses "
            f"({course_inserted} inserted, {course_updated} updated)"
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
        "--categories-file",
        type=Path,
        default=DEFAULT_CATEGORIES_FILE,
        help="Path to the course category JSON file.",
    )
    parser.add_argument(
        "--sectors-file",
        type=Path,
        default=DEFAULT_SECTORS_FILE,
        help="Path to the course sector JSON file.",
    )
    parser.add_argument(
        "--drop",
        action="store_true",
        help="Delete the existing courses collection before seeding.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    asyncio.run(
        seed_courses(
            args.data_file,
            args.categories_file,
            args.sectors_file,
            args.drop,
        )
    )


if __name__ == "__main__":
    main()
