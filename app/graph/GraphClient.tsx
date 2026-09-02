'use client';

import React, { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  GitFork, 
  BookOpen, 
  Sparkles, 
  Users, 
  HelpCircle, 
  Compass, 
  Layers,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { SearchModal } from '@/components/SearchModal';
import manifest from '@/manifest.json';
import { STATS } from '@/lib/stats';
import { ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS, ZEN_CONCEPTS } from '@/lib/taxonomy';
import { useLang } from '@/context/LangContext';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumb } from '@/components/Breadcrumb';

const GraphCanvas = lazy(() => import('@/components/GraphCanvas').then(m => ({ default: m.GraphCanvas })));

/* 五家七宗法脉数据体系 */
const ZEN_LINEAGES = [
  {
    id: 'early-patriarchs',
    name: '东土初祖至六祖（祖印心传）',
    badge: '达摩至曹溪',
    color: 'amber',
    bgClass: 'bg-amber-50/80 border-amber-200 text-amber-900',
    titleClass: 'text-amber-900',
    summary: '菩提达摩航海东来，单传心印，直指人心见性成佛。经慧可断臂求法、僧璨不二信心、道信安居安心、弘忍守本真心，至六祖惠能开大乘顿教法门，一花开五叶，结果自然成。',
    masters: [
      { id: 'bodhidharma', name: '菩提达摩', title: '东土初祖' },
      { id: 'huike', name: '二祖慧可', title: '求法安心' },
      { id: 'sengcan', name: '三祖僧璨', title: '信心铭' },
      { id: 'daoxin', name: '四祖道信', title: '入道安心' },
      { id: 'hongren', name: '五祖弘忍', title: '东山法门' },
      { id: 'huineng', name: '六祖惠能', title: '自性顿悟' }
    ],
    classics: [
      { id: 'xuemaicong', title: '血脉论' },
      { id: 'wuxinglun', title: '悟性论' },
      { id: 'xinxinming', title: '信心铭' },
      { id: 'anxin', title: '安心要方便法门' },
      { id: 'zuishangcheng', title: '最上乘论' },
      { id: 'tanjing', title: '六祖坛经' }
    ],
    methods: ['观心法门', '二入四行', '一行三昧', '守本真心', '无念为宗'],
    koans: ['达摩少林面壁', '慧可断臂安心', '惠能呈偈菩提本无树', '不思善不思恶']
  },
  {
    id: 'linji-sect',
    name: '临济宗（棒喝交驰·正眼流通）',
    badge: '天下临济',
    color: 'blue',
    bgClass: 'bg-blue-50/80 border-blue-200 text-blue-900',
    titleClass: 'text-blue-900',
    summary: '临济义玄承黄檗希运、百丈怀海法脉，宗风以机锋迅捷、棒喝交加、全机大用著称。“赤肉团上有一无位真人，常向汝等诸人面门出入”，立四料拣、三玄三要、四宾主接引学人。',
    masters: [
      { id: 'linji', name: '临济义玄', title: '开山宗师' },
      { id: 'huangbo', name: '黄檗希运', title: '临济之师' },
      { id: 'shishuangchuyuan', name: '石霜楚圆', title: '慈明宗师' },
      { id: 'yangqifanghui', name: '杨岐方会', title: '杨岐派开祖' },
      { id: 'huanglonghuinan', name: '黄龙慧南', title: '黄龙派开祖' }
    ],
    classics: [
      { id: 'linji', title: '临济录' },
      { id: 'huangbo', title: '传心法要' },
      { id: 'huangbo_wanlinglu', title: '黄檗宛陵录' },
      { id: 'shishuangchuyuan', title: '石霜楚圆语录' }
    ],
    methods: ['棒喝接引', '无位真人', '四料拣', '三玄三要', '四宾主'],
    koans: ['临济三度被打', '定上座立地承当', '临济一喝耳聋三日', '无位真人']
  },
  {
    id: 'caodong-sect',
    name: '曹洞宗（偏正回互·绵密细腻）',
    badge: '默照回互',
    color: 'emerald',
    bgClass: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
    titleClass: 'text-emerald-900',
    summary: '洞山良价与曹山本寂开创，承石头希迁、药山惟俨法脉。以偏正回互为宗，立五位君臣、宝镜三昧、三种渗漏。宗风绵密稳健，主张“动静不二、体用相即”，后由宏智正觉发扬为“默照禅”。',
    masters: [
      { id: 'dongshan', name: '洞山良价', title: '开山宗师' },
      { id: 'caoshan', name: '曹山本寂', title: '二祖宏纲' },
      { id: 'hongzhi', name: '宏智正觉', title: '默照大成' },
      { id: 'boshan', name: '博山元来', title: '警语提撕' }
    ],
    classics: [
      { id: 'baojingsanmei', title: '宝镜三昧歌' },
      { id: 'dongshanyulu', title: '洞山良价语录' },
      { id: 'caoshanyulu', title: '曹山本寂语录' },
      { id: 'boshan-canchanjingyu', title: '博山参禅警语' }
    ],
    methods: ['默照禅', '五位君臣', '偏正回互', '宝镜三昧', '三种渗漏'],
    koans: ['洞山麻三斤', '洞山过水睹影', '曹山枯木龙吟', '洞山寒暑回避']
  },
  {
    id: 'weiyang-sect',
    name: '沩仰宗（方圆默契·父子相承）',
    badge: '圆相心印',
    color: 'indigo',
    bgClass: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
    titleClass: 'text-indigo-900',
    summary: '沩山灵佑与仰山慧寂师徒共创，为五家宗门中最早建立者。以九十六圆相、三种生、三种堕接人。宗风温和平实而深邃，父子同心、机用默契，“藏机于日用，隐用显体”。',
    masters: [
      { id: 'weishan', name: '沩山灵佑', title: '沩仰宗开山' },
      { id: 'yangshan', name: '仰山慧寂', title: '仰山小释迦' },
      { id: 'xiangyan', name: '香严智闲', title: '击竹悟道' }
    ],
    classics: [
      { id: 'renyantianmu', title: '人天眼目·沩仰门庭' }
    ],
    methods: ['九十六圆相', '父子机用', '三种生', '画圆示意'],
    koans: ['沩山踢翻净瓶', '香严一击忘所知', '仰山插锹立地', '仰山画圆相']
  },
  {
    id: 'yunmen-sect',
    name: '云门宗（函盖截断·孤危耸拔）',
    badge: '云门三句',
    color: 'purple',
    bgClass: 'bg-purple-50/80 border-purple-200 text-purple-900',
    titleClass: 'text-purple-900',
    summary: '云门文偃承雪峰义存法脉所创。宗风险绝迅烈，以“云门三句”（函盖乾坤、截断众流、随波逐浪）与“一字关”接人。“一言才举，千差同辙”，令学者不假思量当下断惑。',
    masters: [
      { id: 'yunmen', name: '云门文偃', title: '云门开山' },
      { id: 'baling', name: '巴陵颢鉴', title: '银碗盛雪' },
      { id: 'xuedou', name: '雪窦重显', title: '颂古宗师' }
    ],
    classics: [
      { id: 'yunmen', title: '云门匡真禅师广录' },
      { id: 'biyanlu', title: '碧岩录（雪窦颂古）' }
    ],
    methods: ['云门三句', '一字关', '函盖乾坤', '截断众流', '金屑翳眼'],
    koans: ['云门日日是好日', '云门糊饼', '云门体露金风', '巴陵银碗盛雪']
  },
  {
    id: 'fayan-sect',
    name: '法眼宗（即心即物·六相圆融）',
    badge: '六相圆融',
    color: 'rose',
    bgClass: 'bg-rose-50/80 border-rose-200 text-rose-900',
    titleClass: 'text-rose-900',
    summary: '清凉文益承罗汉桂琛、玄沙师备法脉所创。宗风平实圆融，融摄华严六相义（总别同异成坏）与唯识唯心义理。“不著相、不离相，即物明心”，后由永明延寿汇归禅净万善。',
    masters: [
      { id: 'xuansha', name: '玄沙师备', title: '法眼先导' },
      { id: 'luohan', name: '罗汉桂琛', title: '不知最亲' },
      { id: 'fayan', name: '法眼文益', title: '法眼宗主' },
      { id: 'yongming', name: '永明延寿', title: '万善同归' }
    ],
    classics: [
      { id: 'xuanshayulu', title: '玄沙师备语录' },
      { id: 'xuanshaguanglu', title: '玄沙师备广录' },
      { id: 'wanshantongguiji', title: '万善同归集' }
    ],
    methods: ['华严六相义', '唯心现量', '秘密金刚体', '不知最亲', '万善同归'],
    koans: ['法眼汝是慧超', '罗汉桂琛不知最亲', '玄沙一颗明珠', '玄沙三种病人']
  },
  {
    id: 'yangqi-branch',
    name: '临济宗杨岐派（大机大用·看话之源）',
    badge: '看话禅主峰',
    color: 'sky',
    bgClass: 'bg-sky-50/80 border-sky-200 text-sky-900',
    titleClass: 'text-sky-900',
    summary: '杨岐方会开创，经白云守端、五祖法演，至圆悟克勤、大慧宗杲集大成。大慧宗杲极力倡导“看话禅”，以无字话头起大疑情，扫荡文字知解，成为南宋以降中国与日本禅宗第一主流。',
    masters: [
      { id: 'yangqifanghui', name: '杨岐方会', title: '杨岐开派' },
      { id: 'wuzufayan', name: '五祖法演', title: '白云万里' },
      { id: 'yuanwukeqin', name: '圆悟克勤', title: '碧岩评唱' },
      { id: 'dahuizonggao', name: '大慧宗杲', title: '看话大成' },
      { id: 'mianxian', name: '密庵咸杰', title: '虎丘正脉' }
    ],
    classics: [
      { id: 'yangqiyulu', title: '杨岐方会语录' },
      { id: 'fayanyulu', title: '五祖法演语录' },
      { id: 'biyanlu', title: '碧岩录' },
      { id: 'huanwuyulu', title: '圆悟语录' },
      { id: 'huanwuxinyao', title: '圆悟心要' },
      { id: 'dahuiyulu', title: '大慧语录' },
      { id: 'foguojijielu', title: '击节录' }
    ],
    methods: ['看话禅', '参无字话头', '大疑大悟', '参话十病', '栗棘蓬金刚圈'],
    koans: ['赵州狗子无佛性', '五祖法演倩女离魂', '杨岐三脚驴', '密庵破沙盆']
  },
  {
    id: 'huanglong-branch',
    name: '临济宗黄龙派（三关勘验·气象沉雄）',
    badge: '黄龙三关',
    color: 'teal',
    bgClass: 'bg-teal-50/80 border-teal-200 text-teal-900',
    titleClass: 'text-teal-900',
    summary: '黄龙慧南开创，以“黄龙三关”（生缘处、佛手、驴脚）勘验四方学人，门风沉雄严肃。座下出晦堂祖心、死心悟新、灵源惟清等尊宿，宋代士大夫如黄庭坚、苏轼皆深受其化。',
    masters: [
      { id: 'huanglonghuinan', name: '黄龙慧南', title: '黄龙开派' },
      { id: 'huitangzuxin', name: '晦堂祖心', title: '木樨香开悟' },
      { id: 'sixinwuxin', name: '死心悟新', title: '岁寒节操' }
    ],
    classics: [
      { id: 'huanglonghuinan', title: '黄龙慧南语录' },
      { id: 'chanlinbaoxun', title: '禅林宝训' }
    ],
    methods: ['黄龙三关', '丛林规训', '棒喝勘验', '道人岁寒操守'],
    koans: ['黄龙生缘佛手驴脚', '晦堂指黄庭坚木樨香', '黄龙问吕洞宾']
  }
];

