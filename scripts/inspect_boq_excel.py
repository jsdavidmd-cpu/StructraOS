import pandas as pd
from pathlib import Path

path = Path(r"E:\Structra\Contractor Modules - Lifetime Access\Construction Kit\14 - Bill of Quantity Format.xlsx")
xl = pd.ExcelFile(path)
print("Sheets:", xl.sheet_names)
for sheet in xl.sheet_names:
    df = xl.parse(sheet, header=None)
    print("\n===", sheet, "===")
    print("Shape:", df.shape)
    print(df.head(10).to_string(index=False, header=False))
