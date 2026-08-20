#!/usr/bin/env python3
"""Inspect exact entries for pending persons/concepts/methods"""
import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

c = open('lib/taxonomy.ts', encoding='utf-8').read()

ids = ['wansong-xingxiu', 'yelv-chucai', 'tongrong', 'yinyuan-longqi', 'tianyi-yihuai',
       'kaifu-daoning', 'furong-daokai', 'benjue-shijue']

for eid in ids:
    pos = c.find('"id": "%s"' % eid)
    if pos == -1:
        # try single quotes
        pos = c.find("id: '%s'" % eid)
    print(f'\n===== {eid} (pos {pos}) =====')
    if pos != -1:
        seg = c[pos:pos+900]
        for field in ['"title"', '"name"', '"classicRef"', '"relatedBooks"', 'relatedBooks']:
            m = re.search(re.escape(field) + r':\s*(\[[^\]]*\]|"[^"]*"|\'[^\']*\')', seg)
            if m:
                print(' ', field, '=', m.group(1)[:140])
