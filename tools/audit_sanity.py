# -*- coding: utf-8 -*-
"""八类愚蠢错误自查（此前审计未覆盖的类别）"""
import json
import os
import re
from collections import Counter, defaultdict

os.chdir(r'F:\chanzong.space')
d = open('lib/taxonomy.ts', encoding='utf-8').read()
manifest = json.load(open('manifest.json', encoding='utf-8'))

print('=' * 30)
print('A. 重复人物（同一人多个词条）')
print('=' * 30)
# 抽人物 name + title + classics 首书名，找名字或称号重叠
persons = []
marks = []
for sec in ['ZEN_PERSONS', 'ZEN_CONCEPTS', 'ZEN_METHODS', 'ZEN_KOANS']:
    m = re.search('export const ' + sec, d)
    marks.append((sec, m.start()))
marks.append(('END', len(d)))
for mm in re.finditer(r'"id":\s*"([^"]+)"', d):
    for k in range(len(marks) - 1):
        if marks[k][1] <= mm.start() < marks[k + 1][1]:
            sec = marks[k][0]
            break
    else:
        continue
    if sec != 'ZEN_PERSONS':
        continue
    seg = d[mm.start():mm.start() + 600]
    nm = re.search(r'"name":\s*"([^"]+)"', seg)
    if nm:
        persons.append((mm.group(1), nm.group(1)))

def canon(name):
    n = re.sub(r'[（(].*', '', name)
    n = re.sub(r'禅师|大师|菩萨|尊者|国师|和尚|禅師', '', n)
    return n.strip()

byc = defaultdict(list)
for pid, name in persons:
    byc[canon(name)].append((pid, name))
for c, lst in byc.items():
    if len(lst) > 1:
        print(f'  ⚠️ 同名人物: {lst}')

# 称号互见（A 中名字不同但互为别称的常见对）
susp_pairs = [('shishuang-chuyuan', 'chuyuan'), ('xuedou-zhongxian', 'xuedou'),
              ('wuzu-fayan', 'fayan-wenyi')]
for a, b in susp_pairs:
    na = dict(persons).get(a, '')
    nb = dict(persons).get(b, '')
    if na and nb:
        print(f'  🔍 需人工判断: {a}({na}) vs {b}({nb})')

print()
print('=' * 30)
print('B. 生卒年逻辑（倒挂/离谱）')
print('=' * 30)
for mm in re.finditer(r'"id":\s*"([a-z0-9-]+)",\s*\n\s*"name":\s*"([^"]+)",\s*\n\s*"[^"]+",\s*\n\s*"era":\s*"([^"]+)"', d):
    pid, name, era = mm.groups()
    m2 = re.search(r'(\d{3,4})\s*[-–—~]\s*(\d{3,4})', era)
    if m2:
        b, dd = int(m2.group(1)), int(m2.group(2))
        if dd < b:
            print(f'  ✗ {pid}({name}): 卒年{dd} < 生年{b}')
        elif dd - b > 105:
            print(f'  ⚠️ {pid}({name}): 寿{dd-b} 岁存疑 ({b}-{dd})')

print()
print('=' * 30)
print('C. 样板句复制（概念 summary 尾部雷同）')
print('=' * 30)
tails = Counter()
for mm in re.finditer(r'"id":\s*"([a-z0-9-]+)",\s*\n\s*"title":\s*"([^"]+)",\s*\n\s*"category":\s*"([^"]+)",\s*\n\s*"summary":\s*"([^"]{100,600})"', d):
    tail = mm.group(4)[-60:]
    if '直指行者自心本具之真如实相' in tail or '破除对名相文字之死执' in tail:
        tails[mm.group(1)] = tail
print(f'  含通用样板尾句的条目: {len(tails)} 个')
if tails:
    sample = list(tails)[:5]
    print('  样例:', sample)

print()
print('=' * 30)
print('D. FAQ 重复问题 / E. 公案重复')
print('=' * 30)
faqs = re.findall(r'"id":\s*"(faq-\d+)",\s*\n\s*"question":\s*"([^"]+)"', d)
qc = Counter(q for _, q in faqs)
dupq = [(q, n) for q, n in qc.items() if n > 1]
print(f'  FAQ 重复问题: {len(dupq)} 组')
for q, n in dupq[:5]:
    print(f'    ×{n}: {q[:40]}')
kos = re.findall(r'"id":\s*"(koan-\d+)",\s*\n\s*"question":\s*"([^"]+)"', d)
kc = Counter(q for _, q in kos)
dupk = [(q, n) for q, n in kc.items() if n > 1]
print(f'  公案重复问题: {len(dupk)} 组')
for q, n in dupk[:5]:
    print(f'    ×{n}: {q[:40]}')

print()
print('=' * 30)
print('F. 经典连线自链接')
print('=' * 30)
selflinks = 0
for m in manifest:
    t = open('classics_markdown/' + m['filename'], encoding='utf-8').read()
    i = t.find('🔗 经典连线')
    if i < 0: continue
    seg = t[i:t.find('\n\n', i)]
    if f'/classics/{m["id"]})' in seg:
        print(f'  ✗ {m["id"]} 连线指向自己')
        selflinks += 1
print(f'  自链接: {selflinks} 处' if selflinks else '  无 ✓')

print()
print('=' * 30)
print('G. manifest word_count 虚报（±15% 容差）')
print('=' * 30)
bad_wc = []
for m in manifest:
    p = 'classics_markdown/' + m['filename']
    if not os.path.exists(p): continue
    body = open(p, encoding='utf-8').read()
    i = body.find('📜')
    actual = len(re.sub(r'\s', '', body[i:])) if i >= 0 else len(re.sub(r'\s', '', body))
    stated = m['word_count']
    if stated == 0 or abs(actual - stated) / max(stated, 1) > 0.15:
        bad_wc.append((m['id'], stated, actual))
print(f'  偏差超容差: {len(bad_wc)} 部')
for x in bad_wc[:6]:
    print(f'    {x[0]}: 标注{x[1]} 实际原文区{x[2]}')

print()
print('=' * 30)
print('H. 应用数据文件引用有效性')
print('=' * 30)
known = set(re.findall(r'"id":\s*"([^"]+)"', d)) | {m['id'] for m in manifest}
for f in ['lib/sidebar-concepts.json', 'lib/featured.ts', 'lib/glossary.ts']:
    if not os.path.exists(f): continue
    txt = open(f, encoding='utf-8').read()
    refs = set(re.findall(r"['\"]([a-z0-9][a-z0-9-]{2,})['\"]", txt))
    # 只看像 id 的（存在于 known 或明显是 id 模式且不在 known）
    bad = [r for r in refs if r not in known and ('-' in r or r in ('koan', 'qifo'))]
    print(f'  {f}: 可疑引用 {len(bad)}', bad[:6] if bad else '')
PYEOF = None
