import re

with open('dahui_content.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract key passages for the markdown
# We need representative passages from each major section

# Find sections
headers = list(re.finditer(r'(进大慧禅师语录奏劄|大慧普觉禅师塔铭|大慧普觉禅师住.{2,20}语录卷第[一二三四五六七八九十]+|大慧普觉禅师语录卷第十|大慧普觉禅师偈颂卷第十一|大慧普觉禅师赞佛祖卷第十二|大慧普觉禅师普说卷第[一二三四五六七八九十]+|大慧普觉禅师法语卷第[一二三四五六七八九十]+|室中机缘)', content))

sections = []
for i, m in enumerate(headers):
    start = m.end()
    end = headers[i+1].start() if i+1 < len(headers) else len(content)
    text = content[start:end].strip()
    chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    if chars > 100:
        sections.append((m.group().strip(), text, chars))

# Build the original text section - select representative passages
# For a 182K char text, we'll include key passages from each section
# Aim for ~15-20% of total (about 30K chars) in the markdown

original_parts = []
for name, text, chars in sections:
    # Clean up the text - remove extra whitespace
    text = re.sub(r'\n{2,}', '\n', text)
    text = text.strip()
    
    # For sections < 2000 chars, include all
    if chars <= 2000:
        original_parts.append(f'### {name}\n\n{text}')
    # For larger sections, take first ~1500 chars
    else:
        # Take first portion
        first_part = text[:1500]
        original_parts.append(f'### {name}\n\n{first_part}\n\n[……此处省略部分原文……]')

original_text = '\n\n'.join(original_parts)

# Save to a temp file for reading
with open('dahui_original_excerpt.txt', 'w', encoding='utf-8') as f:
    f.write(original_text)

orig_chars = len(re.findall(r'[\u4e00-\u9fff]', original_text))
print(f'选录原文: {orig_chars}字')

# Also extract key quotes for the 导读
key_quotes = []
# Find famous sayings
famous_patterns = [
    r'看话头.*?疑情.*?[。]',
    r'无.*?字.*?参.*?[。]',
    r'疑.*?参.*?[。]',
    r'生死事大.*?[。]',
    r'宗.*?门.*?一.*?路.*?[。]',
]

# Extract some notable passages
notable = []
for name, text, chars in sections:
    # Find "师云" passages that are insightful
    shi_yun = re.findall(r'师云[。：](.{20,100}[。])', text)
    for q in shi_yun[:2]:
        notable.append(q.strip())

print(f'\n notable passages: {len(notable)}')
for q in notable[:10]:
    print(f'  {q[:80]}')
