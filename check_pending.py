#!/usr/bin/env python3
"""Check current state of pending-collection entries in taxonomy.ts"""
import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

c = open('lib/taxonomy.ts', encoding='utf-8').read()

names = ['万松行秀', '耶律楚材', '通容', '隐元隆琦', '天衣义怀', '开福道宁', '普明禅师', '芙蓉道楷',
         '三轮体空', '理具事造', '息诤法门', '五行观', '三妙悟', '始觉']

for name in names:
    positions = [m.start() for m in re.finditer(name, c)]
    print(f'\n=== {name} ({len(positions)} hits) ===')
    for p in positions[:2]:
        # find enclosing entry start
        seg_start = c.rfind('\n  {', 0, p)
        seg = c[seg_start:p+600]
        idm = re.search(r'"id": "([a-z0-9-]+)"', seg)
        print('  id:', idm.group(1) if idm else '?')
        # print fields present
        for field in ['classicRef', 'relatedBooks', 'relatedPersons']:
            fm = re.search(r'"%s": (\[[^\]]*\]|"[^"]*")' % field, seg)
            if fm:
                print(f'  {field}: {fm.group(1)[:120]}')
        break
