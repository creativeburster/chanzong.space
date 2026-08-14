import fitz, re, opencc

doc = fitz.open('大慧语录.pdf')
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

converter = opencc.OpenCC('t2s')
simplified = converter.convert(full_text)

# Remove page numbers and No. references
lines = simplified.split('\n')
cleaned_lines = []
for line in lines:
    stripped = line.strip()
    if re.match(r'^\d+$', stripped):
        continue
    if re.match(r'^No\.\s*\d+[A-Z]*$', stripped):
        continue
    cleaned_lines.append(line)

simplified = '\n'.join(cleaned_lines)

# Find where actual content starts - look for the real 奏札 content
# The TOC has short lines, real content has long paragraphs
# Find "臣僧蘊聞" which is in the actual 奏札 content
content_start = simplified.find('臣僧蕴闻')
if content_start == -1:
    content_start = simplified.find('蕴闻窃以')
if content_start == -1:
    # Fallback: find first long paragraph
    for i, line in enumerate(cleaned_lines):
        if len(line) > 80:
            content_start = sum(len(l)+1 for l in cleaned_lines[:i])
            break

print(f'正文起始位置: {content_start}')
print(f'起始内容: {simplified[content_start:content_start+200]}')

content = simplified[content_start:]

# Clean up
content = re.sub(r'\n{3,}', '\n\n', content)

# Save
with open('dahui_content.txt', 'w', encoding='utf-8') as f:
    f.write(content)

chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', content))
print(f'\n正文中文字符数: {chinese_chars}')

# Map sections
section_markers = [
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

print('\n=== 各章节位置与字数 ===')
positions = []
for name, marker in section_markers:
    # Find marker in content (not in TOC)
    pos = content.find(marker)
    if pos >= 0:
        positions.append((pos, name))
        
positions.sort(key=lambda x: x[0])

for i, (pos, name) in enumerate(positions):
    end = positions[i+1][0] if i+1 < len(positions) else len(content)
    chars = len(re.findall(r'[\u4e00-\u9fff]', content[pos:end]))
    print(f'  {pos:6d}  {name:12s}  {chars:6d}字')

print(f'\n  总计: {chinese_chars}字')
