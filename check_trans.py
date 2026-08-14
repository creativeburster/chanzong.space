t = open('lib/translations.ts', 'r', encoding='utf-8').read()
s = t[t.find('dahuiyulu: ['):]
e = s.find('\n  ],')
section = s[:e]
lines = [l for l in section.split('\n') if l.strip().startswith("'")]
print(f'实际条目数: {len(lines)}')
print(f'前3行: {lines[:3]}')
print(f'后3行: {lines[-3:]}')
