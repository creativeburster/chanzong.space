import re

with open('dahui_content.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Split into sections by卷
sections = re.split(r'(大慧普觉禅师.{0,30}语录卷第[一二三四五六七八九十]+|普说卷第[一二三四五六七八九十]+|法语卷第[一二三四五六七八九十]+|偈颂卷第[一二三四五六七八九十]+|赞佛祖卷第[一二三四五六七八九十]+|室中机缘|进大慧禅师语录奏劄|大慧普觉禅师塔铭)', content)

# Build section map
section_map = {}
current_section = '奏札'
current_text = ''

for i, part in enumerate(sections):
    if re.match(r'(大慧普觉禅师.{0,30}语录卷第[一二三四五六七八九十]+|普说卷第[一二三四五六七八九十]+|法语卷第[一二三四五六七八九十]+|偈颂卷第[一二三四五六七八九十]+|赞佛祖卷第[一二三四五六七八九十]+|室中机缘|进大慧禅师语录奏劄|大慧普觉禅师塔铭)', part):
        if current_text:
            section_map[current_section] = current_text
        current_section = part.strip()
        current_text = ''
    else:
        current_text += part

if current_text:
    section_map[current_section] = current_text

# Print section summary
for name, text in section_map.items():
    chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    print(f'{name[:40]:40s}  {chars:6d}字')

# Extract key passages for the markdown
# 1. 奏札 (skip - administrative)
# 2. 语录卷1-9: 上堂示众, 机缘
# 3. 颂古: 颂古诗偈
# 4. 普说: 普说开示 (most important for content)
# 5. 法语: 示居士法语 (most important for practice guidance)

# Get representative passages from each major section
print('\n=== 语录卷1 前500字 ===')
for name, text in section_map.items():
    if '卷第一' in name:
        print(text[:500])
        break

print('\n=== 普说卷13 前500字 ===')
for name, text in section_map.items():
    if '普说卷第十三' in name:
        print(text[:500])
        break

print('\n=== 法语卷19 前500字 ===')
for name, text in section_map.items():
    if '法语卷第十九' in name:
        print(text[:500])
        break

# Count total
total = sum(len(re.findall(r'[\u4e00-\u9fff]', text)) for text in section_map.values())
print(f'\n总计: {total}字')
