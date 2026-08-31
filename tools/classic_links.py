# -*- coding: utf-8 -*-
"""为 93 部已发布经典逐部写入人工标注的「🔗 经典连线」（法脉/主题语义内链）
插入位置：作者 meta 行之后（无 meta 行则 H1 之后），首屏可见。
幂等：已含「🔗 经典连线」的文件跳过。
"""
import json
import os
import re

os.chdir(r'F:\chanzong.space')
OUT = 'classics_markdown'
MARK = '🔗 经典连线'

# id -> [(related_id, 关系标签), ...]
MAP = {
 'qifo': [('tanjing','法脉之源'), ('xinxinming','祖师偈颂'), ('zhengdaoge','印心长歌')],
 'juelin': [('yuanjuejing','顿悟经典'), ('lengyanjing','大乘经群'), ('wanshantongguiji','华严禅用')],
 'wenshu': [('jingangjing','般若同源'), ('xinjing','般若心要'), ('tanjing','般若品脉')],
 'wuran': [('zhangzhi','莲师直指'), ('jingangge','大圆满歌'), ('ziwojietuo','直指深法'), ('henghedashouyin','大手印对读')],
 'zhangzhi': [('wuran','无染同源'), ('songlingbaoxun','莲师宝训'), ('ziwojietuo','直指深法')],
 'xuemaicong': [('sixingguan','达摩四行'), ('wuxinglun','达摩论上'), ('tanjing','曹溪承之')],
 'wuxinglun': [('xuemaicong','血脉同源'), ('poxianglun','达摩论'), ('wuxinlun','无心一脉')],
 'poxianglun': [('xuemaicong','血脉同源'), ('wuxinglun','达摩论'), ('xixulun','息许相承')],
 'wuxinlun': [('wuxinglun','达摩论'), ('jueguanlun','绝观同旨'), ('xuemaicong','血脉同源')],
 'xixulun': [('poxianglun','破相承之'), ('wuxinlun','无心相承'), ('xuemaicong','血脉同源')],
 'sixingguan': [('anxin','四行安心'), ('xuemaicong','血脉同源'), ('zuishangcheng','东山续灯')],
 'xinxinming': [('xinming','双铭对读'), ('zhengdaoge','铭歌相映'), ('tanjing','曹溪承之')],
 'fangcunlun': [('xinxinming','信心同调'), ('tanjing','曹溪承之'), ('sixingguan','达摩四行')],
 'anxin': [('sixingguan','四行承之'), ('zuishangcheng','东山相承'), ('tanjing','曹溪开山')],
 'zuishangcheng': [('anxin','东山相承'), ('tanjing','曹溪承之'), ('xiuxinjue','修心同参')],
 'tanjing': [('zhengdaoge','曹溪同门'), ('jingangjing','般若印心'), ('dunwu','顿悟同调'), ('xinxinming','铭颂相映')],
 'zhengdaoge': [('yongjia','禅集同源'), ('tanjing','曹溪同门'), ('xinxinming','铭歌相映')],
 'mazu': [('baizhang','嗣法百丈'), ('linji','洪州下临济'), ('zhaozhouyulu','再传赵州')],
 'baizhang': [('mazu','嗣法马祖'), ('huangbo','再传黄檗'), ('chixiu-baizhang-qinggui','清规本源'), ('chanyuanqinggui','清规续脉')],
 'huangbo': [('huangbo_wanlinglu','宛陵上下'), ('linji','嗣法临济'), ('baizhang','受印百丈')],
 'xiuxinjue': [('zhenxin','海东双璧'), ('tanjing','曹溪为宗'), ('yuanjuejing','圆觉为据')],
 'linji': [('huangbo','受印黄檗'), ('mazu','洪州远源'), ('renyantianmu','宗风总览'), ('zhaozhouyulu','同期并世')],
 'dunwu': [('tanjing','曹溪同调'), ('mazu','洪州门下'), ('xinwangming','心王同参')],
 'zhenxin': [('xiuxinjue','海东双璧'), ('lengyanjing','楞严为据'), ('tanjing','曹溪为宗')],
 'zhigong': [('xinwangming','双圣并世'), ('tanjing','曹溪先声'), ('jingangjing','般若为底')],
 'xinwangming': [('zhigong','双圣并世'), ('dunwu','心王同参'), ('tanjing','曹溪先声')],
 'shenhui': [('tanjing','曹溪门下'), ('xinxinming','南顿同调'), ('zhengdaoge','顿悟相承')],
 'jingangjing': [('xinjing','般若心要'), ('wenshu','般若同源'), ('tanjing','曹溪印心')],
 'xinjing': [('jingangjing','般若同源'), ('wenshu','般若同源'), ('tanjing','曹溪印心')],
 'yuanjuejing': [('lengyanjing','经群双璧'), ('xiuxinjue','知讷所据'), ('juelin','华严同调')],
 'chanlinbaoxun': [('changuancejin','警策双璧'), ('chanjia_guijian','龟鉴同参'), ('boshan-canchanjingyu','明末同调')],
 'lengyanjing': [('yuanjuejing','经群双璧'), ('xiuxinjue','知讷所据'), ('zhenxin','海东所本')],
 'weimojiejing': [('tanjing','不二法门'), ('zhaolun','肇注维摩'), ('xinjing','般若同调')],
 'shiniutu': [('baojingsanmei','曹洞纲要'), ('dongshanyulu','曹洞本源'), ('changuancejin','工夫次第'), ('zuochanyi','坐禅仪轨')],
 'baojingsanmei': [('dongshanyulu','洞山亲唱'), ('caoshanyulu','曹山承之'), ('renyantianmu','宗风总览'), ('shiniutu','牧牛次第')],
 'dongshanyulu': [('caoshanyulu','曹山唱和'), ('baojingsanmei','五位纲要'), ('rujingyulu','洞上中兴'), ('shiniutu','牧牛次第')],
 'yunmen': [('xuefengyulu','嗣法雪峰'), ('wumenguan','公案渊薮'), ('renyantianmu','宗风总览')],
 'bashiguijusong': [('weishisanshilunsong','唯识颂本'), ('weishiershilun','唯识破执'), ('baifamingmenlun','百法名目'), ('lengyanjing','八识经据')],
 'wumenguan': [('biyanlu','公案双璧'), ('zhaozhouyulu','狗子出处'), ('renyantianmu','宗风总览')],
 'changuancejin': [('chanlinbaoxun','警策双璧'), ('boshan-canchanjingyu','明末同调'), ('gaofengyulu','辑高峰语'), ('shiniutu','工夫次第')],
 'dachengqixinlun': [('chanyuan_zhuquanjiduxu','禅教会通'), ('zhaolun','义理相承'), ('weishisanshilunsong','唯识对照'), ('lengqiejing','如来藏通')],
 'huanwuxinyao': [('huanwuyulu','圆悟两书'), ('foguojijielu','圆悟三部'), ('dahuiyulu','嗣法大慧')],
 'huanwuyulu': [('huanwuxinyao','心要并举'), ('foguojijielu','击节同源'), ('dahuiyulu','嗣法大慧'), ('fayanyulu','受印法演')],
 'dahuiyulu': [('huanwuyulu','受印圆悟'), ('biyanlu','烧书因缘'), ('wumenguan','话头同参'), ('mianxianyulu','再传密庵')],
 'chanjia_guijian': [('xiuxinjue','修心同参'), ('changuancejin','警策同调'), ('chanlinbaoxun','宝训同风')],
 'xinming': [('xinxinming','双铭对读'), ('jueguanlun','法融同著'), ('anxin','牛头渊源')],
 'zuochanyi': [('chanyuanqinggui','宗赜同著'), ('shiniutu','工夫次第'), ('changuancejin','警策所收')],
 'huangbo_wanlinglu': [('huangbo','传心上下'), ('linji','临济记之'), ('mazu','洪州远源')],
 'zhaozhouyulu': [('wumenguan','无门多举'), ('biyanlu','碧岩多举'), ('linji','同期并世')],
 'jueguanlun': [('xinming','法融同著'), ('wuxinlun','无心同旨'), ('anxin','牛头渊源')],
 'boshan-canchanjingyu': [('changuancejin','警策同调'), ('caoshanyulu','曹洞本宗'), ('chanlinbaoxun','宝训同风')],
 'caoshanyulu': [('dongshanyulu','洞山唱和'), ('baojingsanmei','五位纲要'), ('boshan-canchanjingyu','洞上后劲')],
 'fayanyulu': [('yangqiyulu','杨岐法乳'), ('huanwuyulu','嗣法圆悟'), ('dahuiyulu','大慧远源')],
 'zhonglun': [('zhaolun','僧肇承之'), ('jingangjing','般若同源'), ('dachengqixinlun','起信对照')],
 'wanshantongguiji': [('chanyuan_zhuquanjiduxu','禅教一致'), ('juelin','华严同调'), ('lengyanjing','永明所重')],
 'chanyuan_zhuquanjiduxu': [('wanshantongguiji','永平互映'), ('yuanjuejing','宗密所疏'), ('dachengqixinlun','起信为纲')],
 'biyanlu': [('wumenguan','公案双璧'), ('huanwuyulu','圆悟语录'), ('foguojijielu','圆悟三部'), ('dahuiyulu','大慧烧书')],
 'yangqihoulu': [('yangqiyulu','杨岐上下'), ('fayanyulu','法演承之'), ('dahuiyulu','大慧远源')],
 'linjianhoulu': [('linjianlu','林间前后'), ('chanzongjueyiji','决疑同参'), ('chanlinbaoxun','宝训同风')],
 'shanglibian': [('shangzhibian','尚直尚理'), ('linjianlu','笔记同体'), ('chanzongjueyiji','决疑同参')],
 'yangqiyulu': [('yangqihoulu','杨岐上下'), ('shishuangchuyuan','嗣法石霜'), ('fayanyulu','三传法演'), ('linji','临济远源')],
 'chanzongjueyiji': [('changuancejin','警策同调'), ('chanlinbaoxun','宝训同风'), ('linjianhoulu','林间同参')],
 'huanglonghuinan': [('shishuangchuyuan','嗣法石霜'), ('linji','黄龙溯源'), ('renyantianmu','宗风总览')],
 'zhaolun': [('zhonglun','龙树承之'), ('weimojiejing','肇注维摩'), ('dachengqixinlun','义理相承')],
 'shangzhibian': [('shanglibian','尚直尚理'), ('linjianlu','笔记同体'), ('zibaibieji','明代同调')],
 'shishuangchuyuan': [('huanglonghuinan','慧南受印'), ('yangqiyulu','方会同门'), ('linji','临济远源')],
 'xuanshayulu': [('xuanshaguanglu','玄沙两录'), ('xuefengyulu','嗣法雪峰'), ('renyantianmu','宗风总览')],
 'xuanshaguanglu': [('xuanshayulu','玄沙两录'), ('xuefengyulu','雪峰本师'), ('linjianlu','笔记所载')],
 'gaofengyulu': [('changuancejin','策进所收'), ('mianxianyulu','元初同调'), ('dahuiyulu','话头家法')],
 'xuefengyulu': [('xuanshayulu','玄沙承之'), ('xuanshaguanglu','玄沙广录'), ('yunmen','云门本师')],
 'foguojijielu': [('huanwuyulu','圆悟语录'), ('biyanlu','碧岩同师'), ('huanwuxinyao','圆悟三部')],
 'mianxianyulu': [('dahuiyulu','大慧再传'), ('gaofengyulu','元初同调'), ('linji','临济家风')],
 'zibaibieji': [('changuancejin','策进所收'), ('boshan-canchanjingyu','明末同调'), ('shangzhibian','尚直同代')],
 'renyantianmu': [('linji','临济宗风'), ('yunmen','云门宗风'), ('baojingsanmei','曹洞宗风'), ('huanglonghuinan','黄龙宗风')],
 'linjianlu': [('linjianhoulu','林间前后'), ('yunmen','云门掌故'), ('chanzongjueyiji','决疑同参')],
 'lengqiejing': [('tanjing','楞伽印心'), ('dachengqixinlun','如来藏通'), ('lengyanjing','经群双璧')],
 'chanyuanqinggui': [('chixiu-baizhang-qinggui','清规承前'), ('zuochanyi','宗赜同著'), ('baizhang','百丈遗风')],
 'chixiu-baizhang-qinggui': [('chanyuanqinggui','清规启后'), ('baizhang','清规之祖'), ('zuochanyi','坐禅同轨')],
 'jingangge': [('wuran','无染同源'), ('ziwojietuo','直指同源'), ('henghedashouyin','手印对读')],
 'ziwojietuo': [('jingangge','金刚同源'), ('wuran','无染同源'), ('songlingbaoxun','松岭同源')],
 'songlingbaoxun': [('ziwojietuo','直指同源'), ('zhangzhi','杖指同源'), ('xizangduwangjing','度亡相承')],
 'xizangduwangjing': [('songlingbaoxun','松岭相承'), ('jingangge','金刚同源'), ('xinxingxiuxisong','心性休息')],
 'xinxingxiuxisong': [('henghedashouyin','手印对读'), ('jingangge','金刚同源'), ('ziwojietuo','直指同源')],
 'henghedashouyin': [('xinxingxiuxisong','心性对读'), ('jingangge','金刚同源'), ('wuran','无染同源')],
 'zixingcanjiu': [('henghedashouyin','手印对读'), ('wumenguan','话头同参'), ('awatuotazhige','非二同调')],
 'awatuotazhige': [('ashitawakela','非二双璧'), ('zixingcanjiu','参究同调'), ('zhonglun','中观非二')],
 'ashitawakela': [('awatuotazhige','非二双璧'), ('zixingcanjiu','参究同调'), ('zhonglun','中观非二')],
 'baifamingmenlun': [('weishisanshilunsong','唯识颂本'), ('weishiershilun','唯识破执'), ('bashiguijusong','八识总揽')],
 'weishisanshilunsong': [('weishiershilun','唯识破执'), ('baifamingmenlun','百法名目'), ('bashiguijusong','八识总揽')],
 'weishiershilun': [('weishisanshilunsong','唯识立宗'), ('baifamingmenlun','百法名目'), ('bashiguijusong','八识总揽')],
 'rujingyulu': [('rujingxuyulu','续录合璧'), ('dongshanyulu','曹洞本源'), ('caoshanyulu','曹山家风'), ('renyantianmu','宗风总览')],
 'rujingxuyulu': [('rujingyulu','六会全录'), ('dongshanyulu','曹山拈提'), ('caoshanyulu','曹山渊源'), ('baojingsanmei','五位纲要')],
 'weishanyulu': [('renyantianmu','沩仰宗风'), ('wumenguan','公案渊薮'), ('linjianlu','沩仰掌故')],
 'chengyelun': [('weishisanshilunsong','唯识颂本'), ('baifamingmenlun','百法名目'), ('zhonglun','观业对照'), ('dachengqixinlun','业感所依')],
 'bianzhongbianlun': [('weishisanshilunsong','唯识颂本'), ('baifamingmenlun','百法名目'), ('chengyelun','业论姊妹'), ('dachengqixinlun','中道相承')],
 'qiaoyinyulu': [('xuefengyulu','再住雪峰道场'), ('linji','临济家法'), ('gaofengyulu','元代同调')],
 'shoulengyansanmeijing': [('jingangjing','无住同旨'), ('yuanjuejing','三昧经群'), ('wenshu','文殊主法')],
 'shedachenglunben': [('weishisanshilunsong','唯识颂本'), ('bianzhongbianlun','三性相承'), ('jieshenmijing','赖耶经据'), ('dachengqixinlun','赖耶缘起'), ('chengyelun','业论同门')],
 'huanzhu-anqinggui': [('gaofengyulu','高峰法嗣'), ('chanyuanqinggui','清规承前'), ('chixiu-baizhang-qinggui','清规对照'), ('changuancejin','警策同参')],
 'jieshenmijing': [('shedachenglunben','论释此经'), ('bianzhongbianlun','三性相承'), ('weishisanshilunsong','唯识颂本'), ('lengqiejing','如来藏会通')],
 'miyanjing': [('shedachenglunben','赖耶同源'), ('lengqiejing','印心姊妹'), ('jieshenmijing','赖耶经据'), ('dachengqixinlun','如来藏通')],
}

