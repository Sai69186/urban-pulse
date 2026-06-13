"""
Upload routes — accept CSV/Excel/JSON for any dataset category.
Also provides downloadable CSV templates and session status.
Supports unified multi-sheet Excel or wide CSV uploads.
"""

import io
import csv
import zipfile
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from data.parser import parse_file, parse_unified_file
from data.session_store import set_dataset, get_all_status, clear_dataset, clear_all

router = APIRouter(prefix="/api/upload", tags=["Data Upload"])

# ── Templates ────────────────────────────────────────────────────────────────
TEMPLATES = {
    "air_quality": {
        "headers": ["month","AQI","PM25","PM10","NO2","O3","CO"],
        "sample":  [
            ["Jan",118,42,78,58,34,1.2],
            ["Feb",109,38,71,52,38,1.0],
            ["Mar", 94,31,60,45,45,0.9],
        ],
        "description": "Air quality — AQI, PM2.5, PM10, NO2, O3, CO per month",
    },
    "crime": {
        "headers": ["month","total","theft","assault","vandalism","fraud","burglary"],
        "sample":  [
            ["Jan",228,98,32,48,28,22],
            ["Feb",200,88,28,42,24,18],
            ["Mar",184,82,26,38,22,16],
        ],
        "description": "Crime data — monthly totals by type",
    },
    "economic": {
        "headers": ["month","unemployment","medianIncome","businessOpenings","businessClosures","housingAffordability","gdpGrowth"],
        "sample":  [
            ["Jan",8.2,52400,12,8,48,1.8],
            ["Feb",8.0,52800,14,7,49,2.0],
            ["Mar",7.8,53200,18,6,50,2.2],
        ],
        "description": "Economic indicators — unemployment, income, business activity",
    },
    "health": {
        "headers": ["month","hospitalVisits","respiratoryIssues","mentalHealthCases","avgResponseTime","vaccinationRate","icuOccupancy"],
        "sample":  [
            ["Jan",720,138,162,14.2,68,82],
            ["Feb",688,128,155,13.8,70,79],
            ["Mar",640,112,148,13.2,72,75],
        ],
        "description": "Healthcare — hospital visits, ICU, response time, vaccination",
    },
    "noise": {
        "headers": ["month","avgDecibels","complaints","nighttimeNoise","constructionNoise","trafficNoise"],
        "sample":  [
            ["Jan",62,142,54,72,65],
            ["Feb",60,128,52,70,63],
            ["Mar",58,115,50,68,61],
        ],
        "description": "Noise — decibel levels and citizen complaints",
    },
    "neighborhoods": {
        "headers": ["name","airQuality","safety","greenSpace","healthcare","economic","noise","transport","livabilityScore"],
        "sample":  [
            ["Downtown Core",52,58,38,82,88,42,85,64],
            ["Riverside West",68,72,72,75,70,60,72,70],
            ["Greenfield Heights",84,86,90,78,64,80,65,78],
        ],
        "description": "Neighborhood scores — 0–100 per dimension",
    },
    "sentiment": {
        "headers": ["category","positive","neutral","negative","total","trend"],
        "sample":  [
            ["Public Transport",62,18,20,3840,4],
            ["Safety",45,22,33,4210,-2],
            ["Green Spaces",78,12,10,2140,8],
        ],
        "description": "Citizen sentiment — % positive/neutral/negative per category",
    },
}


# ── Fixed routes MUST come before /{dataset_type} wildcard ───────────────────

@router.get("/status")
def upload_status():
    """Returns upload status for all dataset types."""
    return get_all_status()


@router.delete("/")
def clear_all_route():
    """Clear all uploaded datasets — full reset to seed data."""
    clear_all()
    return {"success": True, "message": "All datasets reset to default"}


@router.get("/templates")
def list_templates():
    """List all available templates with descriptions."""
    return {
        k: {
            "description": v["description"],
            "headers":     v["headers"],
            "download_url":f"/api/upload/template/{k}",
        }
        for k, v in TEMPLATES.items()
    }


