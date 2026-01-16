"""
SQLite Database 연결 및 CRUD 함수
"""
import os
import json
import sqlite3
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from contextlib import contextmanager

# 데이터베이스 파일 경로 (프로젝트 루트/data/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "reports.db")


def init_db():
    """데이터베이스 및 테이블 초기화"""
    os.makedirs(DATA_DIR, exist_ok=True)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                country TEXT NOT NULL,
                ocr_engine TEXT NOT NULL,
                ocr_text TEXT,
                allergens TEXT,
                nutrition TEXT,
                risks TEXT,
                promo TEXT
            )
        """)
        conn.commit()


@contextmanager
def get_connection():
    """SQLite 연결 컨텍스트 매니저"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def generate_report_id() -> str:
    """UUID 기반 짧은 report_id 생성 (8자리)"""
    return uuid.uuid4().hex[:8]


def save_report(
    country: str,
    ocr_engine: str,
    ocr_text: str,
    allergens: List[str],
    nutrition: Dict[str, Any],
    risks: List[Dict[str, str]],
    promo: Dict[str, str]
) -> str:
    """
    분석 결과를 DB에 저장하고 report_id 반환

    Returns:
        report_id (str): 생성된 고유 ID (8자리)
    """
    report_id = generate_report_id()

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reports (id, country, ocr_engine, ocr_text, allergens, nutrition, risks, promo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            country,
            ocr_engine,
            ocr_text,
            json.dumps(allergens, ensure_ascii=False),
            json.dumps(nutrition, ensure_ascii=False),
            json.dumps(risks, ensure_ascii=False),
            json.dumps(promo, ensure_ascii=False)
        ))
        conn.commit()

    return report_id


def get_report(report_id: str) -> Optional[Dict[str, Any]]:
    """
    report_id로 단일 리포트 조회

    Returns:
        리포트 딕셔너리 또는 None
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()

        if not row:
            return None

        return _row_to_dict(row)


def get_reports(
    limit: int = 10,
    offset: int = 0,
    country: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    최근 리포트 목록 조회 (히스토리용)

    Args:
        limit: 최대 개수 (기본 10)
        offset: 시작 위치
        country: 국가 필터 (선택)
        date_from: 시작 날짜 필터 (YYYY-MM-DD)
        date_to: 종료 날짜 필터 (YYYY-MM-DD)

    Returns:
        리포트 목록 (최신순)
    """
    with get_connection() as conn:
        cursor = conn.cursor()

        # 동적 WHERE 절 구성
        conditions = []
        params = []

        if country:
            conditions.append("country = ?")
            params.append(country)

        if date_from:
            conditions.append("DATE(created_at) >= ?")
            params.append(date_from)

        if date_to:
            conditions.append("DATE(created_at) <= ?")
            params.append(date_to)

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        query = f"""
            SELECT id, created_at, country, ocr_engine
            FROM reports
            {where_clause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [
            {
                "id": row["id"],
                "created_at": row["created_at"],
                "country": row["country"],
                "ocr_engine": row["ocr_engine"]
            }
            for row in rows
        ]


def count_reports(
    country: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
) -> int:
    """
    필터 조건에 맞는 리포트 총 개수

    Args:
        country: 국가 필터 (선택)
        date_from: 시작 날짜 필터 (YYYY-MM-DD)
        date_to: 종료 날짜 필터 (YYYY-MM-DD)

    Returns:
        총 리포트 개수
    """
    with get_connection() as conn:
        cursor = conn.cursor()

        conditions = []
        params = []

        if country:
            conditions.append("country = ?")
            params.append(country)

        if date_from:
            conditions.append("DATE(created_at) >= ?")
            params.append(date_from)

        if date_to:
            conditions.append("DATE(created_at) <= ?")
            params.append(date_to)

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        query = f"SELECT COUNT(*) as count FROM reports {where_clause}"
        cursor.execute(query, params)
        row = cursor.fetchone()

        return row["count"] if row else 0


def delete_report(report_id: str) -> bool:
    """
    리포트 삭제

    Returns:
        삭제 성공 여부
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        conn.commit()
        return cursor.rowcount > 0


def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    """sqlite3.Row를 딕셔너리로 변환 (JSON 필드 파싱 포함)"""
    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "country": row["country"],
        "ocr_engine": row["ocr_engine"],
        "ocr_text": row["ocr_text"],
        "allergens": json.loads(row["allergens"]) if row["allergens"] else [],
        "nutrition": json.loads(row["nutrition"]) if row["nutrition"] else {},
        "risks": json.loads(row["risks"]) if row["risks"] else [],
        "promo": json.loads(row["promo"]) if row["promo"] else {}
    }


# 모듈 로드 시 DB 초기화
init_db()
