# -*- coding: utf-8 -*-
"""全站 id↔标题 拼音一致性审计
覆盖：manifest 101 经典 + taxonomy 四类实体
容错：忽略连字符/下划线、已知后缀（-concept/-fa/-chan 等）、多音字常用读法
判定：编辑距离 > 容忍阈值 且 非子串关系 → 列入可疑
"""
import json
import os
import re
from pypinyin import lazy_pinyin

os.chdir(r'F:\chanzong.space')

def norm_title_pinyin(title):
    """标题转无调拼音连写（截断括号副注）"""
    t = re.sub(r'[（(【\[（].*', '', title)  # 去括号副注
    t = re.sub(r'[《》\s·・/]', '', t)
    t = re.sub(r'[一二三四五六七八九十]+$', '', t) if False else t
    py = lazy_pinyin(t, errors='ignore')
    return ''.join(py).lower()

def norm_id(i):
    return re.sub(r'[-_]', '', i.lower())

def editdist(a, b):
    if abs(len(a) - len(b)) > 6:
        return 99
    prev = list(range(len(b) + 1))
    for x, ca in enumerate(a, 1):
        cur = [x]
        for y, cb in enumerate(b, 1):
            cur.append(min(prev[y] + 1, cur[y - 1] + 1, prev[y - 1] + (ca != cb)))
        prev = cur
    return prev[-1]

# ---- 收集 (id, title, 类型) ----
pairs = []
manifest = json.load(open('manifest.json', encoding='utf-8'))
for m in manifest:
    pairs.append((m['id'], m['title'], 'classic', True))  # True=已发布在线

d = open('lib/taxonomy.ts', encoding='utf-8').read()
marks = []
for sec in ['ZEN_PERSONS', 'ZEN_CONCEPTS', 'ZEN_METHODS', 'ZEN_KOANS', 'ZEN_FAQS']:
    m = re.search('export const ' + sec, d)
    if m: marks.append((sec, m.start()))
marks.append(('END', len(d)))
for mm in re.finditer(r'"id":\s*"([^"]+)"', d):
    for k in range(len(marks) - 1):
        if marks[k][1] <= mm.start() < marks[k + 1][1]:
            sec = marks[k][0]
            break
    else:
        continue
    if sec == 'ZEN_FAQS':
        continue
    seg = d[mm.start():mm.start() + 400]
    tm = re.search(r'"(?:name|title)":\s*"([^"]+)"', seg)
    if tm:
        pairs.append((mm.group(1), tm.group(1), sec, False))

# ---- 比对 ----
KNOWN_SUFFIX = ('-concept', '-fa', '-chan', '-famen', '-yi', '-weiyi', '-gongfu',
                '-shibing', '-jing', '-lu', '-chan-concept')
report = []
for pid, title, typ, online in pairs:
    base = pid.lower()
    for suf in KNOWN_SUFFIX:
        if base.endswith(suf):
            base = base[:-len(suf)]
            break
    actual = norm_id(base)
    expect = norm_title_pinyin(title)
    if not expect or not actual:
        continue
    # 容忍：id 是期望的缩写（前缀截取）或包含关系
    if actual in expect or expect.startswith(actual) or actual.startswith(expect[:max(3, len(actual) - 3)]):
        continue
    dist = editdist(actual, expect)
    ratio = dist / max(len(actual), len(expect))
    if ratio > 0.34:  # 超过 1/3 字符不同 → 可疑
        report.append((typ, pid, title, actual, expect, f'{ratio:.2f}'))

print(f'审计 {len(pairs)} 个 id，可疑 {len(report)} 个：\n')
for typ, pid, title, actual, expect, ratio in sorted(report, key=lambda x: -float(x[5])):
    print(f'[{typ}] {pid}（{title}）')
    print(f'   实际: {actual}  期望: {expect}  偏差 {ratio}{"  ⚠️已在线" if typ=="classic" else ""}')
