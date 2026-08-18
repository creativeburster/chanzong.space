import re

with open('f:/chanzong.space/lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# FAQ - check both quote styles
faqs = content[content.index('ZEN_FAQS'):]
single_q = len(re.findall(r"id: 'faq-", faqs))
double_q = len(re.findall(r'"id": "faq-', faqs))
total_faq = single_q + double_q
print(f"FAQ single-quote: {single_q}")
print(f"FAQ double-quote: {double_q}")
print(f"FAQ total: {total_faq}")

# Concepts - check both styles
concepts = content[content.index('ZEN_CONCEPTS'):content.index('ZEN_METHODS')]
c_double = len(re.findall(r'"id": "', concepts))
c_single = len(re.findall(r"id: '", concepts))
print(f"\nConcepts double-quote: {c_double}")
print(f"Concepts single-quote: {c_single}")
print(f"Concepts total: {c_double + c_single}")

# Persons
persons = content[content.index('ZEN_PERSONS'):content.index('ZEN_CONCEPTS')]
p_double = len(re.findall(r'"id": "', persons))
p_single = len(re.findall(r"id: '", persons))
print(f"\nPersons double-quote: {p_double}")
print(f"Persons single-quote: {p_single}")
print(f"Persons total: {p_double + p_single}")

# Methods
methods = content[content.index('ZEN_METHODS'):content.index('ZEN_KOANS')]
m_double = len(re.findall(r'"id": "', methods))
m_single = len(re.findall(r"id: '", methods))
print(f"\nMethods double-quote: {m_double}")
print(f"Methods single-quote: {m_single}")
print(f"Methods total: {m_double + m_single}")

# Koans
koans = content[content.index('ZEN_KOANS'):content.index('ZEN_FAQS')]
k_double = len(re.findall(r'"id": "', koans))
k_single = len(re.findall(r"id: '", koans))
print(f"\nKoans double-quote: {k_double}")
print(f"Koans single-quote: {k_single}")
print(f"Koans total: {k_double + k_single}")
