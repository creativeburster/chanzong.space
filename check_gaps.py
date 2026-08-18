import re

with open('f:/chanzong.space/lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Check concept duplicates
concepts = content[content.index('ZEN_CONCEPTS'):content.index('ZEN_METHODS')]
concept_ids = re.findall(r'"id": "([^"]+)"', concepts)
from collections import Counter
dupes = {k: v for k, v in Counter(concept_ids).items() if v > 1}
print("=== 概念重复ID ===")
for k, v in dupes.items():
    print(f"  {k}: {v}次")

# Check koan gaps
koans = content[content.index('ZEN_KOANS'):content.index('ZEN_FAQS')]
koan_nums = sorted([int(n) for n in re.findall(r'"id": "koan-(\d+)"', koans)])
print(f"\n=== 公案 ===")
print(f"  总数: {len(koan_nums)}")
print(f"  最大编号: koan-{max(koan_nums)}")
# Find gaps
full_range = set(range(1, max(koan_nums) + 1))
missing = full_range - set(koan_nums)
if missing:
    print(f"  缺失编号({len(missing)}个): {sorted(missing)}")
else:
    print(f"  无缺失")

# Check FAQ gaps
faqs = content[content.index('ZEN_FAQS'):]
faq_nums = sorted([int(n) for n in re.findall(r"faq-(\d+)", faqs)])
print(f"\n=== 问答 ===")
print(f"  总数: {len(faq_nums)}")
print(f"  最大编号: faq-{max(faq_nums)}")
full_range = set(range(1, max(faq_nums) + 1))
missing = full_range - set(faq_nums)
if missing:
    print(f"  缺失编号({len(missing)}个): {sorted(missing)[:20]}...")  # show first 20
else:
    print(f"  无缺失")
