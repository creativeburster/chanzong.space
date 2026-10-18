import sys

with open('lib/glossary.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "'conglinxiaodingqinggui':" in content:
    print('conglinxiaodingqinggui already exists in glossary.ts')
    sys.exit(0)

target = '};\n'
pos = content.rfind(target)
if pos == -1:
    target = '};'
    pos = content.rfind(target)

new_block = """  'conglinxiaodingqinggui': [
    { char: '结制', pinyin: 'jié zhì', meaning: '结夏安居之法制。农历四月十五至七月十五僧众结聚一处收摄九旬专修，称结夏安居或结制。' },
    { char: '挂搭', pinyin: 'guà dā', meaning: '亦作挂单、挂锡。行脚游方参学僧到寺安单，将衣钵行李钩挂于僧堂之钩架上，获准挂名常住。' },
    { char: '十六板首', pinyin: 'shí liù bǎn shǒu', meaning: '宋代禅林僧堂内依戒腊德望列坐于各板床首位的十六位大德头首（如首座、西堂、后堂、立僧等）。' },
    { char: '两班', pinyin: 'liǎng bān', meaning: '禅林僧团执事之两大系统：西序头首班（主管教化与法事）与东序知事班（主管事务与行政）。' },
    { char: '江湖茶', pinyin: 'jiāng hú chá', meaning: '丛林头首知事在众寮中，特为来自江南江北四方五湖游方行脚之参禅衲僧所设之公宴香茗。' },
    { char: '放参', pinyin: 'fàng cān', meaning: '禅堂坐禅告一段落，击板开静免参，准许大众休息或自适，称放参（放参后常有放参饭汤）。' },
    { char: '普说', pinyin: 'pǔ shuō', meaning: '住持宗师在法堂为全体大众普泛宣说宗乘义理与丛林训诫之非正式升堂讲法。' },
    { char: '巡堂', pinyin: 'xún táng', meaning: '住持或维那行巡于僧堂内，瞻视大众威仪坐相并警策昏沉懈怠之巡视规矩。' },
  ],
"""

new_content = content[:pos] + new_block + content[pos:]

with open('lib/glossary.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Successfully added conglinxiaodingqinggui to lib/glossary.ts')
