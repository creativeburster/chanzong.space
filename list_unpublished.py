import os

files = [
    ('biyanlu.txt', '碧岩录', '圜悟克勤'),
    ('congronglu.txt', '从容录', '万松行秀'),
    ('fayanyulu.txt', '法演语录', '五祖法演'),
    ('caoshanyulu.txt', '曹山语录', '曹山本寂'),
    ('chanyuan_zhuquanjiduxu.txt', '禅源诸诠集都序', '宗密'),
    ('zongjinglu.txt', '宗镜录', '永明延寿'),
    ('wanshan_tongguiji.txt', '万善同归集', '永明延寿'),
    ('jueguanlun.txt', '绝观论', '牛头法融'),
    ('boshan_canchanjingyu.txt', '博山参禅警语', '博山元来'),
    ('zhonglun.txt', '中论', '龙树'),
    ('zhiyuelu.txt', '指月录', '瞿汝稷'),
    ('wudenghuiyuan.txt', '五灯会元', '普济'),
    ('jingdechuandenglu.txt', '景德传灯录', '道原'),
    ('dahui_simplified.txt', '大慧语录(待确认)', '大慧宗杲'),
]

base = 'f:/chanzong.space'
print(f"{'文件名':<35} {'经典名':<20} {'作者':<12} {'大小':>8}")
print('-' * 80)
for fname, title, author in files:
    path = os.path.join(base, fname)
    if os.path.exists(path):
        size_kb = os.path.getsize(path) // 1024
        print(f"{fname:<35} {title:<20} {author:<12} {size_kb:>6} KB")
    else:
        print(f"{fname:<35} {title:<20} {author:<12}   [文件不存在]")