/* 经典 7 大义理专题分类 */
const THEMATIC_CLASSICS = [
  {
    id: 'theme-sutras',
    title: '印心佛经圣典（般若与了义经群）',
    count: 7,
    color: 'text-amber-800 bg-amber-50 border-amber-200',
    summary: '达摩印心之《楞伽》、六祖悟道之《金刚》、观心了义之《楞严》《圆觉》《维摩诘》，为禅宗超越名相、直达无生的根本圣典。',
    bookIds: ['jingangjing', 'xinjing', 'lengyanjing', 'weimojiejing', 'yuanjuejing', 'lengqiejing', 'wenshu']
  },
  {
    id: 'theme-patriarch-treatises',
    title: '达摩心印与早期祖师宗论',
    count: 12,
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    summary: '菩提达摩四论、僧璨信心铭、道信安心法门、弘忍最上乘论及牛头心铭绝观论，确立了东土禅法即心即佛的见地根基。',
    bookIds: ['xuemaicong', 'wuxinglun', 'poxianglun', 'wuxinlun', 'xixulun', 'sixingguan', 'xinxinming', 'anxin', 'zuishangcheng', 'xinming', 'jueguanlun', 'fangcunlun']
  },
  {
    id: 'theme-caoxi-hongzhou',
    title: '曹溪法宝与洪州大机语录',
    count: 8,
    color: 'text-blue-800 bg-blue-50 border-blue-200',
    summary: '六祖坛经顿悟心法，马祖道一即心即佛、百丈立清规、黄檗传心法要与大珠顿悟要门，开创江左洪州气吞诸方之盛况。',
    bookIds: ['tanjing', 'shenhui', 'mazu', 'baizhang', 'huangbo', 'huangbo_wanlinglu', 'dunwu', 'zhengdaoge']
  },
  {
    id: 'theme-five-houses-records',
    title: '五家宗门法宝与语录宝典',
    count: 11,
    color: 'text-purple-800 bg-purple-50 border-purple-200',
    summary: '临济录、洞山曹山语录、云门广录、赵州录、雪峰玄沙语录与石霜慈明录，集中展示唐末五代五家七宗百花齐放的机用与纲宗。',
    bookIds: ['linji', 'dongshanyulu', 'caoshanyulu', 'baojingsanmei', 'yunmen', 'zhaozhouyulu', 'xuefengyulu', 'xuanshayulu', 'xuanshaguanglu', 'yangqiyulu', 'shishuangchuyuan']
  },
  {
    id: 'theme-koan-commentaries',
    title: '宋元看话公案与评唱双璧',
    count: 9,
    color: 'text-rose-800 bg-rose-50 border-rose-200',
    summary: '无门关四十八则、碧岩录百则评唱、佛果击节录、大慧普觉语录与高峰原妙语录，代表了看话禅与文字禅鼎盛时期的巅峰之作。',
    bookIds: ['wumenguan', 'biyanlu', 'foguojijielu', 'fayanyulu', 'huanwuyulu', 'huanwuxinyao', 'dahuiyulu', 'gaofengyulu', 'mianxianyulu']
  },
  {
    id: 'theme-monastic-regulations',
    title: '禅林清规轨度与行持警策',
    count: 8,
    color: 'text-sky-800 bg-sky-50 border-sky-200',
    summary: '禅苑清规、敕修百丈清规、禅林宝训、禅关策进、人天眼目、博山参禅警语与坐禅仪，为禅门丛林制度与行者修持提供千载规矩。',
    bookIds: ['chanyuanqinggui', 'chixiu-baizhang-qinggui', 'chanlinbaoxun', 'changuancejin', 'renyantianmu', 'chanjia_guijian', 'boshan-canchanjingyu', 'zuochanyi']
  },
  {
    id: 'theme-doctrinal-unification',
    title: '教禅一致与融通诸宗论著',
    count: 11,
    color: 'text-teal-800 bg-teal-50 border-teal-200',
    summary: '大乘起信论、中论、肇论、八识规矩颂、禅源都序、万善同归集与尚直尚理编，融合中观、唯识、华严、天台与净土，阐明教禅圆融不二。',
    bookIds: ['dachengqixinlun', 'zhonglun', 'zhaolun', 'bashiguijusong', 'chanyuan_zhuquanjiduxu', 'wanshantongguiji', 'shangzhibian', 'shanglibian', 'zibaibieji', 'linjianlu', 'linjianhoulu']
  }
];

