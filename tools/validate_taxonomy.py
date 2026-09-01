# -*- coding: utf-8 -*-
"""taxonomy.ts 提交前门禁校验
用法: python tools/validate_taxonomy.py
任一项失败即退出码 1——任何修改 lib/taxonomy.ts 的提交前必须先跑一遍。
（2026-08-30 切片损坏事故后设立：find(-1)+负索引静默截断，构建才暴露）
"""
import json
import os
import re
import sys
from collections import Counter

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

FAILS = []

# 0) 真实解析哨兵：Node 直接 import taxonomy.ts（2026-08-30 ASCII 引号事故后加装——
#    成对插入值内引号可骗过偶数引号检查，唯有真实解析万无一失）
import subprocess
_r = subprocess.run(['node', '-e',
    "import('./lib/taxonomy.ts').then(m=>console.log('PARSING_OK', Object.keys(m).length))"],
    capture_output=True, text=True, timeout=60)
_parsing_ok = ('PARSING_OK' in _r.stdout)

def check(name, ok, detail=''):
    print(('✓' if ok else '✗'), name, detail)
    if not ok:
        FAILS.append(name)

d = open('lib/taxonomy.ts', encoding='utf-8').read()

# 1) 长度哨兵（防截断：历史损坏时骤降）
check('Node 真实导入解析', _parsing_ok, _r.stderr.strip()[:120] if not _parsing_ok else '')
check('长度哨兵 >1MB', len(d) > 1_000_000, f'({len(d)} 字符)')

# 2) 结构完整：五段 export + interface 头
for sec in ['ZEN_PERSONS', 'ZEN_CONCEPTS', 'ZEN_METHODS', 'ZEN_KOANS', 'ZEN_FAQS']:
    check(f'export const {sec} 存在', f'export const {sec}' in d)
check('interface 定义在位', 'interface PersonItem' in d)

# 3) 全文双引号偶数（粗解析哨兵）
check('双引号总量为偶', d.count('"') % 2 == 0, f'({d.count(chr(34))})')

# 4) 分区计数并与 stats.ts 对照
marks = []
for sec in ['ZEN_PERSONS', 'ZEN_CONCEPTS', 'ZEN_METHODS', 'ZEN_KOANS', 'ZEN_FAQS']:
    pattern = r'(export const ' + sec + r'|const ' + sec + r'_PART1)'
    m = re.search(pattern, d)
    if m:
        marks.append((sec, m.start()))
marks.append(('END', len(d)))
byarea = {}
for mm in re.finditer(r'"id":\s*"([^"]+)"', d):
    for k in range(len(marks) - 1):
        if marks[k][1] <= mm.start() < marks[k + 1][1]:
            byarea.setdefault(marks[k][0], []).append(mm.group(1))
            break

s = open('lib/stats.ts', encoding='utf-8').read()
stat_map = {'ZEN_PERSONS': 'persons', 'ZEN_CONCEPTS': 'concepts',
            'ZEN_METHODS': 'methods', 'ZEN_KOANS': 'koans', 'ZEN_FAQS': 'faqs'}
for sec, statkey in stat_map.items():
    actual = len(byarea.get(sec, []))
    stated = int(re.search(statkey + r': (\d+)', s).group(1))
    check(f'{sec} 计数={stated}', actual == stated, f'(实际 {actual})')

# 5) 同类型重复 id（banghe/yangqi-yijue 概念vs法门跨类型同名属合理设计，不算）
dups = []
for sec, ids in byarea.items():
    for k, v in Counter(ids).items():
        if v > 1:
            dups.append(f'{sec}:{k}×{v}')
check('同类型零重复 id', not dups, str(dups[:4]))

# 6) 悬空引用
known = set(i for ids in byarea.values() for i in ids)
manifest = json.load(open('manifest.json', encoding='utf-8'))
known |= {m['id'] for m in manifest}
refs = re.findall(r'"related(?:Concepts|Methods|Persons|Books)":\s*\[([^\]]*)\]', d)
dang = sorted({x for r in refs for x in re.findall(r'"([^"]+)"', r) if x not in known})
check('零悬空引用', not dang, str(dang[:4]))

# 7) 自引用（仅查同命名空间数组：relatedPersons/relatedConcepts/relatedMethods；
#    relatedBooks 指向 manifest 经典，人物与经典可共用 id 字符串——如人物 mazu 引经典 mazu，非自引用）
self_refs = []
for mm in re.finditer(r'"id":\s*"([^"]+)"', d):
    pid = mm.group(1)
    seg = d[mm.start():mm.start() + 9000]
    for f in ['relatedPersons', 'relatedConcepts', 'relatedMethods']:
        arr = re.search(r'"' + f + r'":\s*\[([^\]]*)\]', seg)
        if arr and f'"{pid}"' in arr.group(1):
            self_refs.append(f'{pid}->{f}')
check('零自引用（同命名空间）', not self_refs, str(self_refs[:4]))

# 8) manifest 与 classics_markdown 对齐
missing = [m['id'] for m in manifest if not os.path.exists('classics_markdown/' + m['filename'])]
check(f'manifest {len(manifest)} 部经典 md 齐全', not missing, str(missing[:4]))

print()
if FAILS:
    print(f'❌ 门禁未通过: {len(FAILS)} 项 —— {FAILS}')
    sys.exit(1)
print('✅ taxonomy 门禁全部通过')
