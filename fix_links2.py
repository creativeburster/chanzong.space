import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix remaining links with correct IDs
fixes = {
    'wuran': {
        'persons': ['bodhidharma'],
        'methods': ['shouben-zhenxin'],
    },
    'xinwangming': {
        'persons': ['fudaoshi'],
    },
    'zhigong': {
        'persons': ['baozhi-chanshi'],
    },
    'dunwu': {
        'persons': ['dazhu-huihai'],
    },
    'zhengdaoge': {
        'persons': ['yongjia-xuanjue'],
    },
    'yongjia': {
        'persons': ['yongjia-xuanjue'],
    },
    'baojingsanmei': {
        'persons': ['dongshan-liangjia'],
    },
    'dongshanyulu': {
        'persons': ['dongshan-liangjia'],
    },
    'yunmen': {
        'persons': ['yunmen-wenyan'],
    },
    'shiniutu': {
        'persons': ['kuoan-shiyuan'],
    },
    'wumenguan': {
        'persons': ['wumen-huikai'],
    },
    'anxin': {
        'persons': ['daoxin'],
    },
    'zuishangcheng': {
        'persons': ['hongren'],
    },
    'shenhui': {
        'persons': ['shenhui'],
    },
    'xinxinming': {
        'persons': ['sengcan'],
    },
    'xiuxinjue': {
        'persons': ['puzhao-zhinin'],
    },
    'zhenxin': {
        'persons': ['puzhao-zhinin'],
    },
}

total_fixes = 0
for book_id, sections_to_fix in fixes.items():
    for section_name, ids_to_link in sections_to_fix.items():
        for item_id in ids_to_link:
            # Find the item by id
            for pattern in [f'"id": "{item_id}"', f"id: '{item_id}'", f"'id': '{item_id}'"]:
                id_pos = content.find(pattern)
                if id_pos != -1:
                    break
            else:
                print(f'WARNING: {item_id} not found')
                continue
            
            # Find relatedBooks after this id
            rb_pos = content.find('relatedBooks', id_pos)
            if rb_pos == -1:
                print(f'WARNING: relatedBooks not found for {item_id}')
                continue
            
            rb_end = content.find(']', rb_pos)
            rb_content = content[rb_pos:rb_end]
            
            if f"'{book_id}'" in rb_content or f'"{book_id}"' in rb_content:
                continue
            
            # Check if array is empty
            empty_check = content[rb_pos:rb_end+1]
            if '[]' in empty_check:
                content = content[:rb_pos] + content[rb_pos:].replace('[]', f"['{book_id}']", 1)
                total_fixes += 1
            else:
                last_quote = content.rfind("'", rb_pos, rb_end)
                if last_quote == -1:
                    last_quote = content.rfind('"', rb_pos, rb_end)
                
                if last_quote != -1:
                    content = content[:last_quote+1] + f", '{book_id}'" + content[last_quote+1:]
                    total_fixes += 1
                else:
                    print(f'WARNING: Could not insert for {item_id} -> {book_id}')

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Total links added: {total_fixes}')
