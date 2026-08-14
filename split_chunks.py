import re

with open('dahui_content.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into sections
headers = list(re.finditer(r'(进大慧禅师语录奏札|大慧普觉禅师塔铭|大慧普觉禅师住.{2,20}语录卷第[一二三四五六七八九十]+|大慧普觉禅师语录卷第十|大慧普觉禅师偈颂卷第十一|大慧普觉禅师赞佛祖卷第十二|大慧普觉禅师普说卷第[一二三四五六七八九十]+|大慧普觉禅师法语卷第[一二三四五六七八九十]+|室中机缘)', content))

sections = []
for i, m in enumerate(headers):
    start = m.end()
    end = headers[i+1].start() if i+1 < len(headers) else len(content)
    text = content[start:end].strip()
    chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    if chars > 100:
        sections.append((m.group().strip(), text, chars))

# Split each section into ~400 char chunks by sentence
chunks = []
for name, text, chars in sections:
    # Clean text - join lines into continuous text
    text = re.sub(r'\n+', '', text)
    # Split by Chinese period
    sentences = re.split(r'([。])', text)
    # Recombine sentences into ~400 char chunks
    current = ''
    for s in sentences:
        current += s
        if len(re.findall(r'[\u4e00-\u9fff]', current)) >= 380:
            chunks.append(current.strip())
            current = ''
    if current.strip():
        chunks.append(current.strip())

print(f'总段数: {len(chunks)}')
print(f'平均字数: {sum(len(re.findall(r"[\u4e00-\u9fff]", c)) for c in chunks) / len(chunks):.0f}')

# Show first 5 and last 5 chunks
for i, c in enumerate(chunks[:5]):
    chars = len(re.findall(r'[\u4e00-\u9fff]', c))
    print(f'\n--- 段{i+1} ({chars}字) ---')
    print(c[:100])

print(f'\n...')
for i, c in enumerate(chunks[-3:]):
    chars = len(re.findall(r'[\u4e00-\u9fff]', c))
    print(f'\n--- 段{len(chunks)-2+i} ({chars}字) ---')
    print(c[:100])

# Save chunks for translation generation
with open('dahui_chunks.txt', 'w', encoding='utf-8') as f:
    for i, c in enumerate(chunks):
        f.write(f'=== 段{i+1} ===\n{c}\n\n')
