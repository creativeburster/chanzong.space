import json
import re
from pathlib import Path

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}%', end='', flush=True)

print('精细检索孤儿条目...')
print()

# 读取数据
with open('orphan_fix_plan.json', 'r', encoding='utf-8') as f:
    orphans = json.load(f)

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# 为每个孤儿做精细检索
def deep_search(item_name, item_id, item_type):
    """深度搜索：多种匹配方式"""
    results = []
    
    # 准备搜索关键词
    search_terms = []
    
    # 1. 原始名称
    search_terms.append(item_name)
    
    # 2. 分解名称（如"摩诃迦叶尊者" -> "迦叶"）
    name_parts = re.split(r'[尊者菩萨禅师大师·\s]+', item_name)
    search_terms.extend([p for p in name_parts if len(p) >= 2])
    
    # 3. 常见别名/简称
    aliases = {
        'kumarajiva': ['罗什', '鸠摩罗'],
        'youpoli': ['优波离', '优婆离'],
        'jiaye': ['迦叶', '摩诃迦叶'],
        'wenshu-yuanjue': ['文殊', '文殊师利'],
        'huangtingjian': ['山谷', '黄山谷'],
        'yinyuan': ['隐元', '隐元隆琦'],
    }
    if item_id in aliases:
        search_terms.extend(aliases[item_id])
    
    # 去重
    search_terms = list(set(search_terms))
    
    # 在所有经典中搜索
    for book in manifest:
        md_file = Path(f'classics_markdown/{book["filename"]}')
        if not md_file.exists():
            continue
        
        with open(md_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # 检查每个搜索词
        for term in search_terms:
            if term in text:
                # 找到匹配，记录上下文
                idx = text.find(term)
                context = text[max(0, idx-50):min(len(text), idx+50)]
                results.append({
                    'book_id': book['id'],
                    'book_title': book['title'],
                    'matched_term': term,
                    'context': context.replace('\n', ' ')
                })
                break  # 每本书只记录一次
    
    return results

# 精细检索每个孤儿
refined_results = []
total = len(orphans)

for i, item in enumerate(orphans):
    print_progress(i + 1, total, f'检索: {item["name"][:15]}')
    
    matches = deep_search(item['name'], item['id'], item['type'])
    
    refined_results.append({
        'id': item['id'],
        'name': item['name'],
        'type': item['type'],
        'wrong_book': item['wrong_book'],
        'wrong_book_title': item['wrong_book_title'],
        'matches': matches,
        'has_match': len(matches) > 0
    })

print()
print()

# 分类结果
has_match = [r for r in refined_results if r['has_match']]
no_match = [r for r in refined_results if not r['has_match']]

print('=' * 80)
print('精细检索结果')
print('=' * 80)
print(f'找到关联: {len(has_match)} 个')
print(f'确实无关联: {len(no_match)} 个')
print()

# 显示找到关联的
if has_match:
    print('【找到关联的条目】')
    print('-' * 80)
    for r in has_match[:20]:  # 只显示前20个
        print(f"✓ {r['name']} ({r['type']})")
        print(f"  错误关联: {r['wrong_book_title']}")
        print(f"  正确关联: {[m['book_title'] for m in r['matches']]}")
        print()
    if len(has_match) > 20:
        print(f'... 等{len(has_match)}个')
    print()

# 显示确实无关联的
print('【确实无关联的条目】（建议保留为独立条目）')
print('-' * 80)
for r in no_match[:30]:  # 只显示前30个
    print(f"✗ {r['name']} ({r['type']}) - 原错误关联: {r['wrong_book_title']}")
if len(no_match) > 30:
    print(f'... 等{len(no_match)}个')

print()
print('=' * 80)

# 保存结果
with open('orphan_refined_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(refined_results, f, ensure_ascii=False, indent=2)

print('详细结果已保存至 orphan_refined_analysis.json')
