from pydantic import BaseModel, ConfigDict, Field

from db.models.course import CourseCredit


class CourseDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    course_code: str = Field(serialization_alias="courseCode")
    course_name: str = Field(serialization_alias="courseName")
    course_name_en: str | None = Field(serialization_alias="courseNameEn")
    description: str | None = None
    category: str
    sectors: list[str]
    offered_semesters: list[str] = Field(serialization_alias="offeredSemesters")
    credit: CourseCredit
    prerequisites: list[str]
    is_key_course: bool = Field(serialization_alias="isKeyCourse")
    level: int | None
    matched: bool = True


class CourseCategoryDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    category: str
    name_en: str = Field(serialization_alias="nameEn")
    order: int
    course_count: int = Field(serialization_alias="courseCount")


class CourseSectorDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    sector: str
    name_en: str = Field(serialization_alias="nameEn")
    order: int
    course_count: int = Field(serialization_alias="courseCount")
