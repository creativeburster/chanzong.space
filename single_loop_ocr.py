import os
import time
from rapidocr_onnxruntime import RapidOCR

IMG_DIR = r'F:\chanzong.space\page_imgs'
RAW_DIR = r'F:\chanzong.space\raw_ocr'

os.makedirs(RAW_DIR, exist_ok=True)
engine = RapidOCR()

images = sorted([f for f in os.listdir(IMG_DIR) if f.endswith('.png')])
total = len(images)
print(f"Starting Single-Loop OCR on {total} images...")
start_time = time.time()

for idx, filename in enumerate(images):
    out_name = filename.replace('.png', '.txt')
    out_path = os.path.join(RAW_DIR, out_name)
    
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10:
        continue
        
    img_path = os.path.join(IMG_DIR, filename)
    result, _ = engine(img_path)
    
    lines = []
    if result:
        lines = [item[1] for item in result]
        
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
        
    if (idx + 1) % 25 == 0 or (idx + 1) == total:
        elapsed = time.time() - start_time
        print(f"Progress: {idx+1}/{total} ({((idx+1)/total)*100:.1f}%) in {elapsed:.1f}s", flush=True)

print("SUCCESS: Single-Loop OCR Complete!", flush=True)
