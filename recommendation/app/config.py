from functools import lru_cache

import pymysql.cursors
from pydantic import AliasChoices, Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    db_host: str = Field(
        default="localhost",
        validation_alias=AliasChoices("DB_HOST", "MYSQL_HOST"),
    )
    db_port: int = Field(
        default=3306,
        validation_alias=AliasChoices("DB_PORT", "MYSQL_PORT"),
    )
    db_user: str = Field(
        default="root",
        validation_alias=AliasChoices("DB_USER", "MYSQL_USER"),
    )
    db_password: str = Field(
        default="",
        validation_alias=AliasChoices("DB_PASSWORD", "MYSQL_PASSWORD"),
    )
    db_name: str = Field(
        default="oopshop",
        validation_alias=AliasChoices("DB_NAME", "MYSQL_DATABASE"),
    )

    database_url: str = Field(validation_alias="DATABASE_URL")

    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        validation_alias="EMBEDDING_MODEL",
    )
    embedding_dim: int = Field(default=384, validation_alias="EMBEDDING_DIM")

    @computed_field
    @property
    def mysql_config(self) -> dict:
        return {
            "host": self.db_host,
            "port": self.db_port,
            "user": self.db_user,
            "password": self.db_password,
            "database": self.db_name,
            "charset": "utf8mb4",
            "cursorclass": pymysql.cursors.DictCursor,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