/* 修学阶梯与法门系统体系 */
const ZEN_PRACTICE_PATHS = [
  {
    id: 'path-1',
    step: '第一阶',
    title: '理入安适 · 初机摄心',
    summary: '以正见安顿身心，破除散乱，收摄六根，为实修奠定深厚基石。',
    methods: ['二入四行', '一行三昧', '守本真心', '观心法门', '坐禅调息', '都摄六根'],
    classics: ['菩提达摩大师入道四行观', '最上乘论', '入道安心要方便法门', '坐禅仪']
  },
  {
    id: 'path-2',
    step: '第二阶',
    title: '顿悟见性 · 单刀直入',
    summary: '回光返照，识自本心，见自本性，一念相应即是佛，直截截断葛藤知见。',
    methods: ['直指人心', '棒喝接引', '无念无相无住', '反闻闻自性', '即心即佛', '非心非佛'],
    classics: ['六祖坛经', '达摩血脉论', '永嘉证道歌', '黄檗传心法要', '镇州临济慧照禅师语录']
  },
  {
    id: 'path-3',
    step: '第三阶',
    title: '看话参究 · 爆破疑情',
    summary: '单提一则无字话头，堵绝意根思量，起大疑情逼拶至山穷水尽，桶底脱落。',
    methods: ['看话禅', '参无字话头', '大疑情逼拶', '金刚圈栗棘蓬', '看话头十病对治'],
    classics: ['禅宗无门关', '大慧普觉禅师语录', '佛果圜悟禅师碧岩录', '高峰原妙禅师语录', '博山参禅警语']
  },
  {
    id: 'path-4',
    step: '第四阶',
    title: '默照凝神 · 体用回互',
    summary: '惺惺寂寂，默然照察，不落枯木死灰，偏正回互，在动静之中圆照法界。',
    methods: ['默照禅', '偏正回互', '宝镜三昧', '五位君臣', '六相圆融', '云门三句'],
    classics: ['宝镜三昧歌', '洞山良价禅师语录', '人天眼目', '抚州曹山本寂禅师语录']
  },
  {
    id: 'path-5',
    step: '第五阶',
    title: '理事圆融 · 保任入世',
    summary: '绝后复苏，垂手入廛，运水搬柴无非妙道，万善齐修，庄严无上清净佛土。',
    methods: ['十牛图归源入廛', '一日不作一日不食', '丛林清规共住', '禅净双修', '万善同归'],
    classics: ['十牛图颂', '禅苑清规', '敕修百丈清规', '万善同归集', '禅林宝训']
  }
];

