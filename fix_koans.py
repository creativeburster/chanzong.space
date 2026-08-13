import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the 22 new koans: replace relatedQa with master + source fields
# The new koans are koan-219 through koan-240

masters = {
    "koan-219": "毗婆尸佛",
    "koan-220": "释迦牟尼佛",
    "koan-221": "牛头法融",
    "koan-222": "文殊师利菩萨",
    "koan-223": "菩提达摩",
    "koan-224": "菩提达摩",
    "koan-225": "菩提达摩",
    "koan-226": "菩提达摩",
    "koan-227": "牛头法融",
    "koan-228": "牛头法融",
    "koan-229": "菩提达摩",
    "koan-230": "三祖僧璨",
    "koan-231": "牛头法融",
    "koan-232": "五祖弘忍",
    "koan-233": "普照知讷",
    "koan-234": "大珠慧海",
    "koan-235": "普照知讷",
    "koan-236": "六祖惠能",
    "koan-237": "廓庵师远",
    "koan-238": "洞山良价",
    "koan-239": "永嘉玄觉",
    "koan-240": "玄奘大师",
}

sources = {
    "koan-219": "七佛传法偈",
    "koan-220": "七佛传法偈",
    "koan-221": "绝观论",
    "koan-222": "文殊说般若经",
    "koan-223": "无心论",
    "koan-224": "观心论",
    "koan-225": "五行论",
    "koan-226": "破相论",
    "koan-227": "无心论",
    "koan-228": "息诤论",
    "koan-229": "四行观",
    "koan-230": "信心铭",
    "koan-231": "方寸论",
    "koan-232": "最上乘论",
    "koan-233": "修心诀",
    "koan-234": "顿悟入道要门论",
    "koan-235": "真心直说",
    "koan-236": "荷泽神会语录",
    "koan-237": "十牛图",
    "koan-238": "宝镜三昧",
    "koan-239": "证道歌",
    "koan-240": "八识规矩颂",
}

# Replace each relatedQa line with master + source
for kid in masters:
    # Pattern: "relatedQa": "faq-xxx",
    pattern = f'"relatedQa": "faq-\\d+",'
    # Find the specific koan block
    # We need to find the block containing this koan id
    kid_pos = content.find(f'"id": "{kid}"')
    if kid_pos == -1:
        print(f'WARNING: {kid} not found!')
        continue
    
    # Find relatedQa after this position
    rq_pos = content.find('"relatedQa"', kid_pos)
    if rq_pos == -1:
        print(f'WARNING: relatedQa not found for {kid}')
        continue
    
    # Find the end of this relatedQa line
    line_end = content.find('\n', rq_pos)
    old_line = content[rq_pos:line_end].strip()
    
    new_lines = f'"master": "{masters[kid]}",\n    "source": "{sources[kid]}",'
    
    content = content[:rq_pos] + new_lines + content[line_end:]
    print(f'Fixed {kid}: {old_line} -> master={masters[kid]}, source={sources[kid]}')

# Also need to add relatedConcepts and relatedPersons arrays
# Check if new koans have them
for kid in masters:
    kid_pos = content.find(f'"id": "{kid}"')
    if kid_pos == -1:
        continue
    
    # Find the relatedBooks line after this koan
    rb_pos = content.find('"relatedBooks"', kid_pos)
    if rb_pos == -1:
        continue
    
    # Check if relatedConcepts exists before relatedBooks
    rc_pos = content.find('"relatedConcepts"', kid_pos)
    if rc_pos != -1 and rc_pos < rb_pos:
        continue  # Already has relatedConcepts
    
    # Need to add relatedConcepts and relatedPersons before relatedBooks
    rb_line_end = content.find('\n', rb_pos)
    rb_line = content[rb_pos:rb_line_end].strip()
    
    # Insert relatedConcepts and relatedPersons before relatedBooks
    new_text = f'"relatedConcepts": [],\n    "relatedPersons": [],\n    {rb_line}'
    content = content[:rb_pos] + new_text + content[rb_pos:]
    print(f'Added relatedConcepts/relatedPersons to {kid}')

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone fixing koans!')
