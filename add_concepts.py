import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

concept_section = content.split('ZEN_CONCEPTS')[1].split('ZEN_METHODS')[0]
existing_ids = set(re.findall(r'"id": "([^"]+)"', concept_section))
existing_titles = set(re.findall(r'"title": "([^"]+)"', concept_section))

print(f'现有概念: {len(existing_ids)}个')
print(f'\n现有概念标题:')
for t in sorted(existing_titles):
    print(f'  {t}')

# Candidate concepts from Zen classics that might be missing
candidates = [
    ('wuchang', '无常', '心性', '万法生灭无常，刹那变迁，无有固定不变之自性。《涅槃经》云：一切行无常，念念生灭。禅宗以无常为入道之初门——观无常方能生厌离心，发起参究之志。'),
    ('kongxing', '空性', '本体', '空性即一切法无自性之本质。与\u201c空\u201d同义而侧重\u201c性\u201d——万法本性是空，非灭而后空。禅宗直指空性为自心本来面目。'),
    ('yuanqi', '缘起', '教理', '万法因缘和合而生，无有独立自性。此为佛法根本教理，禅宗承此而立\u201c因缘所生法，我说即是空\u201d之旨。'),
    ('fashen', '法身', '本体', '法身即以法界为身，以空性为体。禅宗以\u201c法身本具\u201d为宗——众生本具法身，不假修得，但去其遮蔽即现。'),
    ('baoshen', '报身', '本体', '报身即佛果报得之身，万德庄严。法身、报身、化身合为三身。禅宗以\u201c即心即佛\u201d统摄三身于一心。'),
    ('huashen', '化身', '本体', '化身即佛应化度生之身，随类现身。禅宗以\u201c化身即日用应机\u201d——念念起用，皆是化身。'),
    ('sanxing', '三身', '本体', '法身、报身、化身合称三身。禅宗以一心统摄三身：法身为体，报身为相，化身为用，体相用不离当下一心。'),
    ('wuzhiliang', '无智亦无得', '心法', '《心经》云\u201c无智亦无得\u201d，般若之极则——能证之智与所证之理皆不可得。禅宗承此而立\u201c无修无证\u201d之旨。'),
    ('wusuode', '无所得', '心法', '《心经》云\u201c以无所得故\u201d，菩提本具，非从外得。禅宗以\u201c无所得\u201d为究竟——有所得即有能所，无所得即能所双泯。'),
    ('zhengliang', '证量', '实修', '修行者亲证之境界与体验。禅宗不尚理论推求，唯重亲证——如人饮水，冷暖自知。'),
    ('xianliang', '现量', '心法', '不经过比度推求，直接亲证之知识。禅宗以\u201c现量境界\u201d为宗——不以意识卜度，直下亲见。'),
    ('biliang', '比量', '心法', '通过推理比度所得之知识。禅宗以比量为妄——亲证须现量，不可以比量代现量。'),
    ('fengxian', '风幡', '公案', '六祖惠能在广州法性寺，见二僧争论风幡。一曰风动，一曰幡动。惠能曰：\u201c不是风动，不是幡动，仁者心动。\u201d此示万法唯心之旨。'),
    ('wujian', '无间', '实修', '修行无间断，念念相续。禅宗以\u201c无间道\u201d为宗——参禅须如鸡抱卵，不可间断。'),
    ('jiaocan', '交参', '境界', '曹洞宗\u201c正偏交参\u201d之旨，体用回互，正偏互融。洞山良价以正偏五位明此旨。'),
    ('huangji', '还源', '心法', '还源即返本还源，回归自心本来面目。禅宗以\u201c还源\u201d为究竟——从迷返悟，从用归体。'),
    ('zhengyin', '正因', '教理', '成佛之正因，即佛性。禅宗以\u201c正因佛性\u201d为本——众生本具佛性，即成佛正因。'),
    ('liaoyin', '了因', '教理', '开悟之慧解，了达佛性之智。正因佛性须了因方能显现——禅宗以\u201c了因\u201d为开悟之智。'),
    ('yuan-yin', '缘因', '教理', '助成开悟之善根福德。禅宗以\u201c缘因\u201d为修行之助缘——参禅须具善根福德因缘。'),
    ('sande', '三德', '教理', '法身德、般若德、解脱德，合称三德。禅宗以一心统摄三德——法身为体，般若为相，解脱为用。'),
    ('eryi', '二义', '教理', '真俗二谛。禅宗以\u201c二谛圆融\u201d为宗——真谛明空，俗谛明有，空有不二。'),
    ('shidi', '十地', '教理', '菩萨修行之十个阶位。禅宗以\u201c一超直入\u201d为宗——不历僧祇，顿悟成佛，然亦不废渐修。'),
    ('wuxingguan', '五行观', '实修', '《大乘起信论》所明五种修行：施门、戒门、忍门、进门、止观门。禅宗以止观为根本，兼摄前四。'),
    ('zhenkong-miaoyou', '真空妙有', '本体', '空而不空，有而不有。真空即妙有，妙有即真空。禅宗以\u201c真空妙有\u201d为中道极则。'),
    ('wunian', '无念', '心法', '六祖惠能立\u201c无念为宗\u201d：于诸境上心不染著，非百物不思。无念不是无心，而是\u201c于念而无念\u201d——念念之中不滞一法。'),
    ('wuxiang', '无相', '心法', '六祖惠能立\u201c无相为体\u201d：于相而离相，非灭相以求无相。无相不是没有相，而是\u201c即相离相\u201d。'),
    ('wuzhu-ben', '无住为本', '心法', '六祖惠能立\u201c无住为本\u201d：念念之中不思前境，于诸法上念念不住。此为禅宗心法之根本。'),
    ('sammiao-wu', '三妙悟', '境界', '禅宗悟道之三层次：解悟、行悟、证悟。解悟为知解，行悟为践行，证悟为亲证。'),
    ('yixinyuan', '一心圆', '心性', '一心圆满具足万法。禅宗以\u201c一心圆\u201d为究竟——心外无法，法外无心，圆满具足，不欠一法。'),
    ('benjue', '本觉', '心性', '众生本具之觉性，非从修得。《大乘起信论》立\u201c本觉\u201d与\u201c始觉\u201d：本觉为众生本具之觉性，始觉为修行所起之觉。禅宗以\u201c本觉\u201d为宗——修行只是恢复本觉，非从外得。'),
    ('shijue', '始觉', '心性', '修行所起之觉，从本觉中显现。禅宗以\u201c始觉合本觉\u201d为究竟——始觉究竟即同本觉，能所双泯。'),
    ('bujue', '不觉', '心性', '众生无明妄动，迷失本觉之状态。禅宗以\u201c不觉即无明\u201d——一念妄动即是不觉，一念回光即同本觉。'),
    ('ranxiu', '染心', '心性', '被烦恼污染之心。禅宗以\u201c染心即妄心\u201d——真心本净，染心本空，但离妄念即同真心。'),
    ('jingxin', '净心', '心性', '远离烦恼污染之清净心。禅宗以\u201c净心即真心\u201d——心本清净，但去其染即现净心。'),
    ('wuhou', '无后', '心法', '不落后果，不续前念。禅宗以\u201c无后\u201d为功夫——前念已灭，后念未生，中间一段灵光独耀。'),
    ('dangnian', '当念', '心法', '当下之一念。禅宗以\u201c当念\u201d为宗——修行不在过去未来，唯在当下这一念。'),
    ('yiguan', '一贯', '心法', '一理贯通万法。禅宗以\u201c一以贯之\u201d为宗——万法归一，一归何处。'),
    ('zhengming', '正命', '实修', '八正道之一，以正当方式谋生。禅宗以\u201c正命\u201d为修行之基——日用之中不违正道。'),
    ('zhengye', '正业', '实修', '八正道之一，行为端正不造恶业。禅宗以\u201c正业\u201d为修行之基。'),
    ('zhengyu', '正语', '实修', '八正道之一，言语端正不妄语。禅宗以\u201c正语\u201d为修行之基。'),
]

