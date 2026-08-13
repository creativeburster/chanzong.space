import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicated relatedBooks lines
# Pattern: "relatedBooks": ["xxx"]"relatedBooks": ["xxx"]
# Should be just: "relatedBooks": ["xxx"]

content = re.sub(r'"relatedBooks": \[([^\]]+)\]"relatedBooks": \[\1\]', r'"relatedBooks": [\1]', content)

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed duplicated relatedBooks lines')
