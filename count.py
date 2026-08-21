import re, json

c = open('lib/taxonomy.ts', encoding='utf-8').read()
manifest = json.load(open('manifest.json', encoding='utf-8'))

book_id = 'yangqihoulu'

# Count persons with yangqihoulu in relatedBooks
persons = len(re.findall(r'"id":\s*"[^"]+".*?"relatedBooks":\s*\[.*?"' + book_id + r'"', c, re.DOTALL))
# Count concepts
concepts = len(re.findall(r'"id":\s*"[^"]+".*?"relatedBooks":\s*\[.*?"' + book_id + r'"', c[re.search(r'ZEN_CONCEPTS', c).start():re.search(r'ZEN_METHODS', c).start()], re.DOTALL))
# Count methods
methods = len(re.findall(r'"id":\s*"[^"]+".*?"relatedBooks":\s*\[.*?"' + book_id + r'"', c[re.search(r'ZEN_METHODS', c).start():re.search(r'ZEN_KOANS', c).start()], re.DOTALL))
# Count koans
koans = len(re.findall(r'"id":\s*"koan-\d+".*?"relatedBooks":\s*\[.*?"' + book_id + r'"', c[re.search(r'ZEN_KOANS', c).start():re.search(r'ZEN_FAQS', c).start()], re.DOTALL))
# Count FAQs
faqs = len(re.findall(r'(?:relatedBooks|relatedBooks).*?"' + book_id + r'"', c[re.search(r'ZEN_FAQS', c).start():], re.DOTALL))

print(f'=== {book_id} 数据覆盖验证 ===')
print(f'Person: {persons} (>=1: {"PASS" if persons >= 1 else "FAIL"})')
print(f'Concept: {concepts} (>=2: {"PASS" if concepts >= 2 else "FAIL"})')
print(f'Method: {methods} (>=1: {"PASS" if methods >= 1 else "FAIL"})')
print(f'Koan: {koans} (>=3: {"PASS" if koans >= 3 else "FAIL"})')
print(f'FAQ: {faqs} (>=10: {"PASS" if faqs >= 10 else "FAIL"})')
