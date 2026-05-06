from beanie import Document
from pydantic import Field

from db.models.course import CourseSectorName


class CourseSector(Document):
    sector: CourseSectorName
    name_en: str = Field(min_length=1)
    order: int

    class Settings:
        name = "course_sectors"
        indexes = ["sector", "order"]
