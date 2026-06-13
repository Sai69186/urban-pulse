"""
Universal file parser — handles CSV, Excel (.xlsx/.xls), and JSON.
Auto-detects columns, normalizes names, validates required fields.
Returns list[dict] ready for analytics modules.
Includes parse_unified_file for single-file multi-category uploads.
"""

import io
import json
import pandas as pd
from typing import Tuple, Dict

SCHEMA_MAP = {
    "air_quality":   {"required":["AQI"],          "aliases":{"pm2.5":"PM25","pm_25":"PM25","aqi":"AQI","no2":"NO2","o3":"O3","co":"CO","pm10":"PM10"}},
    "crime":         {"required":["total"],         "aliases":{"total_crime":"total","crime_total":"total"}},
    "economic":      {"required":["unemployment"],  "aliases":{"unemployment_rate":"unemployment","median_income":"medianIncome","gdp_growth":"gdpGrowth","housing_affordability":"housingAffordability","business_openings":"businessOpenings","business_closures":"businessClosures"}},
    "health":        {"required":["hospitalVisits"],"aliases":{"hospital_visits":"hospitalVisits","respiratory_issues":"respiratoryIssues","mental_health":"mentalHealthCases","response_time":"avgResponseTime","vaccination_rate":"vaccinationRate","icu_occupancy":"icuOccupancy"}},
    "noise":         {"required":["avgDecibels"],   "aliases":{"avg_decibels":"avgDecibels","nighttime_noise":"nighttimeNoise","construction_noise":"constructionNoise","traffic_noise":"trafficNoise"}},
    "neighborhoods": {"required":["name"],          "aliases":{"air_quality":"airQuality","green_space":"greenSpace","livability_score":"livabilityScore"}},
    "sentiment":     {"required":["category"],      "aliases":{}},
}

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


def _normalize_cols(df: pd.DataFrame, aliases: dict) -> pd.DataFrame:
    new_cols = {}
    for col in df.columns:
        key = col.strip().lower().replace(" ", "_").replace("-", "_")
        new_cols[col] = aliases.get(key, col.strip())
    return df.rename(columns=new_cols)


def _add_month(df: pd.DataFrame) -> pd.DataFrame:
    if "month" not in df.columns:
        df = df.copy()
        df.insert(0, "month", [MONTHS[i % 12] for i in range(len(df))])
    return df


def _coerce_numerics(df: pd.DataFrame) -> pd.DataFrame:
    skip = {"month", "name", "category", "sentiment", "text", "time"}
    for col in df.columns:
        if col not in skip:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    return df


def parse_file(content: bytes, filename: str, dataset_type: str) -> Tuple[list, dict]:
    ext = filename.rsplit(".", 1)[-1].lower()

    try:
        if ext == "csv":
            df = pd.read_csv(io.BytesIO(content))
        elif ext in ("xlsx", "xls"):
            df = pd.read_excel(io.BytesIO(content))
        elif ext == "json":
            raw = json.loads(content)
            df = pd.DataFrame(raw if isinstance(raw, list) else raw.get("data", [raw]))
        else:
            raise ValueError(f"Unsupported format: .{ext}  — use CSV, Excel, or JSON.")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Cannot read file: {e}")

    if df.empty:
        raise ValueError("File is empty.")

    schema = SCHEMA_MAP.get(dataset_type, {})
    df = _normalize_cols(df, schema.get("aliases", {}))
    df = _add_month(df)
    df = _coerce_numerics(df)
    df = df.dropna(how="all").reset_index(drop=True)

    required = schema.get("required", [])
    missing = [r for r in required if r not in df.columns]
    if missing:
        raise ValueError(
            f"Missing required columns: {missing}. "
            f"Your file has: {list(df.columns)}. "
            f"Rename your columns to match, or check the template."
        )

    records = df.to_dict(orient="records")
    meta = {
        "filename": filename,
        "rows":     len(records),
        "columns":  list(df.columns),
        "type":     dataset_type,
    }
    return records, meta


# ── Column signatures used to auto-detect category from a sheet/CSV ──────────
_CATEGORY_SIGNATURES: Dict[str, list] = {
    "air_quality":   ["AQI", "PM25", "PM10", "NO2", "O3", "CO"],
    "crime":         ["total", "theft", "assault", "vandalism", "fraud", "burglary"],
    "economic":      ["unemployment", "medianIncome", "gdpGrowth", "businessOpenings", "housingAffordability"],
    "health":        ["hospitalVisits", "icuOccupancy", "vaccinationRate", "respiratoryIssues", "avgResponseTime"],
    "noise":         ["avgDecibels", "complaints", "nighttimeNoise", "constructionNoise", "trafficNoise"],
    "neighborhoods": ["name", "airQuality", "safety", "greenSpace", "livabilityScore"],
    "sentiment":     ["category", "positive", "negative", "neutral"],
}

