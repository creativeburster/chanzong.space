import os, re

# Real traditional→simplified mappings (excluding 著 which needs contextual handling)
T2S_SIMPLE = {
    '禪':'禅','穢':'秽','時':'时','難':'难','壇':'坛','寶':'宝','閣':'阁',
    '懷':'怀','傳':'传','踰':'逾','過':'过','攷':'考','闘':'斗',
}

# 著→着 only when used as particle, NOT in compounds: 著作/著名/著录/著稱/著者/著述/著書
# Pattern: 著 followed by 作/名/录/錄/稱/称/者/述/書/书/文/說/说 → keep 著
KEEP_AFTER = set('作名录錄稱称者述書书文说說')

def fix_text(text):
    # First fix simple trad chars
    for trad, simp in T2S_SIMPLE.items():
        text = text.replace(trad, simp)
    
    # Fix 著→着 contextually
    result = []
    i = 0
    while i < len(text):
        if text[i] == '著':
            # Check if next char suggests it's a compound (著作, 著名, etc.)
            if i + 1 < len(text) and text[i+1] in KEEP_AFTER:
                result.append('著')  # keep
            else:
                result.append('着')  # particle usage → 着
        else:
            result.append(text[i])
        i += 1
    
    return ''.join(result)

files_to_fix = [
    'lib/taxonomy.ts',
    'lib/translations.ts',
    'lib/glossary.ts',
    'app/layout.tsx',
]

md_dir = 'classics_markdown'
if os.path.exists(md_dir):
    for fn in sorted(os.listdir(md_dir)):
        if fn.endswith('.md'):
            files_to_fix.append(f'{md_dir}/{fn}')

total_fixed = 0
for filepath in files_to_fix:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
        
        fixed = fix_text(original)
        
        if fixed != original:
            # Count changes
            changes = sum(1 for a, b in zip(original, fixed) if a != b)
            total_fixed += changes
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print(f'Fixed {filepath}: {changes} chars replaced')
        else:
            print(f'OK {filepath}: no changes needed')
    except Exception as e:
        print(f'Error: {filepath}: {e}')

print(f'\nTotal chars fixed: {total_fixed}')
