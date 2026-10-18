import re

raw = open('downloaded_classics/【待发布】T0262_妙法莲华经.txt', 'r', encoding='utf-8').read()

# 1. 截取正文
pos = raw.find('No. 262 [Nos. 263, 264]')
if pos != -1:
    body = raw[pos + len('No. 262 [Nos. 263, 264]'):]
else:
    body = raw

body = body.strip()

# 2. 占位符替换
body = re.sub(r'\[[○@]*（□）底本缺字\]', '[□]', body)
body = re.sub(r'\[○@（□）\]', '[□]', body)

# 3. 规范化分卷与品目
lines = body.split('\n')
cleaned_lines = []

for line in lines:
    stripped = line.strip()
    if not stripped:
        if cleaned_lines and cleaned_lines[-1] != "":
            cleaned_lines.append("")
        continue
    
    # 卷标题
    if re.match(r'^妙法蓮華經卷第[一二三四五六七八九十]+$', stripped):
        cleaned_lines.append(f"\n### {stripped}\n")
        continue
    
    # 品目标题
    if re.match(r'^(?:妙法蓮華經[^\n]*品第[一二三四五六七八九十]+|[^\n]+品第[一二三四五六七八九十]+)$', stripped):
        cleaned_lines.append(f"\n#### {stripped}\n")
        continue
        
    if stripped in ["御製大乘妙法蓮華經序", "妙法蓮華經弘傳序", "後序", "御製觀世音普門品經序"]:
        cleaned_lines.append(f"\n### {stripped}\n")
        continue

    cleaned_lines.append(stripped)

clean_body = '\n'.join(cleaned_lines)
clean_body = re.sub(r'\n{3,}', '\n\n', clean_body).strip()

cjk_chars = re.findall(r'[\u4e00-\u9fff]', clean_body)
print(f"Cleaned CJK character count: {len(cjk_chars):,}")

with open('scratch/cleaned_text.txt', 'w', encoding='utf-8') as f:
    f.write(clean_body)
print("Saved cleaned text to scratch/cleaned_text.txt")
