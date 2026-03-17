import uuid
import json
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials
from ..config import get_settings

SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

HEADERS = [
    "ID", "Timestamp", "Language", "Name", "Contact",
    "Query Type", "Budget", "Car Preference", "Details", "Status",
]


class SheetsService:
    def __init__(self):
        settings = get_settings()
        # Prefer JSON string (for Render/cloud), fall back to file path (local dev)
        if settings.google_credentials_json:
            info = json.loads(settings.google_credentials_json)
            creds = Credentials.from_service_account_info(info, scopes=SCOPES)
        else:
            creds = Credentials.from_service_account_file(
                settings.google_credentials_path, scopes=SCOPES
            )
        gc = gspread.authorize(creds)
        spreadsheet = gc.open(settings.google_sheet_name)
        self._ws = self._get_or_create_worksheet(spreadsheet)

    def _get_or_create_worksheet(self, spreadsheet) -> gspread.Worksheet:
        try:
            ws = spreadsheet.worksheet("Consultations")
        except gspread.exceptions.WorksheetNotFound:
            ws = spreadsheet.add_worksheet(
                title="Consultations", rows=1000, cols=len(HEADERS)
            )
            ws.append_row(HEADERS)
            # Bold header
            ws.format("A1:J1", {
                "backgroundColor": {"red": 0.1, "green": 0.3, "blue": 0.7},
                "textFormat": {
                    "bold": True,
                    "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0},
                },
            })
        return ws

    def get_all(self) -> list[dict]:
        records = self._ws.get_all_records()
        # Filter out rows with empty ID
        return [r for r in records if r.get("ID")]

    def add(self, data: dict) -> str:
        row_id = str(uuid.uuid4())[:8].upper()
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
        query_display = "Buy / खरीदना" if data.get("query_type") == "buy" else "Sell / बेचना"

        row = [
            row_id,
            timestamp,
            data.get("language", "").capitalize(),
            data.get("name", ""),
            data.get("contact", ""),
            query_display,
            data.get("budget") or "-",
            data.get("car_preference") or "-",
            data.get("details") or "-",
            "New",
        ]
        self._ws.append_row(row)
        return row_id

    def update_status(self, row_id: str, status: str) -> bool:
        """Find row by ID (column A) and update Status (column J)."""
        cell = self._find_row_by_id(row_id)
        if cell is None:
            return False
        self._ws.update_cell(cell, 10, status)
        return True

    def delete(self, row_id: str) -> bool:
        """Find row by ID and delete it."""
        row_num = self._find_row_by_id(row_id)
        if row_num is None:
            return False
        self._ws.delete_rows(row_num)
        return True

    def _find_row_by_id(self, row_id: str) -> int | None:
        """Return 1-based row number for the given ID, or None."""
        id_col = self._ws.col_values(1)  # Column A
        try:
            return id_col.index(row_id) + 1  # 1-based
        except ValueError:
            return None
