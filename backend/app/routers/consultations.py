from fastapi import APIRouter, HTTPException, Depends
from ..models.consultation import StatusUpdateRequest
from ..services.sheets_service import SheetsService

router = APIRouter(prefix="/api/consultations", tags=["consultations"])


def get_sheets() -> SheetsService:
    return SheetsService()


@router.get("")
async def list_consultations(sheets: SheetsService = Depends(get_sheets)):
    try:
        records = sheets.get_all()
        return {"consultations": records, "total": len(records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch consultations: {e}")


@router.patch("/{row_id}/status")
async def update_status(
    row_id: str,
    body: StatusUpdateRequest,
    sheets: SheetsService = Depends(get_sheets),
):
    try:
        updated = sheets.update_status(row_id, body.status.value)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Consultation {row_id} not found")
        return {"success": True, "id": row_id, "status": body.status.value}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{row_id}")
async def delete_consultation(
    row_id: str,
    sheets: SheetsService = Depends(get_sheets),
):
    try:
        deleted = sheets.delete(row_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Consultation {row_id} not found")
        return {"success": True, "id": row_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
