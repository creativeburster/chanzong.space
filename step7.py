# -*- coding: utf-8 -*-
import re, json

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update yangqi-fanghui classics and relatedBooks
content = content.replace(
    '"\u6768\u5c90\u65b9\u4f1a\u7985\u5e08\u8bed\u5f55"\n    ],',
    '"\u6768\u5c90\u65b9\u4f1a\u7985\u5e08\u8bed\u5f55",\n      "\u6768\u5c90\u65b9\u4f1a\u548c\u5c1a\u540e\u5f55"\n    ],',
    1
)
content = content.replace(
    '"chanlinbaoxun"\n    , "fayanyulu"]',
    '"chanlinbaoxun", "fayanyulu", "yangqihoulu"\n    ]',
    1
)
print("Step 1: updated yangqi-fanghui")

# 2. Load data from JSON file
with open('step7_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 3. Insert concepts before ZEN_CONCEPTS end
concepts_marker = 'export const ZEN_CONCEPTS'
cs = content.index(concepts_marker)
ne = content.index('export const', cs + 10)
bracket = content.rfind('];', cs, ne)
brace = content.rfind('}', cs, bracket)
content = content[:brace] + '},\n' + data['concepts'] + '\n];' + content[bracket+2:]
print("Step 2: concepts added")

# 4. Insert method before ZEN_METHODS end
methods_marker = 'export const ZEN_METHODS'
ms = content.index(methods_marker)
ne2 = content.index('export const', ms + 10)
bracket2 = content.rfind(']', ms, ne2)
semicolon2 = content.index(';', bracket2)
brace2 = content.rfind('}', ms, bracket2)
content = content[:brace2] + '},\n' + data['methods'] + '\n]\n;' + content[semicolon2+1:]
print("Step 3: method added")

# 5. Insert koans before ZEN_KOANS end
koans_marker = 'export const ZEN_KOANS'
ks = content.index(koans_marker)
ne3 = content.index('export const', ks + 10)
bracket3 = content.rfind('];', ks, ne3)
brace3 = content.rfind('}', ks, bracket3)
content = content[:brace3] + '},\n' + data['koans'] + '\n];' + content[bracket3+2:]
print("Step 4: koans added")

# 6. Insert faqs before ZEN_FAQS end
faqs_marker = 'export const ZEN_FAQS'
fs = content.index(faqs_marker)
bracket4 = content.rfind('];', fs)
brace4 = content.rfind('}', fs, bracket4)
content = content[:brace4] + '},\n' + data['faqs'] + '\n];' + content[bracket4+2:]
print("Step 5: faqs added")

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("taxonomy.ts written successfully")
