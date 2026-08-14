with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('guijian_translations.txt', 'r', encoding='utf-8') as f:
    trans = f.read().strip()

# Insert before the closing };
marker = '\n};'
idx = content.rfind(marker)

new_section = f"\n\n  chanjia_guijian: [\n{trans}\n  ],\n"

content = content[:idx] + new_section + content[idx:]

with open('lib/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    verify = f.read()

count = verify.count('chanjia_guijian:')
print(f"chanjia_guijian occurrences: {count}")
print("Done")
