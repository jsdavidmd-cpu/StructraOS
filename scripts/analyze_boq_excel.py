import pandas as pd
from pathlib import Path

path = Path(r"E:\Structra\Contractor Modules - Lifetime Access\Construction Kit\14 - Bill of Quantity Format.xlsx")
df = pd.read_excel(path, sheet_name="BOQ", header=None)

# Find header row with ITEM NO.
header_rows = []
for idx, row in df.iterrows():
    if row.astype(str).str.contains("ITEM NO\.", case=False, na=False).any():
        header_rows.append(idx)

print("Header row candidates:", header_rows)
if header_rows:
    idx = header_rows[0]
    print("Header row values:")
    print(df.iloc[idx].to_list())
    print("Next row values:")
    print(df.iloc[idx + 1].to_list())

# Find section rows containing PART
section_rows = []
for idx, row in df.iterrows():
    if row.astype(str).str.contains(r"PART [A-J]", case=False, na=False).any():
        section_rows.append(idx)

print("\nSection rows (first 10):", section_rows[:10])
for idx in section_rows[:5]:
    print(idx, df.iloc[idx].dropna().to_list())