missing = []
for cid, title, cat, summary in candidates:
    if cid not in existing_ids and title not in existing_titles:
        missing.append((cid, title, cat, summary))

print(f'\n=== 缺失概念: {len(missing)}个 ===')
for cid, title, cat, summary in missing:
    print(f'  {cid}: {title} ({cat})')

# Generate TS entries
entries = []
for cid, title, cat, summary in missing:
    entry = f'''  {{
    "id": "{cid}",
    "title": "{title}",
    "category": "{cat}",
    "summary": "{summary}",
    "etymology": "",
    "quotes": [],
    "guidance": "",
    "classicRef": "",
    "relatedConcepts": [],
    "relatedPersons": [],
    "relatedBooks": []
  }}'''
    entries.append(entry)

if entries:
    with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find end of ZEN_CONCEPTS array
    concepts_start = content.find('ZEN_CONCEPTS')
    concepts_end = content.find('];', concepts_start)
    last_brace = content.rfind('}', 0, concepts_end)
    
    insertion = ',\n' + ',\n'.join(entries)
    new_content = content[:last_brace+1] + insertion + content[last_brace+1:]
    
    with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'\nAdded {len(missing)} new concepts to taxonomy.ts')
    print(f'Total concepts now: {len(existing_ids) + len(missing)}')
else:
    print('No missing concepts to add')
