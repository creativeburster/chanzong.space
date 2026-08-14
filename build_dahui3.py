import fitz, re, opencc

doc = fitz.open('大慧语录.pdf')
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

converter = opencc.OpenCC('t2s')
simplified = converter.convert(full_text)

# Remove page numbers
lines = simplified.split('\n')
cleaned = []
for line in lines:
    s = line.strip()
    if re.match(r'^\d+$', s):
        continue
    if re.match(r'^No\.\s*\d+', s):
        continue
    cleaned.append(line)

text = '\n'.join(cleaned)

# The TOC is at the beginning. Find where actual content starts.
# Look for the pattern that indicates real content: "宋" or "绍兴" followed by long text
# Or find "师绍兴" which appears in the first 卷
content_markers = [
    '师绍兴七年',
    '师绍兴',
    '蕴闻窃以',
    '臣僧蕴闻',
    '径山能仁禅院住持嗣法',
]

# Find first long content paragraph
for marker in content_markers:
    pos = text.find(marker)
    if pos > 0:
        # Check if this is in content (not TOC) by checking line length
        line_start = text.rfind('\n', 0, pos) + 1
        line_end = text.find('\n', pos)
        line = text[line_start:line_end]
        if len(line) > 50:
            print(f'Found content at pos {pos}: {line[:100]}')
            # Now find the actual beginning - go back to find the section header
            # Look backwards for "奏札" or "语录卷第一"
            search_back = text[max(0, pos-5000):pos]
            奏札_pos = search_back.rfind('进大慧禅师语录奏札')
            if 奏札_pos >= 0:
                actual_start = max(0, pos-5000) + 奏札_pos
                print(f'Actual start at pos {actual_start}')
            else:
                actual_start = pos
                print(f'Using marker pos as start: {actual_start}')
            
            content = text[actual_start:]
            chinese = len(re.findall(r'[\u4e00-\u9fff]', content))
            print(f'Content chars: {chinese}')
            print(f'First 300: {content[:300]}')
            break

# Alternative: just find all "卷第X" markers and extract between them
print('\n=== All 卷第 markers ===')
for m in re.finditer(r'(大慧普觉禅师.{0,30}卷第[一二三四五六七八九十]+|普说卷第[一二三四五六七八九十]+|法语卷第[一二三四五六七八九十]+|偈颂卷第[一二三四五六七八九十]+|赞佛祖卷第[一二三四五六七八九十]+|室中机缘)', text):
    pos = m.start()
    # Check if this is content (has longer text after it)
    after = text[pos:pos+200]
    lines_after = after.split('\n')
    long_lines = [l for l in lines_after[1:6] if len(l.strip()) > 30]
    if long_lines:
        print(f'  {pos:6d}  {m.group()[:40]}  [content]')
