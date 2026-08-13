import json, re

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    trans_content = f.read()

results = []
for item in manifest:
    book_id = item['id']
    # Count translation entries by finding the array
    pattern = rf"""['"]?{re.escape(book_id)}['"]?\s*:"""
    match = re.search(pattern, trans_content)
    if match:
        start = trans_content.find('[', match.end())
        end = trans_content.find(']', start)
        if start != -1 and end != -1:
            arr_text = trans_content[start:end]
            count = len(re.findall(r"""['"].*['"]""", arr_text))
        else:
            count = 0
    else:
        count = 0
    results.append((book_id, item['title'], count))

results.sort(key=lambda x: x[2])
print(f'{"ID":<25} {"经典":<25} {"翻译数":>4}')
print('-' * 60)
for bid, title, c in results:
    status = '✗' if c < 8 else '△' if c < 12 else '✓'
    print(f'{bid:<25} {title[:23]:<25} {c:>4} {status}')

total = sum(r[2] for r in results)
print(f'\n总计: {total}条翻译, 平均{total/len(results):.1f}条/经典')
low = [r for r in results if r[2] < 8]
print(f'翻译<8条的经典: {len(low)}部')
for bid, title, c in low:
    print(f'  {bid}: {title} ({c}条)')
