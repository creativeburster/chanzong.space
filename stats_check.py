# -*- coding: utf-8 -*-
import json, re

m = json.load(open(r'f:\chanzong.space\manifest.json', 'r', encoding='utf-8-sig'))
items = list(m.values()) if isinstance(m, dict) else m
print(f"=== 经典：{len(items)}部 ===")
for x in sorted(items, key=lambda a: a['idx']):
    print(f"  idx{x['idx']}: {x['id']} - {x['title']} ({x['author']})")

with open(r'f:\chanzong.space\lib\taxonomy.ts', 'r', encoding='utf-8') as f:
    tax = f.read()

persons = len(re.findall(r"id: '", tax.split('ZEN_PERSONS')[1].split('];')[0])) if 'ZEN_PERSONS' in tax else 0
concepts = len(re.findall(r"id: '", tax.split('ZEN_CONCEPTS')[1].split('];')[0])) if 'ZEN_CONCEPTS' in tax else 0
methods = len(re.findall(r"id: '", tax.split('ZEN_METHODS')[1].split('];')[0])) if 'ZEN_METHODS' in tax else 0
koans = len(re.findall(r"id: '", tax.split('ZEN_KOANS')[1].split('];')[0])) if 'ZEN_KOANS' in tax else 0
faqs = len(re.findall(r"id: '", tax.split('ZEN_FAQS')[1].split('];')[0])) if 'ZEN_FAQS' in tax else 0

print(f"\n=== 栏目统计 ===")
print(f"人物：{persons}位")
print(f"概念：{concepts}个")
print(f"法门：{methods}个")
print(f"公案：{koans}则")
print(f"问答：{faqs}条")

with open(r'f:\chanzong.space\lib\translations.ts', 'r', encoding='utf-8') as f:
    trans = f.read()
seg_count = len(re.findall(r"^\s+'", trans, re.MULTILINE))
print(f"翻译：约{seg_count}段")
