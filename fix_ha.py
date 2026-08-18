import re

with open(r'f:\chanzong.space\lib\translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

count = 0
for i in range(1190, 1489):  # 0-indexed, lines 1191-1489
    line = lines[i]
    # Only remove trailing 喝一声。 right before the closing quote+comma
    if line.rstrip().endswith('喝一声。\','):
        lines[i] = line.rstrip()[:-len('喝一声。\',')] + '\','
        count += 1

with open(r'f:\chanzong.space\lib\translations.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'Replaced {count} lines')
