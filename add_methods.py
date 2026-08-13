import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

method_section = content.split('ZEN_METHODS')[1].split('ZEN_KOANS')[0]
existing_ids = set(re.findall(r'"id": "([^"]+)"', method_section))
existing_names = set(re.findall(r'"name": "([^"]+)"', method_section))

print(f'现有法门: {len(existing_ids)}个')
print(f'IDs: {sorted(existing_ids)}')
print(f'Names: {sorted(existing_names)}')

# Candidate methods from Zen classics
candidates = [
    ("baoyuan-xing", "报冤行", "达摩四行之第一行。受苦时不怨天尤人，了知皆是宿业果报，甘心忍受。于逆境中不起嗔心，即与道相应。", ["sixingguan"]),
    ("suiyuan-xing", "随缘行", "达摩四行之第二行。于顺境逆境皆随缘不变，不生喜忧。了知万法因缘生灭，随缘消业，不生分别。", ["sixingguan"]),
    ("wusuoqiu-xing", "无所求行", "达摩四行之第三行。于万法无所求——有求皆苦，无求即乐。了知三界皆空，无所愿求。", ["sixingguan"]),
    ("chengfa-xing", "称法行", "达摩四行之第四行。称法性而行——法性本空，行而无行，无行而行。以无所得心行一切善法。", ["sixingguan"]),
    ("yixing-sammei", "一行三昧", "《文殊说般若经》所明之三昧：系心一佛，专称名字，念念相续，即于念中见三世诸佛。四祖道信依此教人念佛心是佛。", ["wenshu", "anxin"]),
    ("guanxin-fa", "观心法门", "观念起处，即见自心。心本清净，因境生念。但观此念起处，了知念本无生，即同如来。", ["zhangzhi"]),
    ("po-xiang-fa", "破相法门", "了达一切相本空，不破而自破。若执有相可破，即被相缚。但了相本空，即是破相。", ["poxianglun"]),
    ("xi-zheng-fa", "息诤法门", "了达诸法本空，分别自灭，诤亦自息。诤从分别起，无分别即无诤。", ["xixulun"]),
    ("wunian-fa", "无念法门", "于诸境上心不染著，非百物不思。念念之中不滞一法，即名无念。六祖以无念为宗。", ["tanjing"]),
    ("wuxiang-fa", "无相法门", "于相而离相，非灭相以求无相。即相离相，即名无相。六祖以无相为体。", ["tanjing"]),
    ("wuzhu-fa", "无住法门", "念念之中不思前境，于诸法上念念不住。即无缚也。六祖以无住为本。", ["tanjing"]),
    ("nianfo-chan", "念佛禅", "四祖道信依《文殊说般若经》一行三昧，教人念佛心是佛。系心一佛，专称名字，念念相续，即于念中见三世诸佛。", ["wenshu", "anxin"]),
    ("zhiguan-shuangxiu", "止观双修", "止以摄心，观以发慧。止而不观则堕死水，观而不止则起狂慧。止观双修，方得无上菩提。", ["dachengqixinlun"]),
    ("canjiu-fa", "参究法门", "以一则公案或话头为所缘，如鸡抱卵，疑情成片，自有到家时节。不以意识卜度，唯以疑情逼拶至心行路绝处。", ["xinxinming", "zhengdaoge"]),
    ("jingxin-fa", "净心法门", "但离妄缘，即如如佛。心性本净，客尘所染。去其客尘，净心自现。", ["zhenxin", "xiuxinjue"]),
    ("dunwu-fa", "顿悟法门", "顿除妄念，悟无所得。不历阶次，一超直入。以知幻即离，离幻即觉。", ["dunwu"]),
    ("huixiang-fa", "回向法门", "将所修功德回向一切众生，回向无上菩提。回自向他，回因向果，回事向理。", ["dachengqixinlun"]),
]

missing = []
for mid, name, desc, books in candidates:
    if mid not in existing_ids and name not in existing_names:
        missing.append((mid, name, desc, books))

print(f'\n缺失法门: {len(missing)}个')
for mid, name, desc, books in missing:
    print(f'  {mid}: {name} -> {books}')

# Generate TS entries
entries = []
for mid, name, desc, books in missing:
    books_str = ', '.join([f'"{b}"' for b in books])
    entry = f'''  {{
    "id": "{mid}",
    "name": "{name}",
    "summary": "{desc}",
    "steps": [],
    "relatedConcepts": [],
    "relatedPersons": [],
    "relatedBooks": [{books_str}]
  }}'''
    entries.append(entry)

if entries:
    methods_start = content.find('ZEN_METHODS')
    methods_end = content.find('];', methods_start)
    last_brace = content.rfind('}', 0, methods_end)
    
    insertion = ',\n' + ',\n'.join(entries)
    new_content = content[:last_brace+1] + insertion + content[last_brace+1:]
    
    with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'\nAdded {len(missing)} new methods')
    print(f'Total methods now: {len(existing_ids) + len(missing)}')
