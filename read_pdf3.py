import fitz, re

doc = fitz.open('大慧语录.pdf')
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

# Find main section markers
sections = ['語錄', '室中機緣', '頌古', '普說', '法語', '書', '示', '答', '偈', '讚', '下火', '入塔', '塔銘', '奏劄']

print("=== 主要章节分布 ===")
for sec in sections:
    positions = [m.start() for m in re.finditer(sec, full_text)]
    if positions:
        print(f'{sec}: {len(positions)}次, 首次位置={positions[0]}')

# Find where actual content starts (after table of contents)
# Look for first occurrence of "大慧" in content context
content_start = full_text.find('大慧普覺禪師塔銘')
if content_start == -1:
    content_start = full_text.find('進大慧')
print(f'\n内容起始位置: {content_start}')
print(f'内容起始: {full_text[content_start:content_start+200]}')

# Count Chinese characters only
chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', full_text))
print(f'\n中文字符数: {chinese_chars}')

# Show text around position 8000-9000 to see content structure
print(f'\n=== 位置8000-8500 ===')
print(full_text[8000:8500])
