import fitz, re, opencc

doc = fitz.open('大慧语录.pdf')
converter = opencc.OpenCC('t2s')

# The TOC is roughly pages 1-5 (目次/编辑说明)
# Let's check each page's character count to find where content starts
print("=== 各页字数 ===")
for i in range(min(20, doc.page_count)):
    text = doc[i].get_text()
    chinese = len(re.findall(r'[\u4e00-\u9fff]', text))
    long_lines = sum(1 for l in text.split('\n') if len(l.strip()) > 50)
    print(f'  第{i+1}页: {chinese}字, 长行数={long_lines}, 前50字={text.strip()[:50]}')

# Based on the pattern, TOC pages have many short lines, content pages have long paragraphs
# Let's extract from the first content page
print("\n=== 第6-10页内容 ===")
for i in range(5, min(10, doc.page_count)):
    text = doc[i].get_text()
    print(f'\n--- 第{i+1}页 ---')
    print(text[:300])
