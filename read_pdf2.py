import fitz
doc = fitz.open('大慧语录.pdf')
print(f'总页数: {doc.page_count}')

# Extract all text
full_text = ''
for i in range(doc.page_count):
    full_text += doc[i].get_text()

print(f'总字符数: {len(full_text)}')

# Check if it's traditional
trad_chars = '編輯說明章節目次進大慧禪師語錄奏劄'
simp_chars = '编辑说明章节目录进大慧禅师语录奏札'
has_trad = any(c in full_text for c in '禪錄說編輯進劄')
has_simp = any(c in full_text for c in '禅录说编辑进札')
print(f'包含繁体字: {has_trad}')
print(f'包含简体字: {has_simp}')

# Save raw text
with open('dahui_raw.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)
print('已保存到 dahui_raw.txt')

# Show structure - find chapter markers
import re
chapters = re.findall(r'.{0,10}(卷[一二三四五六七八九十]+|第[一二三四五六七八九十]+卷|普說|語錄|書|示|頌古|法語|室中機緣).{0,10}', full_text[:5000])
print(f'\n前5000字中的章节标记: {chapters[:20]}')
