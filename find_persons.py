import re, os, json

# Get existing person IDs and names
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

person_section = content.split('ZEN_PERSONS')[1].split('ZEN_CONCEPTS')[0]
existing_ids = set(re.findall(r'"id": "([^"]+)"', person_section))
existing_names = set(re.findall(r'"name": "([^"]+)"', person_section))

print(f'现有人物: {len(existing_ids)}位')
print(f'IDs: {sorted(existing_ids)}')
print(f'Names: {sorted(existing_names)}')

# Scan all markdown files for person names mentioned
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Key Zen figures to check - common names in Zen history
# Look for names in markdown that are NOT in existing_names
candidate_names = [
    # From classic titles and content - known Zen figures
    '达摩', '慧可', '僧璨', '道信', '弘忍', '惠能', '神会', '慧忠',
    '马祖', '百丈', '南泉', '赵州', '临济', '德山', '洞山', '曹山',
    '云门', '法眼', '沩山', '仰山', '黄檗', '睦州', '雪峰', '玄沙',
    '罗汉', '桂琛', '天台', '德韶', '永明', '延寿', '汾阳', '善昭',
    '慈明', '楚圆', '杨岐', '方会', '黄龙', '慧南', '五祖', '法演',
    '圆悟', '克勤', '大慧', '宗杲', '虎丘', '绍隆', '应庵', '昙华',
    '密庵', '咸杰', '破庵', '祖先', '无准', '师范', '雪岩', '祖钦',
    '高峰', '原妙', '中峰', '明本', '天如', '惟则',
    '无门', '慧开', '万松', '行秀', '从容',
    '永嘉', '玄觉', '寒山', '拾得', '庞蕴', '庞居士',
    '丹霞', '天然', '投子', '大同', '石头', '希迁',
    '青原', '行思', '南岳', '怀让', '荷泽',
    '圭峰', '宗密', '澄观', '法藏',
    '僧肇', '道生', '吉藏',
    '傅大士', '志公', '宝志',
    '牛头', '法融', '智岩', '慧方',
    '鸟窠', '道林',
    '径山', '宗杲',
    '佛眼', '清远', '太平', '慧懑',
    '开福', '道宁',
    '佛鉴', '慧勤',
    '白杨', '法顺',
    '真净', '克文',
    '兜率', '从悦',
    '晦堂', '祖心',
    '灵源', '惟清',
    '死心', '悟新',
    '草堂',
    '长芦', '宗赜',
    '真歇', '清了',
    '宏智', '正觉',
    '天童',
    '芙蓉', '道楷',
    '丹霞', '子淳',
    '真州',
    '自得', '慧晖',
    '足庵', '智鉴',
    '雪窦', '重显',
    '天衣', '义怀',
    '圆通', '居讷',
    '大觉', '怀琏',
    '佛印', '了元',
    '东林', '常总',
    '玉泉', '承皓',
    '荐福', '承古',
    '文殊', '菩萨',
    '普贤',
    '维摩诘',
    '舍利弗',
    '目连',
    '阿难',
    '迦叶',
    '须菩提',
    '富楼那',
    '迦旃延',
    '优波离',
    '罗睺罗',
    '慧思',
    '智顗',
    '灌顶',
    '湛然',
    '知礼',
    '蕅益',
    '袾宏',
    '真可',
    '德清',
    '博山',
    '元来',
    '无异',
    '见月',
    '读体',
]

# Check which candidate names appear in markdown but are NOT in existing_names
found_in_md = {}
md_dir = 'classics_markdown'
for fn in sorted(os.listdir(md_dir)):
    if not fn.endswith('.md'):
        continue
    filepath = os.path.join(md_dir, fn)
    with open(filepath, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    for name in candidate_names:
        if name in md_content and name not in existing_names:
            if name not in found_in_md:
                found_in_md[name] = []
            found_in_md[name].append(fn)

print(f'\n=== 在Markdown中出现但未收录的人物名 ===')
for name, files in sorted(found_in_md.items()):
    print(f'  {name}: 出现在 {files[:5]}')

# Also check taxonomy.ts koan/concept/faq sections for person names not in ZEN_PERSONS
print(f'\n=== 现有人物名列表 ===')
for n in sorted(existing_names):
    print(f'  {n}')
