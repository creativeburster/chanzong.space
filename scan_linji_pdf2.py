import fitz

doc = fitz.open('无门关_临济语录_禅家龟鉴.pdf')
print(f'Total pages: {len(doc)}')

# Check key boundary pages
for pg in [12, 13, 42, 43, 44, 62, 63, 88, 89, 90]:
    text = doc[pg-1].get_text()
    lines = [l.strip() for l in text.strip().split('\n') if l.strip()]
    print(f'\n=== Page {pg} (len={len(text)}) ===')
    for l in lines[:5]:
        print(f'  {l[:100]}')
