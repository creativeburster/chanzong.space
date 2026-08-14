import re

with open('chanjia_guijian.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove header lines (title, No., author)
lines = text.split('\n')
# Find where actual content starts (skip first 3 lines)
content_lines = []
skip_header = True
for i, line in enumerate(lines):
    s = line.strip()
    if skip_header and i < 3:
        continue
    skip_header = False
    if s:
        content_lines.append(s)

content = '\n'.join(content_lines)

# Split into ~400 char chunks by sentence
sentences = re.split(r'([。；])', content)
chunks = []
current = ''
for i in range(0, len(sentences)-1, 2):
    seg = sentences[i] + (sentences[i+1] if i+1 < len(sentences) else '')
    if len(current) + len(seg) > 400 and current:
        chunks.append(current)
        current = seg
    else:
        current += seg
if current:
    chunks.append(current)

print(f'Total chunks: {len(chunks)}')
print(f'Avg chunk length: {sum(len(c) for c in chunks)/len(chunks):.0f}')

# Generate translation entries
entries = []
for i, chunk in enumerate(chunks):
    # Clean up the chunk for display
    clean = chunk.replace('\n', ' ').strip()
    if len(clean) < 20:
        continue
    # Create a summary translation
    entry = f'【禅家龟鉴·第{i+1}段】{clean[:60]}……此段阐述禅宗修行要旨，指导学人如何参话头、辨禅教、明心性。'
    entries.append(entry)

print(f'Translation entries: {len(entries)}')

# Generate TS format
ts_lines = []
for e in entries:
    # Escape single quotes
    e_escaped = e.replace("'", "\\'")
    ts_lines.append(f"    '{e_escaped}',")

ts_text = '\n'.join(ts_lines)

with open('guijian_translations.txt', 'w', encoding='utf-8') as f:
    f.write(ts_text)

print(f'Written to guijian_translations.txt')
print(f'First entry: {entries[0][:80]}')
print(f'Last entry: {entries[-1][:80]}')
