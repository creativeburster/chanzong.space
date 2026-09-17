export interface CollectionChildBook {
  gateNumber: number;        // 第几门 / 卷次（如 1~6）
  gateName: string;          // 门名（如 "第一门·心经颂"）
  classicId: string;         // 对应 /classics/[id] 的 id
  title: string;             // 子经典名称
  summary: string;           // 该门核心宗义
  quote: string;             // 核心代表句
}

export interface CollectionItem {
  id: string;                // 唯一标识，如 "shaoshiliumen"
  title: string;             // "少室六门"
  subtitle: string;          // "菩提达摩根本顿悟法门总汇"
  author: string;            // "梁·菩提达摩 述"
  cbetaRef?: string;         // "大正藏第 48 册 No. 2009"
  period: string;            // "南北朝"
  coverImage?: string;       // 封面或视觉元素
  summary: string;           // 深度白话导读与考证
  historicalNotes: string[]; // 考据要点
  books: CollectionChildBook[];
  relatedPersons: string[];  // 关联祖师 id
  relatedConcepts: string[]; // 关联概念 id
}

export const ZEN_COLLECTIONS: CollectionItem[] = [
  {
    id: "shaoshiliumen",
    title: "少室六门",
    subtitle: "东土禅宗初祖菩提达摩根本顿悟法门总汇",
    author: "梁·菩提达摩 述",
    cbetaRef: "大正藏第 48 册 No. 2009",
    period: "南北朝·梁",
    summary: "《少室六门》（大正藏 No. 2009，一卷）是东土禅宗初祖菩提达摩祖师法著的总集汇编。少室者，嵩山少室峰少林寺也，祖师面壁九年于此，故以少室标宗。全集汇聚《心经颂》《破相论》《二种入》《安心法门》《悟性论》《血脉论》六部根本法门，构成了早期禅宗直指人心、不立文字、观心解脱的完整心性哲学大厦。六门环环相扣：以《心经颂》阐明般若实相为纲，以《破相论》直提观心一法总摄万行，以《二种入》立定二入四行做工夫纲骨，以《安心法门》息灭心行能所妄想，以《悟性论》彻了真如无生离诸对待，以《血脉论》极谈以心传心即心是佛之正眼。此集不仅是大乘禅门开基立教之法源，更是千百年来海内外学人参禅见性不可逾越的金石宝典。",
    historicalNotes: [
      "【编纂与版本源流】《少室六门》之成书，汇集了隋唐以降流传的达摩法本。宋代《宗镜录》与大藏经多有引述，元明时期广泛刻行于江南禅林与朝鲜半岛，后经日本江户时代重雕，正式编入近代《大正新脩大藏经》第四十八册宗门部。",
      "【敦煌本与少室本互勘】二十世纪初敦煌莫高窟出土北朝与唐代写本《二入四行论》（伯希和本 P.4634、斯坦因本 S.2799），印证了第三门《二种入》确为昙林笔受之达摩亲传原本；而其余五门在唐宋丛林的发展中，完整保留了初期禅宗以《楞伽》《般若》印心之纯正古风。",
      "【六门逻辑次第】初门以偈颂解《心经》，明体也；二门破相明观心，显用也；三门二种入，践行也；四门安心去人我，入理也；五门悟性断二见，证真也；六门血脉传心印，印宗也。六门相贯，如珠走盘，圆具万德。"
    ],
    books: [
      {
        gateNumber: 1,
        gateName: "第一门 · 心经颂",
        classicId: "damoxinjinganxin",
        title: "心经颂",
        summary: "达摩祖师以五言偈颂逐句阐释玄奘译《般若波罗蜜多心经》，从‘智慧清净海’至‘羯谛羯谛’，字字明心见性，融通般若空性与如来藏妙体。",
        quote: "智慧清净海，理密义幽深。波罗到彼岸，向道秖由心。"
      },
      {
        gateNumber: 2,
        gateName: "第二门 · 破相论",
        classicId: "poxianglun",
        title: "菩提达摩大师破相论",
        summary: "又名《观心论》。直示‘观心一法总摄诸法’，将持戒、修福、造寺、燃灯等外在造作悉数归摄于内心无漏觉照，破尽一切形式相执。",
        quote: "唯观心一法，总摄诸法，最为省要。"
      },
      {
        gateNumber: 3,
        gateName: "第三门 · 二种入",
        classicId: "sixingguan",
        title: "菩提达摩大师入道四行观",
        summary: "达摩化东土之基石法门。立‘理入’（深信众生同一真性，凝住壁观）与‘行入’（报冤行、随缘行、无所求行、称法行），为后世万千禅者修心奠定磐石之基。",
        quote: "理入者，谓藉教悟宗，深信含生同一真性……凝住壁观，无自无他，凡圣等一。"
      },
      {
        gateNumber: 4,
        gateName: "第四门 · 安心法门",
        classicId: "damoxinjinganxin",
        title: "安心法门",
        summary: "以问答深究自心现量，道破‘迷时人逐法，解时法逐人’之千古关隘。附达摩《心心心颂》，直令学人息妄安住，不出不入法界。",
        quote: "迷时人逐法，解时法逐人。心心心，难可寻。宽时遍法界，窄也不容针。"
      },
      {
        gateNumber: 5,
        gateName: "第五门 · 悟性论",
        classicId: "wuxinglun",
        title: "菩提达摩大师悟性论",
        summary: "详析寂灭为体、离相为宗之无生义理，阐明烦恼性即是佛性，附达摩《夜坐五更偈》与《真性颂》，直截根源，扫除断常二见。",
        quote: "夫道者以寂灭为体，修者以离相为宗……知心是空，名为见佛。"
      },
      {
        gateNumber: 6,
        gateName: "第六门 · 血脉论",
        classicId: "xuemaicong",
        title: "菩提达摩大师血脉论",
        summary: "禅门法脉相传之冠冕圣典。全论纯任直指：三界兴起同归一心，前佛后佛以心传心不立文字。若不见性，念佛持戒皆无益处；直下见性，当下成佛。",
        quote: "三界兴起同归一心，前佛后佛以心传心，不立文字。若欲觅佛，须是见性，性即是佛！"
      }
    ],
    relatedPersons: ["bodhidharma", "huike"],
    relatedConcepts: ["er-ru-si-xing", "guan-xin", "buli-wenzi", "jianxing-chengfo", "zhengfa-yancang"]
  }
];

export function getCollections(): CollectionItem[] {
  return ZEN_COLLECTIONS;
}

export function getCollectionById(id: string): CollectionItem | null {
  return ZEN_COLLECTIONS.find(c => c.id === id) || null;
}

export function getCollectionByClassicId(classicId: string): CollectionItem | null {
  return ZEN_COLLECTIONS.find(c => c.books.some(b => b.classicId === classicId)) || null;
}
