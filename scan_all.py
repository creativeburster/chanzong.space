import json, re

with open('manifest.json','r',encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/taxonomy.ts','r',encoding='utf-8') as f:
    content = f.read()

# Extract sections
person_section = content.split('ZEN_PERSONS')[1].split('ZEN_CONCEPTS')[0]
concept_section = content.split('ZEN_CONCEPTS')[1].split('ZEN_METHODS')[0]
method_section = content.split('ZEN_METHODS')[1].split('ZEN_KOANS')[0]
koan_section = content.split('ZEN_KOANS')[1].split('export interface FAQItem')[0]
faq_section = content.split('ZEN_FAQS')[1]

# Count totals
persons = len(re.findall(r'"id": "[a-z]', person_section))
concepts = len(re.findall(r'"id": "[a-z]', concept_section))
methods = len(re.findall(r'"id": "[a-z]', method_section))
koans = len(re.findall(r'"id": "koan-\d+"', koan_section))
faqs = len(re.findall(r"id: 'faq-\d+'", faq_section)) + len(re.findall(r'"id": "faq-\d+"', faq_section))

print(f'=== 总计 ===')
print(f'经典: {len(manifest)} 部')
print(f'人物: {persons} 位')
print(f'概念: {concepts} 个')
print(f'法门: {methods} 个')
print(f'公案: {koans} 则')
print(f'问答: {faqs} 条')

# Translations
with open('lib/translations.ts','r',encoding='utf-8') as f:
    trans = f.read()
trans_keys = re.findall(r'^  (\w+): \[', trans, re.MULTILINE)

# Glossary
with open('lib/glossary.ts','r',encoding='utf-8') as f:
    gloss = f.read()
gloss_keys = re.findall(r'^  (\w+): \[', gloss, re.MULTILINE)

print(f'\n=== 各经典覆盖 ===')
print(f'{"ID":<22} {"字数":>6} {"翻译":>4} {"字词":>4} {"公案":>4} {"问答":>4} {"人物":>4} {"概念":>4}')
print('-' * 70)

classic_ids = [m['id'] for m in manifest]
no_trans = []
no_gloss = []
no_koan = []
no_faq = []
low_faq = []

for m in manifest:
    bid = m['id']
    wc = m.get('word_count', 0)
    
    # Translations
    tpat = bid + r': \[(.*?)\n  \],'
    tm = re.search(tpat, trans, re.DOTALL)
    tcount = tm.group(1).count("',\n") if tm else 0
    if tcount == 0:
        no_trans.append(bid)
    
    # Glossary
    gpat = bid + r': \[(.*?)\n  \],'
    gm = re.search(gpat, gloss, re.DOTALL)
    gcount = gm.group(1).count('{ char:') if gm else 0
    if gcount == 0:
        no_gloss.append(bid)
    
    # Koans
    kcount = len(re.findall(r'"' + bid + r'"', koan_section))
    if kcount == 0:
        no_koan.append(bid)
    
    # FAQs
    fcount = len(re.findall(r'relatedBooks.*' + bid, faq_section))
    if fcount == 0:
        no_faq.append(bid)
    if fcount < 10:
        low_faq.append((bid, fcount))
    
    # Persons referencing this book
    pcount = len(re.findall(r'"' + bid + r'"', person_section))
    
    # Concepts referencing this book
    ccount = len(re.findall(r'"' + bid + r'"', concept_section))
    
    print(f'{bid:<22} {wc:>6} {tcount:>4} {gcount:>4} {kcount:>4} {fcount:>4} {pcount:>4} {ccount:>4}')

print(f'\n=== 缺失项 ===')
print(f'无翻译: {no_trans}')
print(f'无字词: {no_gloss}')
print(f'无公案: {no_koan}')
print(f'无问答: {no_faq}')
print(f'\n=== 问答<10的经典 ===')
for bid, fc in sorted(low_faq, key=lambda x: x[1]):
    print(f'  {bid}: {fc}条')
