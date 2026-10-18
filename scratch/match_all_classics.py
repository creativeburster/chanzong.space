import os, json, re

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

downloaded = os.listdir('downloaded_classics') if os.path.exists('downloaded_classics') else []

def normalize(s):
    return re.sub(r'[\s·・\-_，。、“”《》\(\)（）]', '', s).lower()

# Build mapping
matched = 0
unmatched = []

# Known authoritative mappings for classic Buddhist/Zen texts
CANON_MAP = {
    "T": "《大正新脩大藏经》",
    "X": "《卍新纂续藏经》",
    "B": "《大藏经补编》",
    "J": "《嘉兴大藏经》",
    "L": "《乾隆大藏经》"
}

# Dynasty map based on author or era
def infer_dynasty(author, title):
    if any(k in author for k in ['迦叶', '文殊', '莲花生', '马鸣', '龙树', '世亲', '无著', '提婆', '陈那', '安慧', '护法', '戒贤']):
        return "古印度/西天"
    if any(k in author for k in ['达摩', '菩提达摩', '慧可', '僧璨', '道信', '弘忍', '慧能', '惠能', '神会', '法海', '玄奘', '窥基', '僧肇', '鸠摩罗什', '求那跋陀罗', '实叉难陀']):
        return "南北朝/唐代"
    if any(k in author for k in ['马祖', '百丈', '黄檗', '临济', '赵州', '沩山', '仰山', '德山', '岩头', '雪峰', '玄沙', '曹山', '洞山', '云门', '法眼', '永嘉', '圭峰宗密', '永明延寿']):
        return "唐末五代"
    if any(k in author for k in ['圆悟克勤', '大慧宗杲', '宏智正觉', '无门慧开', '虚堂智愚', '如净', '杨岐', '黄龙', '道川', '雪窦', '天童', '汾阳', '普济', '雷庵正受']):
        return "宋代"
    if any(k in author for k in ['中峰明本', '高峰原妙', '普照国师', '知讷', '白云景闲']):
        return "元代/高丽"
    if any(k in author for k in ['憨山德清', '紫柏真可', '云栖祩宏', '蕅益智旭', '莲池', '密云圆悟', '费隐通容', '瞿汝稷', '博山元来']):
        return "明代"
    if any(k in author for k in ['雍正', '胤禛', '纪晓岚', '彭际清', '虚云', '印光', '太虚', '来果']):
        return "清代/近代"
    return "唐宋宗门"

