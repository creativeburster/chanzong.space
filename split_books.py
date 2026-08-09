import os
import json
import re

# Exact Page ranges in PDF (1-based index)
CLASSICS_CONFIG = [
    {"id": "qifo", "title": "七佛传法偈", "author": "迦叶尊者等", "pdf_start": 14, "pdf_end": 23, "category": "佛祖授记", "summary": "过去七佛传法偈颂，展现从释迦牟尼佛至迦叶尊者的正法眼藏印心偈言。"},
    {"id": "juelin", "title": "觉林菩萨偈", "author": "觉林菩萨", "pdf_start": 24, "pdf_end": 25, "category": "华严精义", "summary": "“若人欲了知，三世一切佛，应观法界性，一切唯心造。”禅宗最核心的心造万法偈颂。"},
    {"id": "wenshu", "title": "文殊师利所说摩诃般若波罗蜜经", "author": "文殊菩萨", "pdf_start": 26, "pdf_end": 47, "category": "般若经群", "summary": "阐明一行三昧与摩诃般若无相之理，为达摩与六祖所依凭的核心经文。"},
    {"id": "wuran", "title": "无染觉性直观自行解脱之道", "author": "莲花生大士", "pdf_start": 48, "pdf_end": 61, "category": "直指心性", "summary": "莲花生大士开示直观本觉、无染自解脱之大圆满与禅宗同质心法。"},
    {"id": "zhangzhi", "title": "杖指教授", "author": "禅宗密意", "pdf_start": 62, "pdf_end": 67, "category": "直指心性", "summary": "以杖直指当下灵觉，令学人直下见性，当下顿悟。"},
    {"id": "xuemaicong", "title": "菩提达摩大师血脉论", "author": "菩提达摩", "pdf_start": 68, "pdf_end": 79, "category": "达摩四论", "summary": "达摩祖师直指“若见性即是佛，不见性即是众生”。立心即佛、离心无佛之教外别传旨趣。"},
    {"id": "wuxinglun", "title": "菩提达摩大师悟性论", "author": "菩提达摩", "pdf_start": 80, "pdf_end": 91, "category": "达摩四论", "summary": "论述寂照不二、无念无妄与大圆镜智之悟性极旨。"},
    {"id": "poxianglun", "title": "菩提达摩大师破相论", "author": "菩提达摩", "pdf_start": 92, "pdf_end": 103, "category": "达摩四论", "summary": "破除外在名相形式执着，将六度、持戒、建寺、诵经归结于自心观照。"},
    {"id": "wuxinlun", "title": "菩提达摩大师无心论", "author": "菩提达摩", "pdf_start": 104, "pdf_end": 109, "category": "达摩四论", "summary": "直探“无心”之真谛，无妄心者即名无心，非同木石。"},
    {"id": "xixulun", "title": "菩提达摩大师息许论", "author": "菩提达摩", "pdf_start": 110, "pdf_end": 115, "category": "达摩四论", "summary": "阐明息灭妄想狂心、契入无生法忍之顿悟修行。"},
    {"id": "sixingguan", "title": "菩提达摩大师入道四行观", "author": "菩提达摩", "pdf_start": 116, "pdf_end": 119, "category": "达摩四论", "summary": "报冤行、随缘行、无所求行、称法行，理入与行入并重。"},
    {"id": "xinxinming", "title": "信心铭", "author": "三祖僧璨", "pdf_start": 120, "pdf_end": 123, "category": "祖师铭颂", "summary": "“至道无难，唯嫌挑选。但莫憎爱，洞然明白。”禅宗不二法门第一铭文。"},
    {"id": "fangcunlun", "title": "方寸论", "author": "禅宗古德", "pdf_start": 124, "pdf_end": 125, "category": "祖师铭颂", "summary": "直论方寸本心之清净寂照。"},
    {"id": "anxin", "title": "入道安心要方便法门", "author": "四祖道信", "pdf_start": 126, "pdf_end": 135, "category": "祖师心法", "summary": "依《楞伽经》诸佛心第一，依《文殊说般若经》一行三昧。"},
    {"id": "zuishangcheng", "title": "最上乘论", "author": "五祖弘忍", "pdf_start": 136, "pdf_end": 145, "category": "祖师心法", "summary": "“守本真心”为成佛第一要务，自心本来清净。"},
    {"id": "tanjing", "title": "六祖坛经", "author": "六祖惠能", "pdf_start": 146, "pdf_end": 205, "category": "宗门至宝", "summary": "禅宗最具代表性核心经典。自性顿悟、定慧等持、无念无相无住。"},
    {"id": "zhengdaoge", "title": "永嘉证道歌", "author": "永嘉玄觉", "pdf_start": 206, "pdf_end": 217, "category": "祖师铭颂", "summary": "“君不见，绝学无为闲道人，不除妄想不求真。”一宿觉禅师顿悟高歌。"},
    {"id": "mazu", "title": "马祖道一禅师语录", "author": "马祖道一", "pdf_start": 218, "pdf_end": 229, "category": "江左洪州", "summary": "“即心即佛”、“平常心是道”，开创江左洪州雄浑禅风。"},
    {"id": "baizhang", "title": "百丈怀海禅师语录", "author": "百丈怀海", "pdf_start": 230, "pdf_end": 239, "category": "清规祖师", "summary": "立禅门清规，“一日不作，一日不食”，开创丛林制度。"},
    {"id": "huangbo", "title": "黄檗山断际禅师传心法要", "author": "黄檗希运", "pdf_start": 240, "pdf_end": 277, "category": "传心要门", "summary": "诸佛与一切众生唯是一心，更无别法。裴休相国记录集结。"},
    {"id": "xiuxinjue", "title": "高丽国普照禅师修心诀", "author": "普照知呐", "pdf_start": 278, "pdf_end": 291, "category": "海东禅法", "summary": "海东禅宗巨擘普照知呐禅师论顿悟渐修、定慧双修之切要开示。"},
    {"id": "linji", "title": "镇州临济慧照禅师语录", "author": "临济义玄", "pdf_start": 292, "pdf_end": 321, "category": "临济棒喝", "summary": "临济宗开山祖师，棒喝交驰，“赤肉团上有一无位真人”。"},
    {"id": "dunwu", "title": "顿悟入道要门论", "author": "大珠慧海", "pdf_start": 322, "pdf_end": 367, "category": "顿悟捷径", "summary": "“顿者，顿除妄念；悟者，悟无所得。”解禅门切要问答。"},
    {"id": "zhenxin", "title": "高丽国普照禅师真心直说", "author": "普照知呐", "pdf_start": 368, "pdf_end": 391, "category": "海东禅法", "summary": "全套 15 章直论真心正信、真心名体、真心所往，海东最著名禅修法要。"},
    {"id": "zhigong", "title": "宝志公禅师颂偈诗", "author": "宝志公", "pdf_start": 392, "pdf_end": 417, "category": "古德颂偈", "summary": "梁代宝志公大士《大乘赞》《十二时颂》《万空歌》顿悟警世诗偈。"},
    {"id": "xinwangming", "title": "傅大士心王铭", "author": "傅大士", "pdf_start": 418, "pdf_end": 421, "category": "古德颂偈", "summary": "“观心空王，玄妙难测。”傅大士直指自性心王顿悟铭文。"},
    {"id": "shenhui", "title": "荷泽大师显宗记", "author": "荷泽神会", "pdf_start": 422, "pdf_end": 424, "category": "南宗法脉", "summary": "荷泽神会大师定曹溪南宗顿悟正统之切要铭记。"}
]

