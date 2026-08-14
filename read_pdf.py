import fitz
doc = fitz.open('大慧语录.pdf')
print(f'页数: {doc.page_count}')
for i in range(min(5, doc.page_count)):
    text = doc[i].get_text()
    print(f'\n--- 第{i+1}页 (前800字) ---')
    print(text[:800])
