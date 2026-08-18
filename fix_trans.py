# -*- coding: utf-8 -*-
"""Fix translations.ts: remove placeholder, add real huangbo_wanlinglu translations"""

content = open('lib/translations.ts', 'r', encoding='utf-8').read()

# Fix double comma
content = content.replace("\u3002',,\n  ],", "\u3002',\n  ],")

# Read translations from separate file
trans = open('wanlinglu_trans.txt', 'r', encoding='utf-8').read().strip()

# Replace placeholder block
old = "  huangbo_wanlinglu: [\n    'placeholder',\n  ],"
new = "  huangbo_wanlinglu: [\n" + trans + "\n  ],"
content = content.replace(old, new)

open('lib/translations.ts', 'w', encoding='utf-8').write(content)
print('Done, translations added')