# Friendly sheet-name aliases → canonical key
_SHEET_ALIASES: Dict[str, str] = {
    "air_quality": "air_quality", "airquality": "air_quality", "air quality": "air_quality", "air": "air_quality",
    "crime": "crime", "crime analysis": "crime", "public safety": "crime",
    "economic": "economic", "economics": "economic", "economy": "economic",
    "health": "health", "healthcare": "health", "healthcare data": "health",
    "noise": "noise", "noise pollution": "noise",
    "neighborhoods": "neighborhoods", "neighbourhood": "neighborhoods", "neighborhoods data": "neighborhoods",
    "sentiment": "sentiment", "citizen sentiment": "sentiment", "public sentiment": "sentiment",
}


def _detect_category(df: pd.DataFrame) -> str | None:
    """Guess which dataset category a DataFrame belongs to based on its columns."""
    cols_lower = {c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns}
    # also apply alias normalisation to the detection set
    all_aliases = {}
    for schema in SCHEMA_MAP.values():
        all_aliases.update(schema.get("aliases", {}))
    normalized = {all_aliases.get(c, c) for c in cols_lower}

    best_key, best_score = None, 0
    for cat, sig_cols in _CATEGORY_SIGNATURES.items():
        sig_lower = {s.lower() for s in sig_cols}
        score = len(sig_lower & normalized)
        if score > best_score:
            best_score, best_key = score, cat

    return best_key if best_score >= 1 else None


def parse_unified_file(content: bytes, filename: str) -> Dict[str, Tuple[list, dict]]:
    """
    Parse a single file that contains ALL urban data categories.

    Excel (.xlsx / .xls):
      - Sheet names are matched to category keys (case-insensitive, aliases supported).
      - Each sheet is parsed independently via parse_file().

    CSV:
      - If a 'sheet' or 'category' column is present the rows are split by its value.
      - Otherwise the CSV is treated as a wide table; columns are matched to categories
        by signature and each matching subset is extracted.

    Returns dict[dataset_type -> (records, meta)] for every detected category.
    Skips sheets/subsets that cannot be matched or fail validation quietly
    (the route layer reports what was loaded).
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    results: Dict[str, Tuple[list, dict]] = {}

    if ext in ("xlsx", "xls"):
        try:
            xl = pd.ExcelFile(io.BytesIO(content))
        except Exception as e:
            raise ValueError(f"Cannot open Excel file: {e}")

        for sheet_name in xl.sheet_names:
            # Resolve sheet → category key
            key = _SHEET_ALIASES.get(sheet_name.strip().lower())
            if key is None:
                # Try content-based detection
                try:
                    df_tmp = xl.parse(sheet_name)
                    key = _detect_category(df_tmp)
                except Exception:
                    continue
            if key is None:
                continue

            try:
                df_bytes = io.BytesIO()
                xl.parse(sheet_name).to_csv(df_bytes, index=False)
                df_bytes.seek(0)
                records, meta = parse_file(df_bytes.read(), f"{sheet_name}.csv", key)
                meta["filename"] = filename
                meta["sheet"] = sheet_name
                results[key] = (records, meta)
            except (ValueError, Exception):
                # Skip sheets that fail validation silently
                continue

    elif ext == "csv":
        try:
            df_full = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            raise ValueError(f"Cannot read CSV: {e}")

        if df_full.empty:
            raise ValueError("CSV file is empty.")

        # Split-column mode: a 'sheet' or 'category' column separates rows by type
        split_col = next(
            (c for c in df_full.columns if c.strip().lower() in ("sheet", "category", "type", "dataset")),
            None,
        )

        if split_col:
            for group_val, group_df in df_full.groupby(split_col):
                key = _SHEET_ALIASES.get(str(group_val).strip().lower())
                if key is None:
                    key = _detect_category(group_df.drop(columns=[split_col]))
                if key is None:
                    continue
                try:
                    sub = group_df.drop(columns=[split_col])
                    csv_bytes = sub.to_csv(index=False).encode()
                    records, meta = parse_file(csv_bytes, f"{group_val}.csv", key)
                    meta["filename"] = filename
                    results[key] = (records, meta)
                except Exception:
                    continue
        else:
            # Wide-table mode: extract columns that match each category signature
            cols = list(df_full.columns)
            for cat, sig_cols in _CATEGORY_SIGNATURES.items():
                schema = SCHEMA_MAP.get(cat, {})
                # Build a normalised → original name map for this df
                alias_map = schema.get("aliases", {})
                col_map = {}
                for c in cols:
                    norm = c.strip().lower().replace(" ", "_").replace("-", "_")
                    canonical = alias_map.get(norm, c.strip())
                    col_map[c] = canonical

                matching = [c for c, canon in col_map.items()
                            if any(canon.lower() == s.lower() for s in sig_cols)]
                if not matching:
                    continue

                # Also bring in 'month' / 'name' index columns if present
                for idx_col in ("month", "name", "date"):
                    for c in cols:
                        if c.strip().lower() == idx_col and c not in matching:
                            matching.insert(0, c)
                            break

                try:
                    sub = df_full[matching].copy()
                    csv_bytes = sub.to_csv(index=False).encode()
                    records, meta = parse_file(csv_bytes, f"{cat}.csv", cat)
                    meta["filename"] = filename
                    results[cat] = (records, meta)
                except Exception:
                    continue

    else:
        raise ValueError(f"Unsupported format .{ext}. Use CSV or Excel (.xlsx) for unified uploads.")

    return results
