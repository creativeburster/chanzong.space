# -*- coding: utf-8 -*-
with open(r'f:\chanzong.space\lib\translations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

count = 0
for i in range(1190, 1489):  # 0-indexed lines 1191-1489
    old = "喝一声。',"
    new = "',"
    if old in lines[i]:
        lines[i] = lines[i].replace(old, new)
        count += 1

with open(r'f:\chanzong.space\lib\translations.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"Replaced {count} lines")
