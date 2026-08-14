import fitz, re, opencc

doc = fitz.open('大慧语录.pdf')
converter = opencc.OpenCC('t2s')

# Skip first 9 pages (TOC + editorial note), content starts at page 10 (index 9)
content_text = ''
for i in range(9, doc.page_count):
    page_text = doc[i].get_text()
    # Remove page numbers (standalone digits) and No. references
    lines = page_text.split('\n')
    for line in lines:
        s = line.strip()
        if re.match(r'^\d+$', s):
            continue
        if re.match(r'^No\.\s*\d+', s):
            continue
        if s == '赞助资讯':
            continue
        content_text += line + '\n'

# Convert to simplified
simplified = converter.convert(content_text)

# Clean up
simplified = re.sub(r'\n{3,}', '\n\n', simplified)
simplified = simplified.strip()

# Save
with open('dahui_content.txt', 'w', encoding='utf-8') as f:
    f.write(simplified)

# Count
chinese = len(re.findall(r'[\u4e00-\u9fff]', simplified))
print(f'正文中文字符数: {chinese}')

# Check traditional residue
trad_chars = set('禪錄說編輯進覺師語卷第頌古普法室機緣塔銘奏')
found_trad = [c for c in trad_chars if c in simplified and c != '劄']
if found_trad:
    print(f'残留繁体: {found_trad}')
else:
    print('无繁体残留 ✅')

# Map sections
sections = [
    ('奏札', '进大慧禅师语录奏札'),
    ('语录卷1', '语录卷第一'),
    ('语录卷2', '语录卷第二'),
    ('语录卷3', '语录卷第三'),
    ('语录卷4', '语录卷第四'),
    ('语录卷5', '语录卷第五'),
    ('语录卷6', '语录卷第六'),
    ('语录卷7', '语录卷第七'),
    ('语录卷8', '语录卷第八'),
    ('语录卷9', '语录卷第九'),
    ('室中机缘', '室中机缘'),
    ('颂古卷10', '语录卷第十'),
    ('偈颂卷11', '偈颂卷第十一'),
    ('赞佛祖卷12', '赞佛祖卷第十二'),
    ('普说卷13', '普说卷第十三'),
    ('普说卷14', '普说卷第十四'),
    ('普说卷15', '普说卷第十五'),
    ('普说卷16', '普说卷第十六'),
    ('普说卷17', '普说卷第十七'),
    ('普说卷18', '普说卷第十八'),
    ('法语卷19', '法语卷第十九'),
    ('法语卷20', '法语卷第二十'),
]

print('\n=== 各章节字数 ===')
positions = []
for name, marker in sections:
    pos = simplified.find(marker)
    if pos >= 0:
        positions.append((pos, name, marker))

positions.sort(key=lambda x: x[0])

for i, (pos, name, marker) in enumerate(positions):
    end = positions[i+1][0] if i+1 < len(positions) else len(simplified)
    chars = len(re.findall(r'[\u4e00-\u9fff]', simplified[pos:end]))
    print(f'  {name:12s}  {chars:6d}字  ({pos})')

print(f'\n  总计: {chinese}字')
print(f'\n前300字: {simplified[:300]}')
