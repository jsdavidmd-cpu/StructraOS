import json
from pathlib import Path

json_path = Path(r"E:\Structra\src\data\boqTemplate.json")
items = json.loads(json_path.read_text(encoding="utf-8"))

out_path = Path(r"E:\Structra\src\data\boqTemplate.ts")
content = "// Auto-generated from BOQ Excel template.\nexport const boqTemplateItems = " + json.dumps(items, indent=2) + " as const;\n"
out_path.write_text(content, encoding="utf-8")

print(f"Wrote {out_path}")
