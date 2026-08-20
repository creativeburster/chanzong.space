#!/usr/bin/env python3
"""Print full entries for pending persons"""
import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

c = open('lib/taxonomy.ts', encoding='utf-8').read()
for eid in ['wansong-xingxiu', 'tongrong', 'yinyuan-longqi', 'tianyi-yihuai', 'kaifu-daoning']:
    pos = c.find('"id": "%s"' % eid)
    end = c.find('\n  },', pos)
    print('='*30, eid, '='*30)
    print(c[pos-30:end+5])
    print()
