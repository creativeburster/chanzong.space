import re

with open('dahui_content.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# The issue is that section headers appear multiple times (once as header, once as page footer)
# Let's use a simpler approach: just split by the main headers and accumulate

# Find all header positions
headers = list(re.finditer(r'(进大慧禅师语录奏劄|大慧普觉禅师塔铭|大慧普觉禅师住.{2,20}语录卷第[一二三四五六七八九十]+|大慧普觉禅师语录卷第十|大慧普觉禅师偈颂卷第十一|大慧普觉禅师赞佛祖卷第十二|大慧普觉禅师普说卷第[一二三四五六七八九十]+|大慧普觉禅师法语卷第[一二三四五六七八九十]+|室中机缘)', content))

print(f"Found {len(headers)} headers")

# Deduplicate - only keep headers that are followed by substantial content
# (not page footer repetitions)
sections = []
for i, m in enumerate(headers):
    start = m.end()
    # Find next header
    end = headers[i+1].start() if i+1 < len(headers) else len(content)
    text = content[start:end]
    chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    if chars > 100:  # Skip headers with very little content (page footers)
        sections.append((m.group(), m.start(), text, chars))

print(f"\n=== {len(sections)} sections with content ===")
for name, pos, text, chars in sections:
    print(f'  {pos:6d}  {name[:40]:40s}  {chars:6d}字')

total = sum(s[3] for s in sections)
print(f'\n总计: {total}字')

# Show first few sections' content
for name, pos, text, chars in sections[:3]:
    print(f'\n=== {name[:30]} ({chars}字) ===')
    print(text[:300])
