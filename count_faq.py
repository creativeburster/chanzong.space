import re

with open('f:/chanzong.space/lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# FAQ section
faqs = content[content.index('ZEN_FAQS'):]
single_q = len(re.findall(r"id: 'faq-", faqs))
double_q = len(re.findall(r'id: "faq-', faqs))
all_id = len(re.findall(r'^\s*id:', faqs, re.MULTILINE))
# Also check for "id": pattern
double_key = len(re.findall(r'"id": "faq-', faqs))
print(f"FAQ - single-quote id: {single_q}")
print(f"FAQ - double-quote id: {double_q}")
print(f"FAQ - all id lines: {all_id}")
print(f"FAQ - double-key id: {double_key}")

# Get last faq number
faq_nums = re.findall(r"faq-(\d+)", faqs)
if faq_nums:
    max_faq = max(int(n) for n in faq_nums)
    print(f"FAQ - max number: faq-{max_faq}")
    print(f"FAQ - unique numbers: {len(set(faq_nums))}")

# Concepts section
concepts = content[content.index('ZEN_CONCEPTS'):content.index('ZEN_METHODS')]
concept_ids = re.findall(r'"id": "([^"]+)"', concepts)
print(f"\nConcepts - count: {len(concept_ids)}")
print(f"Concepts - unique: {len(set(concept_ids))}")
