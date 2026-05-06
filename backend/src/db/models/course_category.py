from beanie import Document
from pydantic import Field

from db.models.course import CourseCategoryName


class CourseCategory(Document):
    category: CourseCategoryName
    name_en: str = Field(min_length=1)
    order: int

    class Settings:
        name = "course_categories"
        indexes = ["category", "order"]
