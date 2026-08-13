import json, re

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Count relatedBooks references in each section
sections = {
    'persons': content.split('ZEN_PERSONS')[1].split('ZEN_CONCEPTS')[0],
    'concepts': content.split('ZEN_CONCEPTS')[1].split('ZEN_METHODS')[0],
    'methods': content.split('ZEN_METHODS')[1].split('ZEN_KOANS')[0],
    'koans': content.split('ZEN_KOANS')[1].split('ZEN_FAQS')[0],
    'faqs': content.split('ZEN_FAQS')[1],
}

results = []
for item in manifest:
    bid = item['id']
    counts = {}
    for section_name, section_content in sections.items():
        # Count occurrences of this book id in relatedBooks
        count = len(re.findall(rf"""['"]{re.escape(bid)}['"]""", section_content))
        counts[section_name] = count
    
    total = sum(counts.values())
    results.append((bid, item['title'], counts['persons'], counts['concepts'], counts['methods'], counts['koans'], counts['faqs'], total))

# Sort by total (ascending)
results.sort(key=lambda x: x[7])

print(f'{"ID":<22} {"经典":<20} {"人":>3} {"概":>3} {"法":>3} {"案":>3} {"问":>3} {"总":>4}')
print('-' * 75)
for bid, title, p, c, m, k, f, t in results:
    issues = []
    if p < 1: issues.append('无人')
    if c < 2: issues.append('概念少')
    if m < 1: issues.append('无法门')
    if k < 3: issues.append('公案少')
    if f < 10: issues.append('问答少')
    status = ' '.join(issues) if issues else '✓'
    print(f'{bid:<22} {title[:18]:<20} {p:>3} {c:>3} {m:>3} {k:>3} {f:>3} {t:>4} {status}')

problem = [r for r in results if r[2] < 1 or r[3] < 2 or r[4] < 1 or r[5] < 3 or r[6] < 10]
print(f'\n有问题的经典: {len(problem)}部')
for bid, title, p, c, m, k, f, t in problem:
    print(f'  {bid}: {title} (人{p} 概{c} 法{m} 案{k} 问{f})')
