from functools import lru_cache
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


@lru_cache(maxsize=1)
def get_engine():
	return create_engine(settings.database_url, pool_pre_ping=True)


def get_session_local():
	return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db() -> Generator[Session, None, None]:
	SessionLocal = get_session_local()
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
