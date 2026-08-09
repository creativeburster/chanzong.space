import os
import time
from rapidocr_onnxruntime import RapidOCR
from concurrent.futures import ProcessPoolExecutor, as_completed

IMG_DIR = r'F:\chanzong.space\page_imgs'
RAW_DIR = r'F:\chanzong.space\raw_ocr'

os.makedirs(RAW_DIR, exist_ok=True)

def ocr_single_image(filename):
    out_name = filename.replace('.png', '.txt')
    out_path = os.path.join(RAW_DIR, out_name)
    
    if os.path.exists(out_path) and os.path.getsize(out_path) > 10:
        return filename, True
        
    img_path = os.path.join(IMG_DIR, filename)
    engine = RapidOCR()
    result, _ = engine(img_path)
    
    lines = []
    if result:
        lines = [item[1] for item in result]
        
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
        
    return filename, False

if __name__ == '__main__':
    images = sorted([f for f in os.listdir(IMG_DIR) if f.endswith('.png')])
    total = len(images)
    print(f"Starting ProcessPool OCR on {total} images...")
    start_time = time.time()
    
    completed = 0
    with ProcessPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(ocr_single_image, img): img for img in images}
        for future in as_completed(futures):
            img_name, skipped = future.result()
            completed += 1
            if completed % 25 == 0 or completed == total:
                elapsed = time.time() - start_time
                rate = completed / elapsed if elapsed > 0 else 0
                print(f"OCR Progress: {completed}/{total} ({completed/total*100:.1f}%) in {elapsed:.1f}s [{rate:.2f} img/s]")

    print(f"SUCCESS: All {total} images OCR extracted in {time.time()-start_time:.1f}s!")
