import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix missing relatedBooks links
# Map: book_id -> list of person/method IDs that should reference it
fixes = {
    # Persons that should link to classics
    'wumenguan': {
        'persons': ['wumen-huikai'],
        'methods': ['wumen'],
    },
    'wuran': {
        'persons': ['padma-dodhi', 'niutou-farong'],
        'methods': ['shouben-zhenxin'],
    },
    'fangcunlun': {
        'persons': ['niutou-farong'],
    },
    'wuxinlun': {
        'persons': ['bodhidharma', 'niutou-farong'],
        'methods': ['wunian-fa'],
    },
    'xinwangming': {
        'persons': ['niutou-farong', 'fudashi'],
        'methods': ['jingxin-fa'],
    },
    'qifo': {
        'methods': ['nianfo-chan'],
    },
    'zhigong': {
        'persons': ['baozhi'],
        'methods': ['jingxin-fa'],
    },
    'bashiguijusong': {
        'persons': ['xuanzang'],
        'methods': ['zhiguan-shuangxiu'],
    },
    'xixulun': {
        'methods': ['xi-zheng-fa'],
    },
    'juelin': {
        'persons': ['niutou-farong'],
    },
    'wenshu': {
        'methods': ['yixing-sammei'],
    },
    'xiuxinjue': {
        'methods': ['jingxin-fa', 'zhiguan-shuangxiu'],
    },
    'zhenxin': {
        'methods': ['jingxin-fa'],
    },
    'dunwu': {
        'methods': ['dunwu-fa'],
        'persons': ['dazhu-huihai'],
    },
    'sixingguan': {
        'methods': ['baoyuan-xing', 'suiyuan-xing', 'wusuoqiu-xing', 'chengfa-xing'],
    },
    'xinxinming': {
        'methods': ['canjiu-fa'],
        'persons': ['sengcan'],
    },
    'zhengdaoge': {
        'methods': ['canjiu-fa', 'dunwu-fa'],
        'persons': ['yongjia-xuanjue'],
    },
    'fangcunlun': {
        'methods': ['jingxin-fa'],
    },
    'poxianglun': {
        'methods': ['po-xiang-fa'],
    },
    'zhangzhi': {
        'methods': ['guanxin-fa'],
    },
    'wuxinglun': {
        'methods': ['zhiguan-shuangxiu'],
    },
    'yuanjuejing': {
        'methods': ['zhiguan-shuangxiu'],
    },
    'dachengqixinlun': {
        'methods': ['zhiguan-shuangxiu', 'huixiang-fa'],
    },
    'lengyanjing': {
        'methods': ['zhiguan-shuangxiu'],
    },
    'weimojiejing': {
        'methods': ['zhiguan-shuangxiu'],
    },
    'baojingsanmei': {
        'methods': ['mozhao'],
        'persons': ['dongshan-liangjia'],
    },
    'dongshanyulu': {
        'methods': ['mozhao'],
        'persons': ['dongshan-liangjia', 'caoshan-benji', 'yunyan-tancheng'],
    },
    'yongjia': {
        'methods': ['dunwu-fa'],
        'persons': ['yongjia-xuanjue'],
    },
    'yunmen': {
        'persons': ['yunmen-wenyan', 'muzhou-daoming'],
    },
    'anxin': {
        'methods': ['yixing-sammei', 'nianfo-chan'],
        'persons': ['daoxin'],
    },
    'zuishangcheng': {
        'persons': ['hongren'],
        'methods': ['jingxin-fa'],
    },
    'shenhui': {
        'persons': ['shenhui'],
    },
    'jingangjing': {
        'methods': ['guan-zizai-banya-practice'],
    },
    'xinjing': {
        'methods': ['guan-zizai-banya-practice'],
    },
    'huanwuxinyao': {
        'persons': ['yuanwu-keqin', 'huqiu-shaolong', 'xuedou-zhongxian'],
        'methods': ['kanhuatou'],
    },
    'huanwuyulu': {
        'persons': ['yuanwu-keqin', 'huqiu-shaolong'],
        'methods': ['kanhuatou'],
    },
    'changuancejin': {
        'persons': ['zhuhong', 'gaofeng-yuanmiao', 'zhongfeng-mingben', 'xueyan-zuqin', 'poan-zuxian', 'wuzhun-shifan'],
        'methods': ['kanhuatou'],
    },
    'shiniutu': {
        'persons': ['kuoan-shiyuan'],
        'methods': ['muniu-tuxi'],
    },
}

total_fixes = 0
for book_id, sections_to_fix in fixes.items():
    for section_name, ids_to_link in sections_to_fix.items():
        for item_id in ids_to_link:
            # Find the item by id in the appropriate section
            # Find the relatedBooks array in this item
            id_pattern = f'"id": "{item_id}"'
            id_pos = content.find(id_pattern)
            if id_pos == -1:
                # Try single quote format
                id_pattern = f"id: '{item_id}'"
                id_pos = content.find(id_pattern)
            if id_pos == -1:
                # Try double quote with single quotes
                id_pattern = f"'id': '{item_id}'"
                id_pos = content.find(id_pattern)
            
            if id_pos == -1:
                print(f'WARNING: {item_id} not found in taxonomy')
                continue
            
            # Find relatedBooks after this id
            rb_pos = content.find('relatedBooks', id_pos)
            if rb_pos == -1:
                print(f'WARNING: relatedBooks not found for {item_id}')
                continue
            
            # Check if book_id is already in the relatedBooks array
            rb_end = content.find(']', rb_pos)
            rb_content = content[rb_pos:rb_end]
            
            if f"'{book_id}'" in rb_content or f'"{book_id}"' in rb_content:
                continue  # Already linked
            
            # Add book_id to the relatedBooks array
            # Find the last element before ]
            # Check if array is empty []
            empty_check = content[rb_pos:rb_end+1]
            if '[]' in empty_check:
                # Replace [] with ['book_id']
                content = content[:rb_pos] + content[rb_pos:].replace('[]', f"['{book_id}']", 1)
                total_fixes += 1
            else:
                # Add before ]
                # Find the last quote before ]
                last_quote = content.rfind("'", rb_pos, rb_end)
                if last_quote == -1:
                    last_quote = content.rfind('"', rb_pos, rb_end)
                
                if last_quote != -1:
                    # Insert , 'book_id' after the last quote
                    content = content[:last_quote+1] + f", '{book_id}'" + content[last_quote+1:]
                    total_fixes += 1
                else:
                    print(f'WARNING: Could not find insertion point for {item_id} -> {book_id}')

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Total links added: {total_fixes}')
