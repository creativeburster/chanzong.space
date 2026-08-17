import json
import re
from collections import defaultdict

# 读取manifest.json
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# 读取taxonomy.ts
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 统计每部经典的关联数
results = []

for book in manifest:
    book_id = book['id']
    
    # 统计FAQ
    faq_pattern = f'relatedBooks.*{book_id}'
    faq_count = len(re.findall(faq_pattern, taxonomy))
    
    # 统计公案（在ZEN_KOANS部分）
    koan_section = taxonomy[taxonomy.find('export const ZEN_KOANS'):taxonomy.find('export interface FAQItem')]
    koan_count = len(re.findall(f'relatedBooks.*{book_id}', koan_section))
    
    # 统计人物
    person_section = taxonomy[taxonomy.find('export const ZEN_PERSONS'):taxonomy.find('export const ZEN_CONCEPTS')]
    person_count = len(re.findall(f'relatedBooks.*{book_id}', person_section))
    
    # 统计概念
    concept_section = taxonomy[taxonomy.find('export const ZEN_CONCEPTS'):taxonomy.find('export const ZEN_METHODS')]
    concept_count = len(re.findall(f'relatedBooks.*{book_id}', concept_section))
    
    # 统计法门
    method_section = taxonomy[taxonomy.find('export const ZEN_METHODS'):taxonomy.find('export const ZEN_KOANS')]
    method_count = len(re.findall(f'relatedBooks.*{book_id}', method_section))
    
    # 检查是否达标
    faq_ok = faq_count >= 10
    koan_ok = koan_count >= 3
    person_ok = person_count >= 1
    concept_ok = concept_count >= 2
    method_ok = method_count >= 1
    
    all_ok = faq_ok and koan_ok and person_ok and concept_ok and method_ok
    
    results.append({
        'idx': book['idx'],
        'id': book_id,
        'title': book['title'],
        'faq': faq_count,
        'koan': koan_count,
        'person': person_count,
        'concept': concept_count,
        'method': method_count,
        'ok': all_ok
    })

# 输出结果
print('=' * 100)
print(f'{"idx":>4} {"id":<20} {"title":<30} {"FAQ":>5} {"公案":>5} {"人物":>5} {"概念":>5} {"法门":>5} {"状态":>6}')
print('=' * 100)

not_ok_count = 0
for r in results:
    status = '✓' if r['ok'] else '✗'
    if not r['ok']:
        not_ok_count += 1
        status = '✗'
    print(f'{r["idx"]:>4} {r["id"]:<20} {r["title"][:28]:<30} {r["faq"]:>5} {r["koan"]:>5} {r["person"]:>5} {r["concept"]:>5} {r["method"]:>5} {status:>6}')

print('=' * 100)
print(f'总计: {len(results)} 部经典, 达标: {len(results) - not_ok_count}, 不达标: {not_ok_count}')

# 输出不达标的经典详情
if not_ok_count > 0:
    print('\n不达标经典详情:')
    print('-' * 100)
    for r in results:
        if not r['ok']:
            issues = []
            if r['faq'] < 10:
                issues.append(f'FAQ不足({r["faq"]}/10)')
            if r['koan'] < 3:
                issues.append(f'公案不足({r["koan"]}/3)')
            if r['person'] < 1:
                issues.append(f'人物不足({r["person"]}/1)')
            if r['concept'] < 2:
                issues.append(f'概念不足({r["concept"]}/2)')
            if r['method'] < 1:
                issues.append(f'法门不足({r["method"]}/1)')
            print(f'  {r["id"]}: {", ".join(issues)}')
