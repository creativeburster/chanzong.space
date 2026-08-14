import fitz

doc = fitz.open('无门关_临济语录_禅家龟鉴.pdf')
print(f'Total pages: {len(doc)}')
print()

for i in range(min(8, len(doc))):
    text = doc[i].get_text()
    print(f'=== Page {i+1} (len={len(text)}) ===')
    print(text[:600])
    print()
