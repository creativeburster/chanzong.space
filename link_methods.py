with open(r'f:\chanzong.space\lib\taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Link methods to classics based on content relevance
method_links = {
    'nianfo-chan': ['xuemaicong', 'wuxinglun', 'poxianglun', 'zhengdaoge'],
    'daily-zen': ['baizhang', 'huangbo', 'zhengdaoge', 'shenhui'],
    'jiefeng': ['baizhang', 'huangbo', 'dunwu'],
    'can-huatou': ['huangbo', 'xinxinming', 'dunwu', 'zhenxin'],
    'kanhuatou': ['xinxinming', 'huangbo'],
    'shouben-zhenxin': ['xuemaicong', 'wuxinglun', 'fangcunlun', 'zuishangcheng'],
    'baoren': ['zhengdaoge', 'dunwu', 'shenhui'],
    'zhiguan-dazuo': ['xinxinming', 'fangcunlun', 'yongjia'],
    'canjiu': ['xuemaicong', 'wuxinglun', 'poxianglun', 'wuxinlun', 'xixulun', 'sixingguan', 'dunwu', 'zhenxin'],
    'mozhao': ['yongjia', 'baojingsanmei'],
    'chanjing-shuangxiu': ['zhengdaoge', 'shenhui'],
    'banghe': ['zhangzhi', 'huangbo'],
    'yixing-sanmei-practice': ['wenshu', 'juelin'],
    'er-gen-yuan-tong-practice': ['lengyanjing', 'xinjing'],
    'guan-zizai-banya-practice': ['xinjing', 'jingangjing'],
    'yuanjue-sanzhong-jingguan': ['yuanjuejing'],
    'weimo-buer-practice': ['weimojiejing'],
    'four-practices': ['sixingguan', 'xuemaicong'],
    'wumen': ['xinxinming'],
    'instant-enlightenment': ['xinxinming', 'dunwu', 'zhengdaoge'],
}

changes = 0

for method_id, book_ids in method_links.items():
    for book_id in book_ids:
        idx = content.find('"id": "' + method_id + '"')
        if idx < 0:
            print(f'WARNING: method {method_id} not found')
            continue
        
        rb_idx = content.find('"relatedBooks"', idx)
        if rb_idx < 0:
            continue
        
        close_idx = content.find(']', rb_idx)
        if close_idx < 0:
            continue
        
        segment = content[rb_idx:close_idx]
        if book_id in segment:
            continue
        
        arr_content = content[rb_idx:close_idx+1]
        new_arr = arr_content[:-1].rstrip() + ', "' + book_id + '"]'
        content = content[:rb_idx] + new_arr + content[close_idx+1:]
        changes += 1

print(f'Method linkings added: {changes}')

with open(r'f:\chanzong.space\lib\taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)