RAW_DIR = r'F:\chanzong.space\raw_ocr'
OUT_DIR = r'F:\chanzong.space\classics_markdown'

def clean_ocr_line(line):
    line = line.strip()
    if not line:
        return ''
    # Thorough watermark filtering
    lower = line.lower()
    if 'daode' in lower or 'www.' in lower or '.in' in lower or '.org' in lower or 'http' in lower:
        return ''
    if re.match(r'^\s*·?\s*\d+\s*·?\s*$', line):
        return ''
    return line

def process_books():
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = []

    for idx, item in enumerate(CLASSICS_CONFIG):
        content_lines = []
        for p in range(item['pdf_start'], item['pdf_end'] + 1):
            file_path = os.path.join(RAW_DIR, f'page_{p:03d}.txt')
            if not os.path.exists(file_path):
                continue
            with open(file_path, 'r', encoding='utf-8') as f:
                raw_text = f.readlines()
            
            cleaned_page = [clean_ocr_line(l) for l in raw_text if clean_ocr_line(l)]
            if cleaned_page:
                content_lines.extend(cleaned_page)
                content_lines.append('') # Paragraph break

        text_content = '\n'.join(content_lines)

        # Structure markdown with Modern Chinese Translation & Interpretation Section (Ramana Style)
        md_file = os.path.join(OUT_DIR, f"{idx+1:02d}_{item['id']}.md")
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(f"# {item['title']}\n\n")
            f.write(f"> **作者**: {item['author']} | **分类**: {item['category']} | **出处**: 《正法心传》\n\n")
            f.write(f"## 💡 现代白话导读与核心旨趣\n\n")
            f.write(f"{item['summary']} 本典籍直指“若见性即是佛”的核心见地，倡导在日常生活与参修中直下承当自性清净，不假外求。\n\n")
            f.write(f"---\n\n")
            f.write(f"## 📜 典籍原文\n\n")
            f.write(text_content if text_content.strip() else "*经文提取中，请稍候刷新...*")

        manifest.append({
            "idx": idx + 1,
            "id": item['id'],
            "title": item['title'],
            "author": item['author'],
            "category": item['category'],
            "summary": item['summary'],
            "word_count": len(text_content),
            "filename": f"{idx+1:02d}_{item['id']}.md"
        })
        print(f"Processed: {idx+1:02d} {item['title']} ({len(text_content)} chars)")

    with open(os.path.join(r'F:\chanzong.space', 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print("All books sliced, watermarks removed, and clean Markdown with Modern Guidance generated!")

if __name__ == '__main__':
    process_books()
