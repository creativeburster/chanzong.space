import re
with open('f:/chanzong.space/lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    c = f.read()
concepts = c[c.index('ZEN_CONCEPTS'):c.index('ZEN_METHODS')]
ids = re.findall(r'"id": "([^"]+)"', concepts)
from collections import Counter
d = {k: v for k, v in Counter(ids).items() if v > 1}
print(f"Concepts: {len(ids)} unique: {len(set(ids))} dupes: {d}")
