import json, re, os

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    trans_content = f.read()

results = []
total_trans = 0
total_classics_with_trans = 0

for item in manifest:
    book_id = item['id']
    filename = item['filename']
    
    # Count translation entries
    # Pattern: 'bookId': [ ... ] or "bookId": [ ... ]
    pattern = rf"""['"]?{re.escape(book_id)}['"]?\s*:"""
    match = re.search(pattern, trans_content)
    if match:
        # Find the array after this key
        start = trans_content.find('[', match.end())
        end = trans_content.find(']', start)
        if start != -1 and end != -1:
            arr_text = trans_content[start:end]
            # Count string entries (lines with quotes)
            count = len(re.findall(r"""['"].*['"]""", arr_text))
        else:
            count = 0
    else:
        count = 0
    
    # Count original text paragraphs in markdown
    md_path = f'classics_markdown/{filename}'
    if os.path.exists(md_path):
        with open(md_path, 'r', encoding='utf-8') as f:
            md = f.read()
        # Count paragraphs in the 原文 section
        yuanwen_pos = md.find('## 原文')
        if yuanwen_pos != -1:
            yuanwen = md[yuanwen_pos:]
            # Count non-empty lines that aren't headers
            paragraphs = [l for l in yuanwen.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('---')]
            para_count = len(paragraphs)
        else:
            para_count = 0
    else:
        para_count = 0
    
    coverage = (count / para_count * 100) if para_count > 0 else 0
    results.append((book_id, item['title'], count, para_count, coverage))
    total_trans += count
    if count > 0:
        total_classics_with_trans += 1

print(f'{"ID":<25} {"经典":<20} {"翻译":>4} {"原文":>4} {"覆盖率":>6}')
print('-' * 70)
for bid, title, trans, paras, cov in results:
    status = '✓' if cov >= 95 else '✗' if cov < 50 else '△'
    print(f'{bid:<25} {title[:18]:<20} {trans:>4} {paras:>4} {cov:>5.0f}% {status}')

print(f'\n总计: {total_trans}条翻译, {total_classics_with_trans}/44部有翻译')
low = [r for r in results if r[4] < 95]
print(f'覆盖率<95%的经典: {len(low)}部')
for bid, title, t, p, c in low:
    print(f'  {bid}: {title} ({t}翻译/{p}段落, {c:.0f}%)')
