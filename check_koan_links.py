import json, re

m = json.load(open('manifest.json', 'r',encoding='utf-8'))
ids = {c['id'] for c in m}

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

koan_section = content[content.find('export const ZEN_KOANS'):content.find('export interface FAQItem')]

# Find all koans with source mentioning 洞山语录 but relatedBooks not containing dongshanyulu
# Parse each koan entry
koan_entries = re.findall(r'\{[^{}]*"id":\s*"koan-\d+"[^{}]*\}', koan_section, re.DOTALL)

print("=== 公案source提到洞山语录但relatedBooks未含dongshanyulu ===")
for entry in koan_entries:
    if '洞山语录' in entry and 'dongshanyulu' not in entry:
        kid = re.search(r'"id":\s*"(koan-\d+)"', entry)
        src = re.search(r'"source":\s*"([^"]*)"', entry)
        rb = re.search(r'"relatedBooks":\s*\[([^\]]*)\]', entry)
        if kid:
            print(f"  {kid.group(1)} source={src.group(1) if src else '?'} relatedBooks={rb.group(1) if rb else '?'}")

print()
print("=== 检查所有source字段中提到的经典名但relatedBooks不匹配 ===")
# Map source keywords to book ids
source_map = {
    '洞山语录': 'dongshanyulu',
    '云门广录': 'yunmen',
    '临济语录': 'linji',
    '马祖语录': 'mazu',
    '百丈语录': 'baizhang',
    '黄檗': 'huangbo',
    '无门关': 'wumenguan',
    '碧岩录': 'wumenguan',  # 碧岩录 not in manifest, skip
    '禅林宝训': 'chanlinbaoxun',
    '禅关策进': 'changuancejin',
    '大慧': 'dahuiyulu',
    '圆悟': 'huanwuyulu',
    '圜悟': 'huanwuyulu',
    '永嘉': 'yongjia',
    '宝镜三昧': 'baojingsanmei',
    '坛经': 'tanjing',
    '六祖坛经': 'tanjing',
    '达摩': 'xuemaicong',
    '信心铭': 'xinxinming',
    '证道歌': 'zhengdaoge',
    '十牛图': 'shiniutu',
    '八识规矩颂': 'bashiguijusong',
    '大乘起信论': 'dachengqixinlun',
    '楞严经': 'lengyanjing',
    '维摩': 'weimojiejing',
    '圆觉': 'yuanjuejing',
    '心经': 'xinjing',
    '金刚经': 'jingangjing',
    '文殊': 'wenshu',
    '修心诀': 'xiuxinjue',
    '真心直说': 'zhenxin',
    '顿悟': 'dunwu',
    '禅家龟鉴': 'chanjia_guijian',
}

for entry in koan_entries:
    src_match = re.search(r'"source":\s*"([^"]*)"', entry)
    rb_match = re.search(r'"relatedBooks":\s*\[([^\]]*)\]', entry)
    kid_match = re.search(r'"id":\s*"(koan-\d+)"', entry)
    if not (src_match and rb_match and kid_match):
        continue
    src = src_match.group(1)
    rb = rb_match.group(1)
    kid = kid_match.group(1)
    
    for src_key, book_id in source_map.items():
        if src_key in src and book_id in ids and book_id not in rb:
            print(f"  {kid} source含'{src_key}' 但 relatedBooks缺'{book_id}' | src={src} rb=[{rb}]")
