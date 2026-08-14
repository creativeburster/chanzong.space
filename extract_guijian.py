import fitz
from opencc import OpenCC

cc = OpenCC('t2s')
doc = fitz.open('无门关_临济语录_禅家龟鉴.pdf')

# Extract pages 63-88 (禅家龟鉴)
text = ''
for i in range(62, 88):  # 0-indexed: pages 63-88
    raw = doc[i].get_text()
    # Remove page numbers (standalone numbers on their own line)
    lines = raw.split('\n')
    cleaned = []
    for line in lines:
        s = line.strip()
        if s and not (s.isdigit() and len(s) <= 3):
            cleaned.append(s)
    text += '\n'.join(cleaned) + '\n'

# Convert to simplified
simplified = cc.convert(text)

# Save
with open('chanjia_guijian.txt', 'w', encoding='utf-8') as f:
    f.write(simplified)

# Count Chinese chars
import re
chinese_chars = re.findall(r'[\u4e00-\u9fff]', simplified)
print(f'禅家龟鉴 extracted: {len(chinese_chars)} Chinese chars')
print(f'First 500 chars:')
print(simplified[:500])
