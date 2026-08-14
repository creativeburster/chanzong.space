import re

# Read the generated translations
with open('dahui_translations.txt', 'r', encoding='utf-8') as f:
    trans_content = f.read()

# Read translations.ts
with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Find the insertion point - after huanwuyulu's closing ],  and before };
# The pattern is:
#   ],
#
# };

# Insert dahuiyulu: [ ... ] before the final };
insertion = f'  dahuiyulu: [\n{trans_content}\n  ],\n'

# Find the final };
ts_content = ts_content.replace('\n};', '\n' + insertion + '\n};')

# But we need to be more precise - find the last ], before };
# Actually let's just replace the pattern at the end
# The file ends with:
#   ],
#
# };

# Let's insert after the last ],
result = ts_content.replace('\n\n};', '\n' + insertion + '\n};')

with open('lib/translations.ts', 'w', encoding='utf-8') as f:
    f.write(result)

# Verify
with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    verify = f.read()

# Count dahuiyulu entries
dahui_section = verify[verify.find('dahuiyulu: ['):verify.find('dahuiyulu: [') + 100000]
dahui_entries = dahui_section.count("    '")
print(f'dahuiyulu翻译条目数: {dahui_entries}')

# Check file ends properly
if verify.rstrip().endswith('};'):
    print('文件结尾正确 ✅')
else:
    print('文件结尾异常 ❌')
    print(verify[-200:])
