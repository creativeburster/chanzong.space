import os, json, re

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

print(f"Total classics in manifest: {len(manifest)}")

# Check downloaded classics
downloaded = os.listdir('downloaded_classics') if os.path.exists('downloaded_classics') else []
id_map = {}

# Map from filename prefix like "已发T2008_六祖大师法宝坛经.txt"
for df in downloaded:
    m = re.search(r'([TBXJ]\d+[a-zA-Z]?)_(.*)\.txt', df)
    if m:
        cbeta_id = m.group(1)
        name = m.group(2)
        id_map[cbeta_id] = name

print(f"Extracted {len(id_map)} cbeta IDs from downloaded_classics")
for cid, name in list(id_map.items())[:15]:
    print(f"  {cid}: {name}")
