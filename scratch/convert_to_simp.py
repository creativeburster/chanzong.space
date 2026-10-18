import opencc
import re

cc = opencc.OpenCC('t2s')
text = open('scratch/cleaned_text.txt', 'r', encoding='utf-8').read()

# 转换为规范简体
simp_text = cc.convert(text)

# 统计纯 CJK 汉字
cjk_chars = re.findall(r'[\u4e00-\u9fa5]', simp_text)
print(f"Total CJK Chinese characters: {len(cjk_chars)}")

with open('scratch/simp_text.txt', 'w', encoding='utf-8') as f:
    f.write(simp_text)
print("Saved simp_text.txt successfully.")
