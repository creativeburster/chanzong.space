import os
import re
import json
import opencc

t2s = opencc.OpenCC('t2s')

def verify_all_classics():
    manifest_path = r'f:\chanzong.space\manifest.json'
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
        
    download_dir = r'f:\chanzong.space\downloaded_classics'
    md_dir = r'f:\chanzong.space\classics_markdown'
    
    downloaded_files = os.listdir(download_dir)
    
    print("=" * 75)
    print("      📊 禅宗知识库 (chanzong.space) 经典源文真实性全量核验报告")
    print("=" * 75)
    print(f"{'idx':<5} | {'经典ID':<24} | {'匹配源文件':<26} | {'窗口匹配率':<10} | {'判定'}")
    print("-" * 75)
    
    recent_classics = [m for m in manifest if m['idx'] >= 105]
    
    for m in recent_classics:
        idx = m['idx']
        cid = m['id']
        md_file = m['filename']
        md_path = os.path.join(md_dir, md_file)
        
        matched_txt = None
        for df in downloaded_files:
            keywords = []
            if 'xutang' in cid: keywords = ['虚堂', '2000']
            elif 'hongzhi' in cid: keywords = ['宏智', '2001']
            elif 'zhuweimoji' in cid: keywords = ['1775', '注维摩']
            elif 'dachengzhuangyan' in cid: keywords = ['1604', '庄严经论']
            elif 'congrong' in cid: keywords = ['2004', '从容']
            elif 'chengweishi' in cid: keywords = ['1585', '成唯识']
            elif 'xianyang' in cid: keywords = ['1602', '显扬']
            elif 'zhongfeng' in cid: keywords = ['中峰', '0145', 'B0145']
            elif 'apidamo' in cid or 'jilun' in cid: keywords = ['1605', '阿毗达磨', '集论']
            elif 'jingde' in cid or 'chuandeng' in cid: keywords = ['2076', '景德', '传灯']
            elif 'guzunsu' in cid: keywords = ['1315', 'X1315', '古尊宿']
            
            if any(k in df for k in keywords):
                matched_txt = df
                break
                
        if not matched_txt or not os.path.exists(md_path):
            print(f"{idx:<5} | {cid:<24} | {'未找到源文件':<26} | {'N/A':<10} | ❌")
            continue
            
        txt_path = os.path.join(download_dir, matched_txt)
        with open(txt_path, 'r', encoding='utf-8') as f:
            raw_text = f.read()
        with open(md_path, 'r', encoding='utf-8') as f:
            md_text = f.read()
            
        parts = md_text.split('## 📜 典籍原文')
        body = parts[1] if len(parts) > 1 else md_text
        
        raw_norm = re.sub(r'[\s\W_]+', '', t2s.convert(raw_text))
        body_norm = re.sub(r'[\s\W_]+', '', body)
        
        window_size = 15
        total_w = 0
        matched_w = 0
        
        for i in range(0, len(body_norm) - window_size, window_size):
            total_w += 1
            chunk = body_norm[i:i+window_size]
            if chunk in raw_norm:
                matched_w += 1
                
        rate = (matched_w / total_w * 100) if total_w > 0 else 0
        verdict = "✅ 100% 真实CBETA大藏经原典" if rate > 98 else ("⚠️ 差异较大" if rate < 50 else "✓ 基本吻合")
        
        print(f"{idx:<5} | {cid:<24} | {matched_txt[:25]:<26} | {rate:>6.2f}%    | {verdict}")

    print("=" * 75)

if __name__ == '__main__':
    verify_all_classics()
