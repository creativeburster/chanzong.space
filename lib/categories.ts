export interface CategoryItem {
  id: string;                // 分类唯一标识 (slug)，如 "yulu", "qinggui"
  name: string;              // 分类标准名，如 "宗门语录"
  subtitle: string;          // 副标题，如 "大机大用 · 棒喝交驰 · 历代祖师机锋勘验实录"
  icon: string;              // 分类图标 emoji
  description: string;       // 深度白话导读与历史源流阐释
  significance: string;      // 该分类在禅宗心性与修行体系中的核心定位
  classicIds: string[];      // 所包含的经典 ID 数组（支持一部经典属于多个分类）
  relatedPersons: string[];  // 代表祖师 id 数组
  relatedConcepts: string[]; // 核心概念 id 数组
}

export const ZEN_CATEGORIES: CategoryItem[] = [
  {
    "id": "yulu",
    "name": "宗门语录",
    "subtitle": "大机大用 · 棒喝交驰 · 历代祖师机锋勘验实录",
    "icon": "⚡",
    "description": "宗门语录是禅宗在世界宗教与哲学史上独创的文献体裁。禅宗主张‘教外别传，不立文字’，但在日常参究与接引后学中，祖师们随缘提撕、借物表法、棒喝相兼之法语被侍者与门人如实记下，汇为‘语录’。语录一洗经院哲学之繁琐名相，直指当下现前一念，涵盖马祖道一之即心即佛、百丈怀海之大机大用、黄檗希运之一心无心、临济义玄之无位真人、赵州从谂之平常心是道，乃至五家七宗历代宗匠之开堂法语、小参示众与室中垂示。是参禅者洞明本来面目、领略向上一窍最鲜活之第一手资料。",
    "significance": "直录自心现量机用，破除学者知见情解，为禅门见性起修之直接发端。",
    "classicIds": [
      "mazu",
      "baizhang",
      "huangbo",
      "linji",
      "dongshanyulu",
      "yunmen",
      "huanwuxinyao",
      "huanwuyulu",
      "dahuiyulu",
      "huangbo_wanlinglu",
      "zhaozhouyulu",
      "caoshanyulu",
      "fayanyulu",
      "yangqihoulu",
      "yangqiyulu",
      "huanglonghuinan",
      "shishuangchuyuan",
      "xuanshayulu",
      "xuanshaguanglu",
      "gaofengyulu",
      "xuefengyulu",
      "mianxianyulu",
      "rujingyulu",
      "rujingxuyulu",
      "weishanyulu",
      "qiaoyinyulu",
      "xutangyulu",
      "hongzhiyulu",
      "tianmuzhongfengguanglu",
      "guzunsuyulu",
      "zibailaorenquanji",
      "hanshanlaorenmengyouji",
      "fangshanwenbaoyulu",
      "zongmenshenan",
      "pingshiyulu",
      "chaozongyulu",
      "wenyiyulu",
      "yangshanyulu",
      "jianguanyulu",
      "pangjushiyulu",
      "haiyinyulu",
      "xisouyulu",
      "wujianxianduyulu",
      "huitangyulu",
      "shiwuyulu",
      "xiyanyulu",
      "duanqiaoyulu",
      "shanhuidashilu",
      "yuejianyulu",
      "huanxiyulu",
      "fenyangyulu",
      "shitianyulu",
      "mingjueyulu",
      "xueyanyulu",
      "xisouguanglu",
      "yuxuanyulu",
      "biyanlu",
      "zongjinglu"
    ],
    "relatedPersons": [
      "mazu",
      "baizhang",
      "huangbo",
      "linji",
      "zhaozhou",
      "yunmen",
      "dongshan",
      "yuanwu-keqin"
    ],
    "relatedConcepts": [
      "mind-is-buddha",
      "non-mind",
      "direct-pointing",
      "koan",
      "mind-transmission"
    ]
  },
  {
    "id": "yinxin",
    "name": "印心经藏",
    "subtitle": "达摩受嘱 · 六祖顿悟 · 佛说大乘了义经典之宗门法源",
    "icon": "🪷",
    "description": "虽然禅宗标榜‘教外别传，不立文字’，但历代祖师皆深明‘藉教悟宗’之要旨。佛说大乘了义经藏，正是禅宗以心传心、印证明心见性的根本法源。达摩祖师航海东来，以四卷《楞伽经》印心传付慧可；六祖慧能闻客诵《金刚经》‘应无所住而生其心’言下顿悟；文殊、维摩诘极显不二法门，圆觉、楞严穷究如来藏真心妙体，法华大显诸法实相。禅门不执文字却深契经旨，是以大乘了义经藏不仅是宗门印心之金石规矩，亦是历代禅僧深入法界不堕野狐狂禅之正知见指引。",
    "significance": "佛语心为宗，无门为法门。大乘印心经典是破除暗证盲修、保任正法眼藏之究竟印契。",
    "classicIds": [
      "wenshu",
      "jingangjing",
      "xinjing",
      "yuanjuejing",
      "lengyanjing",
      "weimojiejing",
      "lengqiejing",
      "shoulengyansanmeijing",
      "shengmanjing",
      "jingangsanmeijing",
      "miaofalianhuajing",
      "jieshenmijing",
      "miyanjing"
    ],
    "relatedPersons": [
      "bodhidharma",
      "huineng",
      "xuanzang"
    ],
    "relatedConcepts": [
      "zhengfa-yancang",
      "self-nature",
      "buddha-nature",
      "emptiness",
      "prajna"
    ]
  },
  {
    "id": "damo",
    "name": "达摩根本",
    "subtitle": "少室面壁 · 二入四行 · 东土禅宗开基立教之根本宝典",
    "icon": "🧗",
    "description": "达摩祖师自南天竺泛海东渐，于嵩山少室面壁九载，单传心印，开创东土禅宗万古道场。达摩传世之作，以《少室六门》为大宗，包含《入道四行观》《破相论》《安心法门》《悟性论》《血脉论》《心经颂》及敦煌写本《无心论》。其教以‘藉教悟宗，深信含生同一真性’为理入，以‘报冤、随缘、无所求、称法’四行为行入，直示‘观心一法总摄诸法’、‘识自本心，见自本性’。达摩法宝洗尽繁杂名相，言简义丰，直切心源，是天下禅者寻根溯源、见性起修不可逾越的祖道源流。",
    "significance": "东土禅法之法源根本，立定禅宗观心见性、以心传心之万代宗纲。",
    "classicIds": [
      "xuemaicong",
      "wuxinglun",
      "poxianglun",
      "wuxinlun",
      "xixulun",
      "sixingguan",
      "damoxinjinganxin"
    ],
    "relatedPersons": [
      "bodhidharma",
      "huike"
    ],
    "relatedConcepts": [
      "beyond-words",
      "jianxing-chengfo",
      "direct-pointing",
      "mind-transmission",
      "non-mind"
    ]
  },
  {
    "id": "qinggui",
    "name": "丛林清规",
    "subtitle": "马祖建丛林 · 百丈立清规 · 禅门农禅并重之制度基石",
    "icon": "⚖️",
    "description": "唐代中叶，禅僧多寄住律寺。马祖道一开创丛林，百丈怀海折衷大小乘戒律，特立禅门清规，倡导‘一日不作，一日不食’之农禅家风，自此禅宗僧团拥有了独立的修道制度与生存根基。清规不仅规范丛林堂舍分设、执事分工、朝夕参请、行坐起居之礼仪，更将甚深禅法化为日常生活之每一微细处——‘搬柴运水，皆是妙用；行住坐卧，无非道场’。后世《禅苑清规》《入众须知》《敕修百丈清规》相继完善，使禅门于千百年朝代更迭、教难动荡中依然葆有坚不可摧之生命力。",
    "significance": "化戒律为宗门日用实修，奠定中国禅宗千年丛林安居与农禅并重之组织基石。",
    "classicIds": [
      "chanyuanqinggui",
      "chixiu-baizhang-qinggui",
      "huanzhu-anqinggui",
      "ruzhongriyong",
      "ruzhongxuzhi",
      "conglinxiaodingqinggui",
      "chanlinbeiyongqinggui",
      "zimenjingxun"
    ],
    "relatedPersons": [
      "baizhang",
      "daoxin",
      "huineng"
    ],
    "relatedConcepts": [
      "self-nature",
      "zhengfa-yancang",
      "dinghui-dengchi"
    ]
  },
  {
    "id": "gongan",
    "name": "公案评唱",
    "subtitle": "击石火 · 闪电光 · 宋代文字禅与颂古评唱之巅峰",
    "icon": "🧩",
    "description": "公案（公府之案牍）原指祖师勘验学人领悟深度之机锋对话与典型事件。入宋以降，宗门大师为了令后学不滞于语言逻辑、打破知解情识，对古德公案加设‘拈古’、‘颂古’与‘评唱’。雪窦重显以卓越之诗情撰《百则颂古》，圆悟克勤于夹山碧岩泉下为之加设垂示、著语与长篇评唱，成天下第一书《碧岩录》；万松行秀评唱天童正觉颂古成《从容录》；无门慧开精选四十八则关隘成《无门关》。公案评唱不仅将汉语文辞之空灵峻奇推至极境，更构成了宋元禅林举扬宗风、透脱生死关隘最核心之参究利器。",
    "significance": "以诗文般若回互提撕，截断学人偷心意识，为大慧看话禅与参公案之核心教材。",
    "classicIds": [
      "wumenguan",
      "biyanlu",
      "foguojijielu",
      "congronglu",
      "xisouguanglu",
      "yuxuanyulu"
    ],
    "relatedPersons": [
      "yuanwu-keqin",
      "xuedou-chongxian",
      "wumen-huikai"
    ],
    "relatedConcepts": [
      "fen-biyanlu",
      "koan",
      "wenzi-chan",
      "huatou-gongfu"
    ]
  },
  {
    "id": "denglu",
    "name": "传灯史传",
    "subtitle": "一花开五叶 · 薪尽火传 · 西天东土历代正统法脉信史",
    "icon": "🕯️",
    "description": "‘传灯’喻示诸佛菩萨与历代祖师以心印心、正法相传如一灯燃百千灯，冥者皆明。禅宗极其重视法统法嗣之承袭信史。宋真宗朝杨亿等刊定《景德传灯录》三十卷，系统梳理过去七佛、西天二十八祖、东土六祖乃至南岳青原门下五家七宗千余位禅僧之传法机缘；契嵩禅师撰《传法正宗记》九卷定西天二十八祖说，诏入大藏；后世《五灯会元》《天圣广灯录》《指月录》《续传灯录》代有增补。传灯史传不仅是禅宗最宏大之历史文献长河，亦是后世万千公案与名言法语之总源泉。",
    "significance": "确立宗门法统与传法谱系，记录千百祖师悟道因缘，为禅宗信史第一宝库。",
    "classicIds": [
      "jingdechuandenglu",
      "wudenghuiyuan",
      "zhiyuelu",
      "chuanfazhengzongdingzutu",
      "chuanfazhengzongji",
      "xuchuandenglu",
      "lidaifabaoji"
    ],
    "relatedPersons": [
      "qisong",
      "bodhidharma",
      "huineng",
      "jiashan-shanhui"
    ],
    "relatedConcepts": [
      "zhengfa-yancang",
      "chuan-deng",
      "mind-transmission"
    ]
  },
  {
    "id": "mingsong",
    "name": "祖师铭颂",
    "subtitle": "言简义丰 · 击节讽诵 · 宗门心性诗学之绝唱金篇",
    "icon": "🎵",
    "description": "祖师铭颂是禅宗思想最凝练、最优美的诗学表达。三祖僧璨大师撰《信心铭》，开篇‘至道无难，唯嫌挑选’，千百年来为入道者所铭心铭骨；永嘉玄觉大师《证道歌》二百六十七句，高唱绝学无为闲道人之超然解脱；牛头法融《心铭》、志公禅师《十二时歌》《大乘赞》、傅大士《心王铭》、石头希迁《参同契》《草庵歌》、洞山良价《宝镜三昧歌》，以纯熟之韵语，直吐胸中悟境，无一字涉于说教，字字如珠走盘。此类文献既宜于每日击节讽咏、熏陶心性，亦是透悟不二真空之极上法味。",
    "significance": "以诗韵直写自性解脱境界，融文学艺术与至高心性于一炉，易于讽诵记忆。",
    "classicIds": [
      "qifo",
      "juelin",
      "zhengdaoge",
      "zhigong",
      "xinwangming",
      "shiniutu",
      "baojingsanmei",
      "xinxinming",
      "xinming",
      "fangcunlun"
    ],
    "relatedPersons": [
      "sengcan",
      "yongjia",
      "niutou-farong",
      "dongshan"
    ],
    "relatedConcepts": [
      "affliction-bodhi",
      "self-nature",
      "real-mind",
      "non-duality"
    ]
  },
  {
    "id": "xiuxin",
    "name": "禅修心要",
    "subtitle": "惺惺寂寂 · 调伏身心 · 行者坐禅办道之具体践行指针",
    "icon": "🧘",
    "description": "宗门虽极言顿悟，然向上一窍透后，保任历练、消磨客尘之渐修工夫不可或缺。禅修心要专收历代祖师指导学人调和身心、对治昏沉掉举、安住本然真心之实修典籍。高丽普照知讷国师《修心诀》《真心直说》详辨空寂灵知与顿悟渐修；长芦宗赜《坐禅仪》立禅堂打坐调息之正轨；达摩《入道四行观》奠定报冤随缘之日常觉照；六祖《坛经》直示定慧一体与无念为宗。此类典籍理路清晰、步骤详实，是现代学人于喧嚣尘世中降伏烦恼、扎实办道之不二指南。",
    "significance": "详列坐禅调息、对治习气、止观等持之具体次第，融通顿悟与渐修行持。",
    "classicIds": [
      "xiuxinjue",
      "zhenxin",
      "changuancejin",
      "chanjia_guijian",
      "zuochanyi",
      "boshan-canchanjingyu",
      "chanzongjueyiji",
      "anxin",
      "zuishangcheng",
      "tanjing",
      "dunwu",
      "shenhui",
      "yongjia",
      "jueguanlun",
      "sixingguan",
      "zhengdaoge"
    ],
    "relatedPersons": [
      "chinul",
      "guifeng-zongmi",
      "yongjia",
      "bodhidharma"
    ],
    "relatedConcepts": [
      "dunwu-jianxiu",
      "dinghui-dengchi",
      "samadhi",
      "ben-lai-mian-mu"
    ]
  },
  {
    "id": "lunshi",
    "name": "宗义经论",
    "subtitle": "转识成智 · 缘起性空 · 奠定宗门心性哲学之经论大厦",
    "icon": "🏛️",
    "description": "禅宗被尊为‘最上乘禅’，其心性哲学不仅承接西天如来藏妙旨，更深植于大乘唯识学与中观学之深邃辩证之中。世亲菩萨《唯识三十颂》《二十论》《辨中边论》剖析八识三能变与转识成智，为禅门参究我执根源（第七末那识）提供精微解剖；龙树菩萨《中论》《十二门论》《顺中论》立八不中道与二谛圆融，彻底扫荡一切断常有无二边执著；永明延寿大师集百家经论作《宗镜录》百卷，举一心为宗镜，会通性相、融解禅教。此类巨著为禅门直指人心提供了无可动摇之形而上学根基与哲学正见。",
    "significance": "建构万法唯心与中道实相之哲学体系，为学人破除边见、正见照道之理论殿堂。",
    "classicIds": [
      "bashiguijusong",
      "baifamingmenlun",
      "weishisanshilunsong",
      "weishiershilun",
      "chengyelun",
      "bianzhongbianlun",
      "shedachenglunben",
      "achengjilun",
      "baoxinglun",
      "dachengzhuangyanjinglun",
      "chengweishilun",
      "xianyangshengjiaolun",
      "dachengapidamojilun",
      "dachengqixinlun",
      "dachengqixinlunxinyi",
      "zhonglun",
      "shiertimenlun",
      "shunzhonglun",
      "baoxingwangzhenglun",
      "banruodenglunshi",
      "bailun",
      "putixingjing",
      "dachengbaoyaoyilun",
      "zongjinglu",
      "weixinjue",
      "wanshantongguiji",
      "zhaolun"
    ],
    "relatedPersons": [
      "yongming-yanshou",
      "xuanzang",
      "nagarjuna",
      "ti-po"
    ],
    "relatedConcepts": [
      "zhuan-shi-cheng-zhi",
      "babu",
      "xingkong",
      "erdi",
      "shishi-wuai",
      "wanfa-weixin"
    ]
  },
  {
    "id": "hujiao",
    "name": "护法论辩",
    "subtitle": "儒释交锋 · 辟狂显正 · 捍卫宗门法统之金石篇章",
    "icon": "🛡️",
    "description": "在唐宋元明历代思想交汇中，禅宗既深受士林文人倾慕，亦常面临儒学复兴运动之质疑攻击，丛林内部亦时有流于狂禅虚诞、蔑弃戒律之偏弊。面对时代挑战，宗门高僧挺身而出，以深厚之学识、严密之逻辑撰述护法论著。北宋镡津契嵩禅师撰《传法正宗论》，宋仁宗赐号明教大师；明初空谷景隆禅师撰《尚理编》《尚直编》，痛斥狂禅口头禅，力挽明代学风；大慧宗杲门人辑《禅林宝训》《林间录》，策励后进风骨。此类论著风骨卓然、气象博大，展现了禅门宗匠护持正法、淑世化民之大智大勇。",
    "significance": "于三教融会中明辨正宗，内破口头狂禅之弊，外御非难质疑，为宗门捍道之干城。",
    "classicIds": [
      "chanlinbaoxun",
      "linjianhoulu",
      "shanglibian",
      "shangzhibian",
      "zibaibieji",
      "linjianlu",
      "chuanfazhengzonglun",
      "renyantianmu",
      "chanyuan_zhuquanjiduxu",
      "zhuweimojiejing"
    ],
    "relatedPersons": [
      "qisong",
      "konggu-jinglong",
      "hanshan-deqing"
    ],
    "relatedConcepts": [
      "zhengfa-yancang",
      "koutou-chan",
      "real-mind",
      "direct-pointing"
    ]
  },
  {
    "id": "mifa",
    "name": "密乘直指",
    "subtitle": "赤裸觉性 · 本来清净 · 藏传大圆满与禅门同归一心",
    "icon": "🌅",
    "description": "藏传佛教宁玛派（前译派）巅峰大法‘大圆满’（Dzogchen），其修持核心在于直探心性本原——‘无染觉性，本自清净，自然解脱’。西藏密宗开祖莲花生大士传世之《无染觉性直观自行解脱之道》《杖指老人直指心性》《自我解脱》等六部法宝，以极其直白、震撼且富有穿透力之语言，当下指示行者明了现前赤裸灵知即是本性真佛，不借造作、无须修整。这一见地与汉传东土禅宗达摩以来‘即心即佛、直指人心、见性成佛’在根本心体上毫无二致，实为大乘非二元佛法在雪域高原与中原汉地遥相辉映之双璧。",
    "significance": "显密圆融，极显心体不二、任运自成之本然法界，展现大乘心性哲学之全球广度。",
    "classicIds": [
      "wuran",
      "zhangzhi",
      "jingangge",
      "ziwojietuo",
      "songlingbaoxun",
      "xizangduwangjing",
      "xinxingxiuxisong",
      "henghedashouyin",
      "zixingcanjiu",
      "awatuotazhige",
      "ashitawakela"
    ],
    "relatedPersons": [
      "lianhuasheng"
    ],
    "relatedConcepts": [
      "wu-ran-jue-xing",
      "jietuo",
      "direct-pointing",
      "self-nature"
    ]
  }
];

export function getCategories(): CategoryItem[] {
  return ZEN_CATEGORIES;
}

export function getCategoryById(id: string): CategoryItem | null {
  return ZEN_CATEGORIES.find(c => c.id === id) || null;
}

// 根据经典 ID 获取其所属的全部分类（多对多支持）
export function getCategoriesByClassicId(classicId: string): CategoryItem[] {
  return ZEN_CATEGORIES.filter(c => c.classicIds.includes(classicId));
}
