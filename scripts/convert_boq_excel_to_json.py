import json
from pathlib import Path
import pandas as pd

path = Path(r"E:\Structra\Contractor Modules - Lifetime Access\Construction Kit\14 - Bill of Quantity Format.xlsx")

df = pd.read_excel(path, sheet_name="BOQ", header=None)

header_row = 5
start_row = header_row + 2

items = []
current_section = None

for idx in range(start_row, len(df)):
    row = df.iloc[idx]
    first = row.iloc[0]
    second = row.iloc[1]

    if pd.notna(first) and isinstance(first, str) and first.strip().upper().startswith("PART "):
        section_title = second if pd.notna(second) else ""
        current_section = f"{first.strip()} {section_title}".strip()
        continue

    if pd.isna(first):
        continue

    # Item number should be numeric or numeric-like
    item_number = str(first).strip()
    if item_number.lower().startswith("part"):
        continue

    description = str(second).strip() if pd.notna(second) else ""
    qty = float(row.iloc[3]) if pd.notna(row.iloc[3]) else 0.0
    unit = str(row.iloc[4]).strip() if pd.notna(row.iloc[4]) else ""

    material_unit_cost = float(row.iloc[5]) if pd.notna(row.iloc[5]) else 0.0
    labor_unit_cost = float(row.iloc[7]) if pd.notna(row.iloc[7]) else 0.0
    equipment_unit_cost = float(row.iloc[9]) if pd.notna(row.iloc[9]) else 0.0

    total_unit_cost = float(row.iloc[11]) if pd.notna(row.iloc[11]) else 0.0
    if total_unit_cost == 0.0:
        total_unit_cost = material_unit_cost + labor_unit_cost + equipment_unit_cost

    internal_amount = float(row.iloc[12]) if pd.notna(row.iloc[12]) else qty * total_unit_cost
    contract_amount = float(row.iloc[13]) if pd.notna(row.iloc[13]) else internal_amount

    markup_percent = 15.0
    if internal_amount and contract_amount and internal_amount > 0:
        markup_percent = round(((contract_amount / internal_amount) - 1) * 100, 2)

    items.append({
        "item_number": item_number,
        "section": current_section or "PART A. GENERAL REQUIREMENTS",
        "trade": "",
        "description": description,
        "qty": qty,
        "unit": unit,
        "assembly_id": None,
        "unit_price": total_unit_cost,
        "material_cost": material_unit_cost,
        "labor_cost": labor_unit_cost,
        "equipment_cost": equipment_unit_cost,
        "markup_percent": markup_percent,
        "internal_amount": internal_amount,
        "contract_amount": contract_amount,
    })

output_path = Path(r"E:\Structra\src\data\boqTemplate.json")
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps(items, indent=2), encoding="utf-8")

print(f"Wrote {len(items)} items to {output_path}")