def main():
    manifest = json.load(open('manifest.json', encoding='utf-8'))
    by_id = {m['id']: m for m in manifest}
    missing = [i for i in MAP if i not in by_id]
    if missing:
        raise SystemExit('MAP 含未知 id: ' + ', '.join(missing))
    # 校验关联目标都存在
    for k, links in MAP.items():
        for rid, _ in links:
            if rid not in by_id:
                raise SystemExit(f'{k} 指向不存在的 {rid}')

    updated = skipped = 0
    for m in manifest:
        path = os.path.join(OUT, m['filename'])
        text = open(path, encoding='utf-8').read()
        if MARK in text:
            skipped += 1
            continue
        links = MAP.get(m['id'])
        if not links:
            print('!! 无映射:', m['id'])
            continue
        line = MARK + '：' + ' · '.join(
            f"[{by_id[rid]['title']}](/classics/{rid})（{tag}）" for rid, tag in links)
        lines = text.split('\n')
        # 找 meta 行（> **作者**），前 8 行内；否则插在 H1 后
        insert_at = None
        for i in range(min(8, len(lines))):
            if lines[i].startswith('> **作者**'):
                insert_at = i + 1
                break
        if insert_at is None:
            for i in range(min(4, len(lines))):
                if lines[i].startswith('# '):
                    insert_at = i + 1
                    break
        assert insert_at is not None, m['filename']
        lines.insert(insert_at, '')
        lines.insert(insert_at + 1, line)
        open(path, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
        updated += 1
    print(f'写入连线 {updated} 部 | 已有跳过 {skipped} 部')

if __name__ == '__main__':
    main()
