import json, re

with open(r'f:\chanzong.space\lib\taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open(r'f:\chanzong.space\manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Build linkings: for each classic, which persons/concepts to link
# Based on text analysis above
linkings = {
    'qifo': {'concepts': ['prajna', 'emptiness', 'no-abiding', 'direct-pointing', 'beyond-words']},
    'juelin': {'persons': ['wenshu-yuanjue'], 'concepts': ['prajna', 'emptiness', 'non-duality', 'samadhi', 'no-abiding']},
    'wenshu': {'persons': ['daoxin'], 'concepts': ['emptiness', 'non-duality', 'no-abiding', 'self-nature', 'non-mind']},
    'wuran': {'concepts': ['buddha-nature', 'prajna', 'emptiness', 'non-duality', 'direct-pointing']},
    'zhangzhi': {'persons': ['bodhidharma'], 'concepts': ['emptiness', 'non-duality', 'no-abiding', 'self-nature', 'instant-enlightenment']},
    'xuemaicong': {'concepts': ['buddha-nature', 'mind-is-buddha', 'non-mind', 'wu-xiang']},
    'wuxinglun': {'concepts': ['buddha-nature', 'prajna', 'emptiness', 'non-duality', 'self-nature']},
    'poxianglun': {'concepts': ['buddha-nature', 'prajna', 'emptiness', 'self-nature', 'non-mind']},
    'wuxinlun': {'persons': ['huike'], 'concepts': ['prajna', 'self-nature', 'real-mind', 'zhongdao']},
    'xixulun': {'concepts': ['buddha-nature', 'self-nature', 'instant-enlightenment', 'wuwo', 'fashen']},
    'sixingguan': {'concepts': ['emptiness', 'self-nature', 'wuwo', 'liudu', 'yinguo']},
    'xinxinming': {'persons': ['niutou-farong'], 'concepts': ['prajna', 'emptiness', 'self-nature', 'real-mind', 'fashen']},
    'fangcunlun': {'concepts': ['emptiness', 'zhongdao', 'niepan', 'wu-xiang', 'fajie']},
    'zuishangcheng': {'concepts': ['buddha-nature', 'emptiness', 'self-nature', 'real-mind', 'weishi-yixin']},
    'zhengdaoge': {'persons': ['bodhidharma', 'huineng'], 'concepts': ['buddha-nature', 'prajna', 'emptiness', 'non-duality', 'self-nature']},
    'baizhang': {'concepts': ['emptiness', 'koan', 'self-nature', 'instant-enlightenment', 'non-mind']},
    'huangbo': {'persons': ['baizhang', 'linji'], 'concepts': ['emptiness', 'direct-pointing', 'real-mind', 'niepan', 'wu-xiang']},
    'xiuxinjue': {'concepts': ['emptiness', 'non-duality', 'direct-pointing', 'self-nature', 'dunwu-jianxiu']},
    'dunwu': {'persons': ['mazu'], 'concepts': ['emptiness', 'non-duality', 'no-abiding', 'non-mind', 'real-mind']},
    'zhenxin': {'concepts': ['emptiness', 'non-duality', 'direct-pointing', 'niepan', 'wu-xiang']},
    'zhigong': {'persons': ['fudaoshi'], 'concepts': ['buddha-nature', 'emptiness', 'affliction-bodhi', 'mind-is-buddha', 'all-returns-to-one']},
    'xinwangming': {'concepts': ['emptiness', 'mind-is-buddha', 'direct-pointing', 'instant-enlightenment', 'non-mind']},
    'shenhui': {'concepts': ['buddha-nature', 'prajna', 'emptiness', 'no-abiding', 'instant-enlightenment']},
    'jingangjing': {'persons': ['hongren', 'huineng'], 'concepts': ['prajna', 'emptiness', 'samadhi', 'no-abiding', 'self-nature']},
    'shiniutu': {'concepts': ['emptiness', 'self-nature', 'zhengfa-yancang']},
    'baojingsanmei': {'concepts': ['non-duality', 'samadhi', 'self-nature', 'zhenru', 'fajie']},
    'yongjia': {'persons': ['yongjia'], 'concepts': ['emptiness', 'non-duality', 'zhongdao', 'niepan', 'mozhao-chan-concept']},
    'bashiguijusong': {'concepts': ['emptiness', 'direct-pointing', 'real-mind', 'canjiu', 'jiaowai-biechuan']},
}

changes = 0

for book_id, links in linkings.items():
    for item_id in links.get('persons', []) + links.get('concepts', []):
        # Find the object with this id
        idx = content.find('"id": "' + item_id + '"')
        if idx < 0:
            print(f'WARNING: {item_id} not found')
            continue
        
        # Find relatedBooks after this id
        rb_idx = content.find('"relatedBooks"', idx)
        if rb_idx < 0:
            print(f'WARNING: {item_id} has no relatedBooks')
            continue
        
        # Find the closing ] for relatedBooks array
        close_idx = content.find(']', rb_idx)
        if close_idx < 0:
            print(f'WARNING: {item_id} relatedBooks malformed')
            continue
        
        segment = content[rb_idx:close_idx]
        
        if book_id in segment:
            continue  # Already linked
        
        # Add book_id to the array
        arr_content = content[rb_idx:close_idx+1]
        new_arr = arr_content[:-1].rstrip() + ', "' + book_id + '"]'
        content = content[:rb_idx] + new_arr + content[close_idx+1:]
        changes += 1

print(f'Total linkings added: {changes}')

with open(r'f:\chanzong.space\lib\taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)
