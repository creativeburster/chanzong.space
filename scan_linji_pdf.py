import fitz

doc = fitz.open('无门关_临济语录_禅家龟鉴.pdf')
print(f'Total pages: {len(doc)}')

# Find section markers
for i in range(len(doc)):
    text = doc[i].get_text()
    if '臨濟' in text and ('語錄' in text or '语录' in text):
        if i > 10:  # skip TOC pages
            first_line = text.strip().split('\n')[0] if text.strip() else ''
            print(f'Page {i+1}: {first_line[:80]}')
    if '禪家龜鑑' in text or '禅家龟鉴' in text:
        first_line = text.strip().split('\n')[0] if text.strip() else ''
        print(f'Page {i+1}: {first_line[:80]}')
    if '無門關' in text or '无门关' in text:
        first_line = text.strip().split('\n')[0] if text.strip() else ''
        print(f'Page {i+1}: {first_line[:80]}')
    if '附錄' in text or '附录' in text:
        first_line = text.strip().split('\n')[0] if text.strip() else ''
        print(f'Page {i+1}: {first_line[:80]}')
