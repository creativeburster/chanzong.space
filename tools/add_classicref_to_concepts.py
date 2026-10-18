# -*- coding: utf-8 -*-
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    '"id": "sheng-tie-ji-liang",\n    "title": "生铁脊梁",\n    "category": "看话禅",',
    '"id": "sheng-tie-ji-liang",\n    "title": "生铁脊梁",\n    "category": "看话禅",\n    "classicRef": "《雪岩祖钦禅师语录》卷二《普说》",'
)

text = text.replace(
    '"id": "ping-zuo-yi-wu",\n    "title": "屏作一无",\n    "category": "看话禅",',
    '"id": "ping-zuo-yi-wu",\n    "title": "屏作一无",\n    "category": "看话禅",\n    "classicRef": "《雪岩祖钦禅师语录》卷二《普说》",'
)

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Replaced and added classicRef!")
