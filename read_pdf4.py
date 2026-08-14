import fitz, re

doc = fitz.open('大慧语录.pdf')
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

# The TOC seems to end around position 5000-6000, actual content starts after
# Let's find where real content begins - look for "大慧普覺禪師塔銘" as actual content (not TOC)
# TOC entries are short lines, content has longer paragraphs

# Find all occurrences of key section headers
headers = {
    '塔銘': '大慧普覺禪師塔銘',
    '奏劄': '進大慧禪師語錄奏劄',
    '室中機緣': '室中機緣',
    '頌古': '頌古',
    '普說': '普說',
    '法語': '法語',
    '書信': '書',
}

# Find the second occurrence of 塔銘 (first is in TOC)
positions塔銘 = [m.start() for m in re.finditer('大慧普覺禪師塔銘', full_text)]
print(f"塔銘 positions: {positions塔銘}")

# Find where actual content starts - look for longer text blocks
# TOC has short lines, content has paragraphs
lines = full_text.split('\n')
content_start_line = 0
for i, line in enumerate(lines):
    if len(line) > 100 and i > 50:  # First long line after TOC
        content_start_line = i
        print(f"\n内容起始行: {i}")
        print(f"内容: {line[:200]}")
        break

# Find section boundaries in content area
content_text = '\n'.join(lines[content_start_line:])

# Major sections
major_sections = ['進大慧禪師語錄奏劄', '大慧普覺禪師塔銘', '室中機緣', '頌古', '普說', '法語']
print("\n=== 主要章节位置（内容区域）===")
for sec in major_sections:
    positions = [m.start() for m in re.finditer(sec, content_text)]
    if positions:
        print(f'{sec}: {len(positions)}次, 位置={positions[:5]}')

# Count total Chinese chars in content area
chinese_in_content = len(re.findall(r'[\u4e00-\u9fff]', content_text))
print(f'\n内容区中文字符数: {chinese_in_content}')

# Show structure around 法語 section
法語_pos = content_text.find('法語')
if 法語_pos > 0:
    print(f'\n=== 法語章节附近 ===')
    print(content_text[法語_pos:法語_pos+300])