export default function GraphClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [lineageOpen, setLineageOpen] = useState<Record<string, boolean>>({ 'early-patriarchs': true, 'linji-sect': true });
  const [themeOpen, setThemeOpen] = useState<Record<string, boolean>>({ 'theme-sutras': true, 'theme-koan-commentaries': true });
  const [pathOpen, setPathOpen] = useState<Record<string, boolean>>({ 'path-1': true, 'path-2': true, 'path-3': true });
  const [entityOpen, setEntityOpen] = useState<Record<string, boolean>>({ classics: true, concepts: false });
  const { t } = useLang();

  const toggleLineage = (key: string) => setLineageOpen(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleTheme = (key: string) => setThemeOpen(prev => ({ ...prev, [key]: !prev[key] }));
  const togglePath = (key: string) => setPathOpen(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleEntity = (key: string) => setEntityOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const bookMap = new Map(manifest.map(b => [b.id, b]));

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-slate-900 font-sans">
      <Sidebar onOpenSearch={() => setSearchOpen(true)} classicsCount={manifest.length} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />

        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8 md:px-8 md:py-12 space-y-16">
          <Breadcrumb items={[{ label: '知识图谱' }]} />

          {/* 页面主标题区 */}
          <div className="border-b border-slate-200/80 pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3.5 py-1 bg-amber-100/90 text-amber-900 rounded-full text-xs font-bold tracking-wider border border-amber-300/60 shadow-xs font-serif-zen">
                {t('全息交互知识网络')}
              </span>
              <span className="text-xs text-slate-500 font-serif-zen">
                全站网状知识体系总览
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif-zen text-slate-900">
              {t('禅宗知识图谱与全景体系')}
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-3 max-w-4xl leading-relaxed">
              {t('全站核心知识凝聚为一朵八瓣金莲：悬停节点查看关联线与语义，单击直达详情研读页，节点可拖拽弹性归位。下方手风琴体系汇聚五家七宗法脉、修证梯次、经典专题与核心知识实体。')}
            </p>

            {/* 核心数据徽章条 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
              <div className="bg-white/80 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-900">{STATS.classics} <span className="text-xs font-normal text-slate-500">部</span></div>
                  <div className="text-xs text-slate-500 font-medium">经典著作</div>
                </div>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-900">{STATS.concepts} <span className="text-xs font-normal text-slate-500">个</span></div>
                  <div className="text-xs text-slate-500 font-medium">核心概念</div>
                </div>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <Compass className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-900">{STATS.methods} <span className="text-xs font-normal text-slate-500">个</span></div>
                  <div className="text-xs text-slate-500 font-medium">修持法门</div>
                </div>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <Flame className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-900">{STATS.koans} <span className="text-xs font-normal text-slate-500">则</span></div>
                  <div className="text-xs text-slate-500 font-medium">公案机锋</div>
                </div>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-900">{STATS.persons} <span className="text-xs font-normal text-slate-500">位</span></div>
                  <div className="text-xs text-slate-500 font-medium">历代祖师</div>
                </div>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-900">{STATS.faqs} <span className="text-xs font-normal text-slate-500">条</span></div>
                  <div className="text-xs text-slate-500 font-medium">义理问答</div>
                </div>
              </div>
            </div>
          </div>

          {/* D3 Force Graph Canvas 八瓣金莲 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif-zen text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                八瓣金莲力导向知识图谱
              </h2>
              <span className="text-xs text-slate-500">支持缩放、拖拽与高亮溯源</span>
            </div>
            <Suspense fallback={<div className="h-[750px] bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400">正在生成知识网络金莲图谱…</div>}>
              <GraphCanvas />
            </Suspense>
          </section>

          {/* 板块一：五家七宗法脉源流手风琴 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold font-serif-zen text-slate-900 flex items-center gap-2.5">
                  <GitFork className="w-6 h-6 text-amber-700" />
                  五家七宗法脉源流手风琴
                </h2>
                <p className="text-sm text-slate-500 mt-1">从东土初祖达摩至曹溪六祖，分流为临济、曹洞、沩仰、云门、法眼五家及杨岐、黄龙二派的全景谱系与宗门心印。</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const allOpen = Object.keys(lineageOpen).length === ZEN_LINEAGES.length && Object.values(lineageOpen).every(Boolean);
                    const next: Record<string, boolean> = {};
                    ZEN_LINEAGES.forEach(l => { next[l.id] = !allOpen; });
                    setLineageOpen(next);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition shadow-sm"
                >
                  {Object.values(lineageOpen).some(Boolean) ? '全部折叠' : '全部展开'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ZEN_LINEAGES.map((sect) => {
                const isOpen = !!lineageOpen[sect.id];
                return (
                  <div key={sect.id} className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => toggleLineage(sect.id)}
                      className="w-full flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${sect.bgClass}`}>
                          {sect.badge}
                        </span>
                        <span className={`text-base md:text-lg font-bold font-serif-zen ${sect.titleClass}`}>
                          {sect.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="hidden sm:inline font-medium">{sect.masters.length} 位宗师 · {sect.classics.length} 部典籍</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-700' : ''}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4">
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                          {sect.summary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                          {/* 宗师人物 */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                              <Users className="w-3.5 h-3.5 text-purple-600" />
                              核心宗师人物
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sect.masters.map(m => (
                                <Link prefetch={false} key={m.id} 
                                  href={`/persons/${m.id}`}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition shadow-xs"
                                >
                                  {m.name} <span className="text-purple-500 text-[10px] font-normal">({m.title})</span>
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* 核心经典 */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                              传世宗门经典
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sect.classics.map(c => (
                                <Link prefetch={false} key={c.id} 
                                  href={`/classics/${c.id}`}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shadow-xs"
                                >
                                  《{c.title}》
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* 纲宗法门 */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                              <Compass className="w-3.5 h-3.5 text-sky-600" />
                              纲宗与修持法门
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sect.methods.map((meth, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200">
                                  {meth}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 代表公案 */}
                          <div className="space-y-2">
                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                              <Flame className="w-3.5 h-3.5 text-rose-600" />
                              宗门代表公案
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {sect.koans.map((k, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 板块二：修学阶梯与法门系统手风琴 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold font-serif-zen text-slate-900 flex items-center gap-2.5">
                  <Compass className="w-6 h-6 text-sky-700" />
                  修学阶梯与法门系统手风琴
                </h2>
                <p className="text-sm text-slate-500 mt-1">从初机摄心、顿悟见性，到看话逼拶、默照回互与理事圆融的完整禅修路径指引。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ZEN_PRACTICE_PATHS.map((path) => {
                const isOpen = !!pathOpen[path.id];
                return (
                  <div key={path.id} className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                    <button
                      onClick={() => togglePath(path.id)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-md text-xs font-bold font-mono">
                          {path.step}
                        </span>
                        <span className="text-base md:text-lg font-bold font-serif-zen text-slate-900">
                          {path.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="hidden sm:inline">{path.methods.length} 种法门</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-700' : ''}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-slate-100 space-y-3.5">
                        <p className="text-sm text-slate-600 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                          {path.summary}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-bold text-slate-500 mb-2">对应修持法门：</div>
                            <div className="flex flex-wrap gap-2">
                              {path.methods.map((m, i) => (
                                <Link prefetch={false} key={i} 
                                  href="/methods" 
                                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition"
                                >
                                  {m}
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-500 mb-2">依凭修证经典：</div>
                            <div className="flex flex-wrap gap-2">
                              {path.classics.map((c, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  《{c}》
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 板块三：宗乘经论 7 大专题手风琴 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold font-serif-zen text-slate-900 flex items-center gap-2.5">
                  <BookOpen className="w-6 h-6 text-amber-700" />
                  宗乘经论 7 大专题全景手风琴
                </h2>
                <p className="text-sm text-slate-500 mt-1">全站 79 部经典按义理归类，提供深度的经论导读与直达研读通道。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {THEMATIC_CLASSICS.map((theme) => {
                const isOpen = !!themeOpen[theme.id];
                return (
                  <div key={theme.id} className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleTheme(theme.id)}
                      className="w-full flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${theme.color}`}>
                          {theme.count} 部典籍
                        </span>
                        <span className="text-base md:text-lg font-bold font-serif-zen text-slate-900">
                          {theme.title}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-700' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 border-t border-slate-100 space-y-4">
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {theme.summary}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {theme.bookIds.map(bid => {
                            const b = bookMap.get(bid);
                            if (!b) return null;
                            return (
                              <Link prefetch={false} key={bid}
                                href={`/classics/${bid}`}
                                className="group p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between space-y-2"
                              >
                                <div>
                                  <div className="text-xs font-bold text-amber-800 flex items-center justify-between">
                                    <span>第 {b.idx} 部</span>
                                    <span className="text-slate-400 font-normal">{b.word_count.toLocaleString()} 字</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition mt-1">
                                    《{b.title}》
                                  </h4>
                                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                    {b.summary}
                                  </p>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-700 flex items-center gap-1 pt-1 border-t border-slate-100">
                                  <span>阅读原文与白话</span>
                                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 板块四：六大实体精华检索手风琴 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-2xl font-bold font-serif-zen text-slate-900 flex items-center gap-2.5">
                  <Layers className="w-6 h-6 text-purple-700" />
                  全站六大实体精华检索手风琴
                </h2>
                <p className="text-sm text-slate-500 mt-1">经典、概念、法门、公案、祖师、问答六大维度的全景标签云与快速跳转。</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* 经典著作 */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => toggleEntity('classics')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-amber-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    经典著作精华 ({manifest.length} 部)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entityOpen.classics ? '收起' : '展开全部'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${entityOpen.classics ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {entityOpen.classics && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {manifest.map((b) => (
                        <Link prefetch={false} key={b.id} href={`/classics/${b.id}`} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition">
                          {t(b.title)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 核心概念 */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => toggleEntity('concepts')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    核心概念精华 ({ZEN_CONCEPTS.length} 个)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entityOpen.concepts ? '收起' : '展开全部'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${entityOpen.concepts ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {entityOpen.concepts && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {ZEN_CONCEPTS.slice(0, 120).map((c) => (
                        <Link prefetch={false} key={c.id} href={`/concepts/${c.id}`} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition">
                          {t(c.title)}
                        </Link>
                      ))}
                    </div>
                    {ZEN_CONCEPTS.length > 120 && (
                      <Link prefetch={false} href="/concepts" className="inline-block mt-3 text-xs font-bold text-emerald-700 hover:underline">
                        查看全部 {ZEN_CONCEPTS.length} 个概念 →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* 修持法门 */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => toggleEntity('methods')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-sky-800 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-600" />
                    修持法门精华 ({ZEN_METHODS.length} 个)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entityOpen.methods ? '收起' : '展开全部'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${entityOpen.methods ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {entityOpen.methods && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {ZEN_METHODS.map((m) => (
                        <Link prefetch={false} key={m.id} href={`/methods/${m.id}`} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition">
                          {t(m.title)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 历代祖师 */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => toggleEntity('persons')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-purple-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    祖师人物精华 ({ZEN_PERSONS.length} 位)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entityOpen.persons ? '收起' : '展开全部'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${entityOpen.persons ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {entityOpen.persons && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {ZEN_PERSONS.map((p) => (
                        <Link prefetch={false} key={p.id} href={`/persons/${p.id}`} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition">
                          {t(p.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 经典公案 */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => toggleEntity('koans')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-rose-800 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-600" />
                    经典公案机锋 ({ZEN_KOANS.length} 则)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entityOpen.koans ? '收起' : '展开全部'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${entityOpen.koans ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {entityOpen.koans && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {ZEN_KOANS.slice(0, 60).map((q) => (
                        <Link prefetch={false} key={q.id} href={`/koan/${q.id}`} className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition max-w-[18rem] truncate">
                          {t(q.question)}
                        </Link>
                      ))}
                    </div>
                    {ZEN_KOANS.length > 60 && (
                      <Link prefetch={false} href="/koan" className="inline-block mt-3 text-xs font-bold text-rose-700 hover:underline">
                        查看全部 {ZEN_KOANS.length} 则公案 →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* 核心问答 FAQ */}
              <div className="rounded-2xl border border-slate-200 bg-white/70 overflow-hidden">
                <button
                  onClick={() => toggleEntity('faqs')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[15px] font-bold text-amber-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    经典问答 FAQ ({ZEN_FAQS.length} 条)
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{entityOpen.faqs ? '收起' : '展开全部'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${entityOpen.faqs ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {entityOpen.faqs && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {ZEN_FAQS.slice(0, 60).map((f) => (
                        <Link prefetch={false} key={f.id} href={`/faq#${f.id}`} className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition max-w-[18rem] truncate">
                          {t(f.question)}
                        </Link>
                      ))}
                    </div>
                    {ZEN_FAQS.length > 60 && (
                      <Link prefetch={false} href="/faq" className="inline-block mt-3 text-xs font-bold text-amber-700 hover:underline">
                        查看全部 {ZEN_FAQS.length} 条问答 →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} items={manifest} />
    </div>
  );
}
