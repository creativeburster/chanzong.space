import fitz
from rapidocr_onnxruntime import RapidOCR
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

RAW_DIR = r'F:\chanzong.space\raw_ocr'
PDF_PATH = r'F:\chanzong.space\正法心传第2版.pdf'
MAX_WORKERS = 8

os.makedirs(RAW_DIR, exist_ok=True)
doc = fitz.open(PDF_PATH)
total_pages = len(doc)

print(f"Starting Multi-Threaded OCR ({MAX_WORKERS} workers) for {total_pages} pages...")

def ocr_page(page_idx):
    out_file = os.path.join(RAW_DIR, f'page_{page_idx+1:03d}.txt')
    if os.path.exists(out_file) and os.path.getsize(out_file) > 10:
        return page_idx, True
    
    # Open doc per thread to avoid fitz concurrency issues
    local_doc = fitz.open(PDF_PATH)
    page = local_doc[page_idx]
    pix = page.get_pixmap(dpi=150)
    img_bytes = pix.tobytes('png')
    local_doc.close()

    engine = RapidOCR()
    result, _ = engine(img_bytes)
    
    lines = []
    if result:
        lines = [item[1] for item in result]
    
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    return page_idx, False

start_time = time.time()
completed_count = 0

with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    futures = [executor.submit(ocr_page, i) for i in range(total_pages)]
    for future in as_completed(futures):
        page_idx, skipped = future.result()
        completed_count += 1
        if completed_count % 25 == 0 or completed_count == total_pages:
            elapsed = time.time() - start_time
            pages_per_sec = completed_count / elapsed if elapsed > 0 else 0
            print(f"Processed: {completed_count}/{total_pages} pages ({completed_count/total_pages*100:.1f}%) in {elapsed:.1f}s [{pages_per_sec:.2f} p/s]")

print(f"SUCCESS: All {total_pages} pages OCR extracted in {time.time()-start_time:.1f}s!")