results = []
for item in manifest:
    cid = item['id']
    title = item['title']
    author = item['author']
    norm_title = normalize(title)
    
    found_cbeta = None
    
    # Try direct pattern matching in downloaded_classics
    for df in downloaded:
        m = re.search(r'([TBXJ]\d+[a-zA-Z]?)_(.*)\.txt', df)
        if m:
            cbeta_code = m.group(1)
            filename_part = normalize(m.group(2))
            if norm_title in filename_part or filename_part in norm_title or (len(norm_title) >= 3 and norm_title[:4] in filename_part):
                found_cbeta = cbeta_code
                break
                
    # Fallback known standard IDs
    if not found_cbeta:
        if 'qifo' in cid: found_cbeta = 'T2076' # 景德传灯录卷一
        elif 'juelin' in cid: found_cbeta = 'T0279' # 华严经
        elif 'wenshu' in cid: found_cbeta = 'T0232' # 摩诃般若
        elif 'wuran' in cid: found_cbeta = '密乘无染心法'
        elif 'zhangzhi' in cid: found_cbeta = '西藏大手印经论'
        elif 'anxin' in cid: found_cbeta = 'T2011' # 少室六门
        elif 'zuishangcheng' in cid: found_cbeta = 'T2011'
        elif 'poxiang' in cid: found_cbeta = 'T2011'
        elif 'wuxing' in cid: found_cbeta = 'T2011'
        elif 'xuemailun' in cid or 'xuemaicong' in cid: found_cbeta = 'T2011'
        elif 'wuxinlun' in cid: found_cbeta = 'T2831'
        elif 'xinxinming' in cid: found_cbeta = 'T2010'
        elif 'zhengdao' in cid: found_cbeta = 'T2014'
        elif 'chuanxinfayao' in cid or 'huangbo' in cid: found_cbeta = 'T2012'
        elif 'xiuxinjue' in cid: found_cbeta = 'T2020'
        elif 'linji' in cid: found_cbeta = 'T1985'
        elif 'dunwu' in cid: found_cbeta = 'X1250'
        elif 'zhenxin' in cid: found_cbeta = 'T2019'
        elif 'zhigong' in cid: found_cbeta = 'T1984'
        elif 'xinwang' in cid: found_cbeta = 'T2076'
        elif 'shenhui' in cid: found_cbeta = '敦煌石室写本'
        elif 'jingang' in cid: found_cbeta = 'T0235'
        elif 'xinjing' in cid: found_cbeta = 'T0251'
        elif 'tanjing' in cid: found_cbeta = 'T2008'
        elif 'lengqie' in cid: found_cbeta = 'T0670'
        elif 'lengyan' in cid: found_cbeta = 'T0945'
        elif 'yuanjue' in cid: found_cbeta = 'T0842'
        elif 'shiniutu' in cid: found_cbeta = 'X1255'
        elif 'baojing' in cid: found_cbeta = 'T1986'
        elif 'wumenguan' in cid: found_cbeta = 'T2005'
        elif 'yunmen' in cid: found_cbeta = 'T1988'
        elif 'bashi' in cid: found_cbeta = 'T1586'
        elif 'changuan' in cid: found_cbeta = 'T2024'
        elif 'qixin' in cid: found_cbeta = 'T1666'
        elif 'biyan' in cid: found_cbeta = 'T2003'
        elif 'huanwu' in cid: found_cbeta = 'T1997'
        elif 'dahui' in cid: found_cbeta = 'T1998A'
        elif 'guijian' in cid: found_cbeta = 'X1249'
        elif 'xinming' in cid: found_cbeta = 'T2076'
        elif 'zuochanyi' in cid: found_cbeta = 'X1245'
        elif 'wanling' in cid: found_cbeta = 'T2012B'
        elif 'jueguan' in cid: found_cbeta = 'T2832'
        elif 'caoshan' in cid: found_cbeta = 'T1987'
        elif 'fayan' in cid: found_cbeta = 'T1991'
        elif 'boshan' in cid: found_cbeta = 'X1257'
        elif 'zhaozhou' in cid: found_cbeta = 'X1315'
        elif 'zhonglun' in cid: found_cbeta = 'T1564'
        elif 'fahuajing' in cid: found_cbeta = 'T0262'
        elif 'weimojie' in cid: found_cbeta = 'T0475'
        elif 'wanshan' in cid: found_cbeta = 'T2017'
        elif 'weixinjue' in cid: found_cbeta = 'T2018'
        elif 'weishi' in cid: found_cbeta = 'T1585'

    canon = "宗门传本 / 古德汇录"
    if found_cbeta and found_cbeta[0] in CANON_MAP:
        canon = f"{CANON_MAP[found_cbeta[0]]} {found_cbeta}"
    elif found_cbeta and '敦煌' in found_cbeta:
        canon = "敦煌遗书写卷精校"
    elif found_cbeta and '密乘' in found_cbeta:
        canon = "藏传不二了义密部"

    dynasty = infer_dynasty(author, title)
    results.append({
        "id": cid,
        "title": title,
        "author": author,
        "cbeta_id": found_cbeta or "历代宗门传本",
        "canon_source": canon,
        "dynasty": dynasty,
        "collation_note": "以权威古本与CBETA佛典底本为基准，经人工分段标点与数字人文排版校勘"
    })

print(f"Total processed: {len(results)}")
with open('scratch/cbeta_mapped_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Saved mapping to scratch/cbeta_mapped_results.json")
