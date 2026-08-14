import fitz, re, opencc

# Extract text
doc = fitz.open('大慧语录.pdf')
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

# Convert traditional to simplified
converter = opencc.OpenCC('t2s')
simplified = converter.convert(full_text)

# Clean up: remove page numbers, excessive whitespace
# Remove standalone number lines (page numbers)
lines = simplified.split('\n')
cleaned_lines = []
for line in lines:
    stripped = line.strip()
    # Skip pure number lines (page numbers)
    if re.match(r'^\d+$', stripped):
        continue
    # Skip "No. XXXX" references
    if re.match(r'^No\.\s*\d+[A-Z]*$', stripped):
        continue
    cleaned_lines.append(line)

simplified = '\n'.join(cleaned_lines)

# Remove the TOC (first ~5000 chars are table of contents)
# Find where actual content starts
content_start = simplified.find('进大慧禅师语录奏札')
if content_start == -1:
    content_start = 0
# Find the second occurrence (first is in TOC)
second = simplified.find('进大慧禅师语录奏札', content_start + 1)
if second > content_start + 100:
    # First was TOC, use second
    content_start = second

content = simplified[content_start:]

# Clean up remaining TOC artifacts
content = re.sub(r'\n{3,}', '\n\n', content)

# Save
with open('dahui_simplified.txt', 'w', encoding='utf-8') as f:
    f.write(content)

# Count
chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', content))
print(f'提取内容起始位置: {content_start}')
print(f'中文字符数: {chinese_chars}')
print(f'内容前200字: {content[:200]}')

# Check for remaining traditional characters
trad_indicators = ['禪', '錄', '說', '編', '輯', '進', '劄', '覺', '師', '語']
remaining_trad = {}
for char in trad_indicators:
    count = content.count(char)
    if count > 0:
        remaining_trad[char] = count
if remaining_trad:
    print(f'\n残留繁体字: {remaining_trad}')
else:
    print('\n无繁体残留 ✅')

# Find major sections
sections = re.findall(r'(大慧普觉禅师.{0,20}语录卷第[一二三四五六七八九十]+|室中机缘|颂古|普说卷第[一二三四五六七八九十]+|法语卷第[一二三四五六七八九十]+|大慧普觉禅师塔铭|进大慧禅师语录奏札)', content)
print(f'\n章节标记: {len(sections)}个')
for s in sections[:30]:
    pos = content.find(s)
    print(f'  {pos:6d}  {s}')
