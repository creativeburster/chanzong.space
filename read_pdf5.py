import fitz, re

doc = fitz.open('大慧语录.pdf')
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

# Skip TOC (first ~5000 chars), find actual content
# Content structure:
# 1. 進大慧禪師語錄奏劄 (~pos 1637 in content)
# 2. 大慧普覺禪師塔銘 (~pos 44224)
# 3. 室中機緣 / 語錄 (~pos 66696)
# 4. 頌古 (~pos 96049)
# 5. 普說 (~pos 86536)  
# 6. 法語 (~pos 133300)
# 7. 書信 (after 法語)

# Let's map the full structure
lines = full_text.split('\n')
content_start = 0
for i, line in enumerate(lines):
    if len(line) > 100 and i > 50:
        content_start = sum(len(l)+1 for l in lines[:i])
        break

content = full_text[content_start:]

# Find all major section headers with their positions
sections = []
for sec_name in ['奏劄', '塔銘', '語錄卷', '室中機緣', '頌古卷', '普說卷', '法語卷', '書信', '書卷']:
    for m in re.finditer(sec_name, content):
        # Get context
        ctx = content[max(0,m.start()-20):m.start()+50].replace('\n',' ')
        sections.append((m.start(), sec_name, ctx))

sections.sort(key=lambda x: x[0])
print("=== 内容区章节分布 ===")
for pos, name, ctx in sections[:40]:
    print(f'  {pos:6d}  {name:8s}  {ctx[:60]}')

# Find where 書 (letters) section starts
書_pos = content.find('書卷')
if 書_pos == -1:
    書_pos = content.find('書')
print(f'\n書信起始: {書_pos}')

# Count chars per section
print(f"\n=== 各章节字数 ===")
boundaries = [(0, '奏劄'), (44224, '塔銘'), (66696, '語錄/室中機緣'), (86536, '普說'), (133300, '法語'), (140050, '法語續')]
for i in range(len(boundaries)):
    start, name = boundaries[i]
    end = boundaries[i+1][0] if i+1 < len(boundaries) else len(content)
    chars = len(re.findall(r'[\u4e00-\u9fff]', content[start:end]))
    print(f'  {name}: {chars}字')

# Total
total = len(re.findall(r'[\u4e00-\u9fff]', content))
print(f'\n  总计: {total}字')
