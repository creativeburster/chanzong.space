# -*- coding: utf-8 -*-
import re

with open(r'f:\chanzong.space\lib\taxonomy.ts', 'r', encoding='utf-8') as f:
    tax = f.read()

# Split by export const sections
sections = {}
for key in ['ZEN_PERSONS', 'ZEN_CONCEPTS', 'ZEN_METHODS', 'ZEN_KOANS', 'ZEN_FAQS']:
    start = tax.find(f'export const {key}')
    if start == -1:
        sections[key] = 0
        continue
    # Find the end ]; or ] ;
    rest = tax[start:]
    # Count "id": or id: entries
    ids = re.findall(r'"id"\s*:\s*"|id\s*:\s*\'', rest.split('];')[0].split('];' if '];' in rest else '];')[0])
    sections[key] = len(ids)

print(f"人物：{sections['ZEN_PERSONS']}位")
print(f"概念：{sections['ZEN_CONCEPTS']}个")
print(f"法门：{sections['ZEN_METHODS']}个")
print(f"公案：{sections['ZEN_KOANS']}则")
print(f"问答：{sections['ZEN_FAQS']}条")
