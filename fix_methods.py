import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: replace "name" with "title" in the 16 new method entries
# Also add classicRef field

method_names = [
    ("baoyuan-xing", "报冤行", "四行观"),
    ("suiyuan-xing", "随缘行", "四行观"),
    ("wusuoqiu-xing", "无所求行", "四行观"),
    ("chengfa-xing", "称法行", "四行观"),
    ("yixing-sammei", "一行三昧", "文殊说般若经"),
    ("guanxin-fa", "观心法门", "观心论"),
    ("po-xiang-fa", "破相法门", "破相论"),
    ("xi-zheng-fa", "息诤法门", "息诤论"),
    ("wunian-fa", "无念法门", "六祖坛经"),
    ("wuxiang-fa", "无相法门", "六祖坛经"),
    ("wuzhu-fa", "无住法门", "六祖坛经"),
    ("zhiguan-shuangxiu", "止观双修", "大乘起信论"),
    ("canjiu-fa", "参究法门", "信心铭"),
    ("jingxin-fa", "净心法门", "真心直说"),
    ("dunwu-fa", "顿悟法门", "顿悟入道要门论"),
    ("huixiang-fa", "回向法门", "大乘起信论"),
]

for mid, name, ref in method_names:
    # Replace "name" with "title" in each new entry
    # Find the entry by id
    id_pos = content.find(f'"id": "{mid}"')
    if id_pos == -1:
        print(f'WARNING: {mid} not found')
        continue
    
    # Find "name" after this id
    name_pos = content.find('"name"', id_pos)
    if name_pos == -1:
        print(f'WARNING: name not found for {mid}')
        continue
    
    # Replace "name" with "title" at this position
    content = content[:name_pos] + '"title"' + content[name_pos + len('"name"'):]
    
    # Add classicRef before relatedBooks
    rb_pos = content.find('"relatedBooks"', id_pos)
    if rb_pos != -1:
        # Check if classicRef already exists
        cr_pos = content.find('"classicRef"', id_pos)
        if cr_pos == -1 or cr_pos > rb_pos:
            content = content[:rb_pos] + f'"classicRef": "{ref}",\n    ' + content[rb_pos:]
    
    print(f'Fixed {mid}: name->title, classicRef={ref}')

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone!')
