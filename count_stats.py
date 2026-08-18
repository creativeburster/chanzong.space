import re

# Taxonomy counts
with open('f:/chanzong.space/lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

persons = content[content.index('ZEN_PERSONS'):content.index('ZEN_CONCEPTS')]
person_count = len(re.findall(r'"id":', persons))

concepts = content[content.index('ZEN_CONCEPTS'):content.index('ZEN_METHODS')]
concept_count = len(re.findall(r'"id":', concepts))

methods = content[content.index('ZEN_METHODS'):content.index('ZEN_KOANS')]
method_count = len(re.findall(r'"id":', methods))

koans = content[content.index('ZEN_KOANS'):content.index('ZEN_FAQS')]
koan_count = len(re.findall(r'"id":', koans))

faqs = content[content.index('ZEN_FAQS'):]
faq_count = len(re.findall(r"id: 'faq-", faqs))

print(f'=== Taxonomy ===')
print(f'人物(Persons): {person_count}')
print(f'概念(Concepts): {concept_count}')
print(f'法门(Methods): {method_count}')
print(f'公案(Koans): {koan_count}')
print(f'问答(FAQs): {faq_count}')

# Translations
with open('f:/chanzong.space/lib/translations.ts', 'r', encoding='utf-8') as f:
    tcontent = f.read()
tkeys = re.findall(r'^\s*(\w+):\s*\[', tcontent, re.MULTILINE)
titems = re.findall(r"^\s*'[^']+',$", tcontent, re.MULTILINE)
print(f'\n=== Translations ===')
print(f'翻译覆盖经典数: {len(tkeys)}')
print(f'翻译总段数: {len(titems)}')

# Glossary
with open('f:/chanzong.space/lib/glossary.ts', 'r', encoding='utf-8') as f:
    gcontent = f.read()
gkeys = re.findall(r'^\s*(\w+):\s*\[', gcontent, re.MULTILINE)
gitems = re.findall(r'\{ char:', gcontent)
print(f'\n=== Glossary ===')
print(f'生僻字覆盖经典数: {len(gkeys)}')
print(f'生僻字条目总数: {len(gitems)}')

# Manifest
import json
with open('f:/chanzong.space/manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)
print(f'\n=== Manifest ===')
print(f'已发布经典: {len(manifest)}')
total_words = sum(m.get('word_count', 0) for m in manifest)
print(f'总字数: {total_words}')