# ── Unified upload (one file, all categories) — before /{dataset_type} ───────

@router.post("/unified")
async def upload_unified(file: UploadFile = File(...)):
    """
    Upload a single file containing ALL urban data categories.

    Excel (.xlsx): each sheet named after a category
      (air_quality, crime, economic, health, noise, neighborhoods, sentiment)

    CSV: wide format with a 'sheet' or 'category' column to split rows,
         OR a flat wide CSV where ALL columns from all categories are present
         and the parser auto-detects which columns belong where.

    Returns a summary of every category that was successfully loaded.
    """
    allowed_ext = {"csv", "xlsx", "xls"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        raise HTTPException(400, f"File type .{ext} not supported. Use CSV or Excel (.xlsx).")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 20 MB for unified uploads.")

    try:
        results = parse_unified_file(content, file.filename)
    except ValueError as e:
        raise HTTPException(422, str(e))

    if not results:
        raise HTTPException(422, "No recognisable urban data categories found in the file. "
                                 "Use the template as a guide.")

    loaded = {}
    for dataset_type, (records, meta) in results.items():
        set_dataset(dataset_type, records, meta)
        loaded[dataset_type] = {
            "rows":    meta["rows"],
            "columns": meta["columns"],
        }

    return {
        "success":          True,
        "filename":         file.filename,
        "categories_loaded": list(loaded.keys()),
        "total_categories": len(loaded),
        "details":          loaded,
        "message":          f"Loaded {len(loaded)} categories from {file.filename}",
    }


@router.get("/template/unified/download")
def download_unified_template():
    """
    Download a multi-sheet Excel template covering all 7 urban data categories.
    Each sheet is pre-filled with 3 sample rows and labelled with column notes.
    """
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        for key, tpl in TEMPLATES.items():
            df = pd.DataFrame(tpl["sample"], columns=tpl["headers"])
            df.to_excel(writer, sheet_name=key, index=False)

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=urban_pulse_template.xlsx"},
    )


# ── Per-category routes — wildcard MUST be last ───────────────────────────────

@router.post("/{dataset_type}")
async def upload_dataset(dataset_type: str, file: UploadFile = File(...)):
    """
    Upload a CSV, Excel, or JSON file for a specific dataset category.
    dataset_type: air_quality | crime | economic | health | noise | neighborhoods | sentiment
    """
    valid_types = list(TEMPLATES.keys())
    if dataset_type not in valid_types:
        raise HTTPException(400, f"Invalid dataset_type. Choose from: {valid_types}")

    allowed_ext = {"csv", "xlsx", "xls", "json"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        raise HTTPException(400, f"File type .{ext} not supported. Use: {allowed_ext}")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(400, "File too large. Max 10 MB.")

    try:
        records, meta = parse_file(content, file.filename, dataset_type)
    except ValueError as e:
        raise HTTPException(422, str(e))

    set_dataset(dataset_type, records, meta)

    return {
        "success":      True,
        "dataset_type": dataset_type,
        "filename":     file.filename,
        "rows":         meta["rows"],
        "columns":      meta["columns"],
        "message":      f"Successfully loaded {meta['rows']} rows for {dataset_type}",
    }


@router.get("/template/{dataset_type}")
def download_template(dataset_type: str):
    """Download a CSV template for a specific dataset type."""
    if dataset_type not in TEMPLATES:
        raise HTTPException(404, f"No template for: {dataset_type}")

    tpl = TEMPLATES[dataset_type]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(tpl["headers"])
    for row in tpl["sample"]:
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=template_{dataset_type}.csv"},
    )


@router.delete("/{dataset_type}")
def clear_dataset_route(dataset_type: str):
    """Remove uploaded data for a category — reverts to seed data."""
    clear_dataset(dataset_type)
    return {"success": True, "message": f"{dataset_type} reset to default data"}
