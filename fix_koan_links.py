import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Source keyword -> book id mapping (only for books in manifest)
source_map = {
    '洞山语录': 'dongshanyulu',
    '云门广录': 'yunmen',
    '临济语录': 'linji',
    '马祖语录': 'mazu',
    '百丈语录': 'baizhang',
    '黄檗传心法要': 'huangbo',
    '黄檗': 'huangbo',
    '无门关': 'wumenguan',
    '禅林宝训': 'chanlinbaoxun',
    '禅关策进': 'changuancejin',
    '大慧': 'dahuiyulu',
    '圆悟语录': 'huanwuyulu',
    '圜悟心要': 'huanwuxinyao',
    '圜悟': 'huanwuyulu',
    '永嘉证道歌': 'zhengdaoge',
    '证道歌': 'zhengdaoge',
    '永嘉禅宗集': 'yongjia',
    '永嘉集': 'yongjia',
    '宝镜三昧': 'baojingsanmei',
    '坛经': 'tanjing',
    '六祖坛经': 'tanjing',
    '信心铭': 'xinxinming',
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
    '顿悟入道': 'dunwu',
    '禅家龟鉴': 'chanjia_guijian',
    '血脉论': 'xuemaicong',
    '悟性论': 'wuxinglun',
    '破相论': 'poxianglun',
    '无心论': 'wuxinlun',
    '息许论': 'xixulun',
    '四行观': 'sixingguan',
    '最上乘论': 'zuishangcheng',
    '方寸论': 'fangcunlun',
    '心王铭': 'xinwangming',
    '显宗记': 'shenhui',
    '宝志公': 'zhigong',
    '七佛': 'qifo',
    '觉林': 'juelin',
    '无染觉性': 'wuran',
    '杖指教授': 'zhangzhi',
    '入道安心': 'anxin',
    '禅林宝训': 'chanlinbaoxun',
}

# Skip 碧岩录 since it's not in manifest
# '碧岩录' not mapped

koan_start = content.find('export const ZEN_KOANS')
koan_end = content.find('export interface FAQItem')
koan_section = content[koan_start:koan_end]

# Parse each koan entry and fix relatedBooks
# We need to find each koan block and check/fix its relatedBooks
lines = koan_section.split('\n')
fixed_count = 0
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Check if this line has "source": 
    if '"source":' in line:
        # Extract source value
        src_match = re.search(r'"source":\s*"([^"]*)"', line)
        if src_match:
            src = src_match.group(1)
            # Find which book ids should be added
            should_add = set()
            for src_key, book_id in source_map.items():
                if src_key in src:
                    should_add.add(book_id)
            
            if should_add:
                # Look ahead for relatedBooks line
                # Find the relatedBooks line within the next 10 lines
                rb_line_idx = None
                for j in range(i+1, min(i+15, len(lines))):
                    if '"relatedBooks"' in lines[j]:
                        rb_line_idx = j
                        break
                
                if rb_line_idx is not None:
                    rb_line = lines[rb_line_idx]
                    # Extract current relatedBooks
                    rb_match = re.search(r'"relatedBooks":\s*\[([^\]]*)\]', rb_line)
                    if rb_match:
                        current_rb = rb_match.group(1).strip()
                        # Parse existing ids
                        existing_ids = set(re.findall(r'"([^"]+)"', current_rb))
                        
                        # Find which ids need to be added
                        to_add = should_add - existing_ids
                        if to_add:
                            # Build new relatedBooks
                            all_ids = list(existing_ids) + list(to_add)
                            new_rb = ', '.join(f'"{bid}"' for bid in all_ids)
                            new_rb_line = rb_line.replace(rb_match.group(0), f'"relatedBooks": [{new_rb}]')
                            lines[rb_line_idx] = new_rb_line
                            fixed_count += 1
                            print(f"Fixed: added {to_add} to relatedBooks")
    
    new_lines.append(line)
    i += 1

new_koan_section = '\n'.join(new_lines)
new_content = content[:koan_start] + new_koan_section + content[koan_end:]

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nTotal fixes: {fixed_count}")
