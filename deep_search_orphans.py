import json
import re
from pathlib import Path

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}%', end='', flush=True)

print('深度搜索73个孤儿条目...')
print()

# 读取数据
with open('orphan_refined_analysis.json', 'r', encoding='utf-8') as f:
    all_orphans = json.load(f)

# 筛选出确实无关联的73个
no_match_orphans = [o for o in all_orphans if not o['has_match']]

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# 深度搜索函数
def ultra_deep_search(item_name, item_id, item_type):
    """超深度搜索：全文搜索+多种匹配策略"""
    results = []
    
    # 准备搜索策略
    search_strategies = []
    
    # 策略1: 完整名称
    search_strategies.append(('full', item_name))
    
    # 策略2: 分解名称（处理"XX禅师"、"XX尊者"等）
    name_clean = re.sub(r'[禅师大师尊者菩萨·]', '', item_name)
    if name_clean != item_name:
        search_strategies.append(('clean', name_clean))
    
    # 策略3: 取核心名（2-3个字）
    if len(item_name) >= 2:
        search_strategies.append(('core2', item_name[:2]))
        if len(item_name) >= 3:
            search_strategies.append(('core3', item_name[:3]))
    
    # 策略4: 常见别名映射
    alias_map = {
        '青原行思': ['行思', '青原'],
        '石头希迁': ['希迁', '石头'],
        '南阳慧忠': ['慧忠', '南阳'],
        '庞蕴': ['庞居士', '庞蕴'],
        '德山宣鉴': ['宣鉴', '德山'],
        '法眼文益': ['文益', '法眼'],
        '天台德韶': ['德韶', '天台'],
        '龙潭崇信': ['崇信', '龙潭'],
        '罗汉桂琛': ['桂琛', '罗汉'],
        '汾阳善昭': ['善昭', '汾阳'],
        '白云守端': ['守端', '白云'],
        '天皇道悟': ['道悟', '天皇'],
        '香严智闲': ['智闲', '香严'],
        '万松行秀': ['行秀', '万松'],
        '首山省念': ['省念', '首山'],
        '佛眼清远': ['清远', '佛眼'],
        '博山元来': ['元来', '博山'],
        '耶律楚材': ['楚材', '耶律'],
        '太平慧懑': ['慧懑', '太平'],
        '风穴延沼': ['延沼', '风穴'],
        '通容': ['通容'],
        '隐元隆琦': ['隆琦', '隐元'],
        '真净克文': ['克文', '真净'],
        '佛印了元': ['了元', '佛印'],
        '天衣义怀': ['义怀', '天衣'],
        '开福道宁': ['道宁', '开福'],
        '佛鉴慧勤': ['慧勤', '佛鉴'],
        '真歇清了': ['清了', '真歇'],
        '普明禅师': ['普明'],
        '仰山慧寂': ['慧寂', '仰山'],
        '丹霞子淳': ['子淳', '丹霞'],
        '芙蓉道楷': ['道楷', '芙蓉'],
        '中峰明本': ['明本', '中峰'],
        '高峰原妙': ['原妙', '高峰'],
        '雪岩祖钦': ['祖钦', '雪岩'],
        '破庵祖先': ['祖先', '破庵'],
        '鸟窠道林': ['道林', '鸟窠'],
        '雪窦重显': ['重显', '雪窦'],
        '长芦宗赜': ['宗赜', '长芦'],
    }
    
    if item_name in alias_map:
        for alias in alias_map[item_name]:
            search_strategies.append(('alias', alias))
    
    # 在所有经典中搜索
    for book in manifest:
        md_file = Path(f'classics_markdown/{book["filename"]}')
        if not md_file.exists():
            continue
        
        with open(md_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # 尝试每种策略
        for strategy_name, term in search_strategies:
            if term and term in text:
                # 找到匹配，记录上下文
                idx = text.find(term)
                context_start = max(0, idx - 30)
                context_end = min(len(text), idx + len(term) + 30)
                context = text[context_start:context_end].replace('\n', ' ')
                
                results.append({
                    'book_id': book['id'],
                    'book_title': book['title'],
                    'strategy': strategy_name,
                    'matched_term': term,
                    'context': context
                })
                break  # 每本书只记录一次
    
    return results

# 深度搜索每个孤儿
final_results = []
total = len(no_match_orphans)

for i, item in enumerate(no_match_orphans):
    print_progress(i + 1, total, f'搜索: {item["name"][:15]}')
    
    matches = ultra_deep_search(item['name'], item['id'], item['type'])
    
    final_results.append({
        'id': item['id'],
        'name': item['name'],
        'type': item['type'],
        'wrong_book': item['wrong_book'],
        'wrong_book_title': item['wrong_book_title'],
        'matches': matches,
        'has_match': len(matches) > 0,
        'match_count': len(matches)
    })

print()
print()

# 分类结果
found = [r for r in final_results if r['has_match']]
not_found = [r for r in final_results if not r['has_match']]

print('=' * 80)
print('深度搜索结果')
print('=' * 80)
print(f'找到关联: {len(found)} 个')
print(f'确实无关联: {len(not_found)} 个')
print()

# 显示找到关联的
if found:
    print('【找到关联的条目】')
    print('-' * 80)
    for r in found:
        print(f"✓ {r['name']} ({r['type']})")
        print(f"  匹配数: {r['match_count']} 部经典")
        for m in r['matches'][:3]:  # 只显示前3个
            print(f"    - {m['book_title']} (匹配: {m['matched_term']})")
        if len(r['matches']) > 3:
            print(f"    ... 等{len(r['matches'])}部")
        print()

# 显示确实无关联的（需要互联网搜索）
print('【需要互联网搜索的条目】')
print('-' * 80)
for r in not_found:
    print(f"? {r['name']} ({r['type']}) - 需要确认来源")
print()

print('=' * 80)
print(f'本地找到关联: {len(found)} 个')
print(f'需要互联网搜索: {len(not_found)} 个')
print('=' * 80)

# 保存结果
with open('orphan_deep_search.json', 'w', encoding='utf-8') as f:
    json.dump(final_results, f, ensure_ascii=False, indent=2)

print()
print('结果已保存至 orphan_deep_search.json')

# 生成需要互联网搜索的列表
internet_search_list = [r['name'] for r in not_found]
with open('需要互联网搜索.txt', 'w', encoding='utf-8') as f:
    f.write('需要互联网搜索确认来源的条目：\n\n')
    for name in internet_search_list:
        f.write(f'- {name}\n')

print('互联网搜索清单已保存至 需要互联网搜索.txt')
