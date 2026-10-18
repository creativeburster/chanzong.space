import re

content = open('lib/taxonomy.ts', 'r', encoding='utf-8').read()

koan_ids = [int(x) for x in re.findall(r'"id":\s*"koan-(\d+)"', content)]
faq_ids = [int(x) for x in re.findall(r'"id":\s*"faq-(\d+)"', content)]

print(f"Max Koan ID: {max(koan_ids) if koan_ids else None}")
print(f"Total Koans: {len(koan_ids)}")
print(f"Max FAQ ID: {max(faq_ids) if faq_ids else None}")
print(f"Total FAQs: {len(faq_ids)}")

manifest = open('manifest.json', 'r', encoding='utf-8').read()
manifest_idxs = [int(x) for x in re.findall(r'"idx":\s*(\d+)', manifest)]
print(f"Max manifest idx: {max(manifest_idxs)}")
