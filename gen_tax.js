const fs = require('fs');

const persons = [
  {
    id: 'bodhidharma', name: '菩提达摩', title: '禅宗东土初祖', era: '南北朝',
    lifeStory: '菩提达摩（Bodhidharma），南天竺香至王第三子。达摩航海历时数载抵达广州，泛舟过江入魏，于嵩山少林寺终日面壁九年。神光立雪断臂，求法心切，达摩遂传法于慧可，付嘱《楞伽经》与袈裟。',
    teachings: '直指人心，见性成佛，不立文字，教外别传。',
    quotes: ['若见性即是佛，不见性即是众生。', '外息诸缘，内心无喘。'],
    classics: ['菩提达摩大师血脉论'],
    relatedConcepts: ['self-nature', 'mind-transmission'], relatedMethods: ['four-practices'], relatedPersons: ['huike'], relatedBooks: ['xuemai']
  },
  {
    id: 'huike', name: '二祖慧可', title: '禅宗二祖', era: '南北朝',
    lifeStory: '慧可，俗姓姬，虎牢人。大雪过膝，慧可立于雪中不动，取利刃自断左臂，表求法之诚。得达摩安心法门。',
    teachings: '指出心本无形相，一切烦恼皆由妄心而起。',
    quotes: ['觅心了不可得。', '是心是佛，是心是法，法佛无二。'],
    classics: ['二祖慧可大和尚语录'],
    relatedConcepts: ['non-mind', 'self-nature'], relatedMethods: ['four-practices'], relatedPersons: ['bodhidharma', 'sengcan'], relatedBooks: ['anxin']
  },
  {
    id: 'sengcan', name: '三祖僧璨', title: '禅宗三祖', era: '隋代',
    lifeStory: '僧璨，初以居士身见二祖慧可，求忏悔罪业。慧可令其觅罪，答觅不可得，言下大悟。隐居皖公山。著有《信心铭》，为禅宗最核心之经典之一。',
    teachings: '至道无难，唯嫌拣择。但莫憎爱，洞然明白。',
    quotes: ['至道无难，唯嫌拣择。'],
    classics: ['信心铭'],
    relatedConcepts: ['non-duality'], relatedMethods: ['mozhao'], relatedPersons: ['huike', 'daoxin'], relatedBooks: ['xinxinming']
  },
  {
    id: 'daoxin', name: '四祖道信', title: '东山法门开创者', era: '唐代',
    lifeStory: '道信，十四岁参三祖僧璨，求脱缚法，大悟。于黄梅双峰山聚徒五百人，开创“东山法门”，实行农禅并重。传法给五祖弘忍。',
    teachings: '百千法门，同归方寸；河沙妙德，总在心源。',
    quotes: ['境缘无好丑，好丑起于心。'],
    classics: ['入道安心要方便法门'],
    relatedConcepts: ['samadhi'], relatedMethods: ['nianfo-chan'], relatedPersons: ['sengcan', 'hongren'], relatedBooks: ['anxin']
  },
  {
    id: 'hongren', name: '五祖弘忍', title: '东山法门大成者', era: '唐代',
    lifeStory: '弘忍，七岁出家，从四祖道信学禅，于黄梅东山寺大弘法化。接引学人无数，门下俊秀如林，夜传法于惠能。',
    teachings: '守本真心，胜念十方诸佛。',
    quotes: ['若识得自心，即是解脱。'],
    classics: ['最上乘论'],
    relatedConcepts: ['self-nature'], relatedMethods: ['daily-zen'], relatedPersons: ['daoxin', 'huineng'], relatedBooks: ['zuishangcheng']
  },
  {
    id: 'huineng', name: '六祖惠能', title: '曹溪南宗开山祖师', era: '唐代',
    lifeStory: '惠能，岭南新州人。闻《金刚经》契悟，礼五祖弘忍。作“菩提本无树”偈得传衣钵。于广州法性寺“风幡之议”出世说法，在曹溪宝林寺广开顿悟法门。',
    teachings: '无念为宗，无相为体，无住为本。',
    quotes: ['菩提本无树，明镜亦非台。', '本来无一物，何处惹尘埃。'],
    classics: ['六祖法宝坛经'],
    relatedConcepts: ['self-nature', 'no-abiding'], relatedMethods: ['daily-zen'], relatedPersons: ['hongren', 'shenhui'], relatedBooks: ['tanjing']
  },
  {
    id: 'shenhui', name: '荷泽神会', title: '荷泽宗祖师', era: '唐代',
    lifeStory: '神会，六祖惠能弟子。滑台无遮大会与北宗辩论，确立南宗顿悟正统。',
    teachings: '单刀直入，直指人心。一念相应。',
    quotes: ['知之一字，众妙之门。'],
    classics: ['神会和尚遗集'],
    relatedConcepts: ['instant-enlightenment'], relatedMethods: ['daily-zen'], relatedPersons: ['huineng'], relatedBooks: ['shenhui']
  },
  {
    id: 'yongjia', name: '永嘉玄觉', title: '一宿觉', era: '唐代',
    lifeStory: '玄觉，精通天台止观。参六祖惠能，辩机锋后留宿一宵，称“一宿觉”。著《证道歌》。',
    teachings: '圆融天台教理与禅宗顿悟。',
    quotes: ['梦里明明有六趣，觉后空空无大千。'],
    classics: ['永嘉证道歌'],
    relatedConcepts: ['instant-enlightenment'], relatedMethods: ['daily-zen'], relatedPersons: ['huineng'], relatedBooks: ['zhengdaoge']
  },
  {
    id: 'mazu', name: '马祖道一', title: '洪州宗祖师', era: '唐代',
    lifeStory: '马祖道一，南岳怀让弟子。“磨砖既不成镜，坐禅岂能成佛”点破执着。开创洪州禅风。',
    teachings: '即心即佛，平常心是道。',
    quotes: ['即心即佛。', '平常心是道。'],
    classics: ['马祖道一禅师语录'],
    relatedConcepts: ['ordinary-mind', 'mind-is-buddha'], relatedMethods: ['daily-zen'], relatedPersons: ['baizhang', 'dahui'], relatedBooks: ['mazu']
  },
  {
    id: 'dahui', name: '大珠慧海', title: '大珠慧海禅师', era: '唐代',
    lifeStory: '慧海，参马祖道一，被问“自家宝藏不顾”而大悟。著《顿悟入道要门论》。',
    teachings: '顿悟入道，饥来吃饭，困来即眠。',
    quotes: ['饥来吃饭，困来即眠。'],
    classics: ['顿悟入道要门论'],
    relatedConcepts: ['instant-enlightenment'], relatedMethods: ['daily-zen'], relatedPersons: ['mazu'], relatedBooks: ['dunwu']
  },
  {
    id: 'baizhang', name: '百丈怀海', title: '禅门清规祖师', era: '唐代',
    lifeStory: '怀海，马祖弟子。立禅门独立丛林清规，实行“农禅并重”。',
    teachings: '一日不作，一日不食。',
    quotes: ['一日不作，一日不食。'],
    classics: ['百丈怀海禅师语录'],
    relatedConcepts: ['self-nature'], relatedMethods: ['banghe'], relatedPersons: ['mazu', 'huangbo'], relatedBooks: ['baizhang']
  },
  {
    id: 'huangbo', name: '黄檗希运', title: '传心法要祖师', era: '唐代',
    lifeStory: '希运，百丈弟子。教风峻烈，著《传心法要》。临济义玄于其门下大悟。',
    teachings: '诸佛与一切众生，唯是一心，更无别法。',
    quotes: ['不经一番寒彻骨，怎得梅花扑鼻香。'],
    classics: ['黄檗山断际禅师传心法要'],
    relatedConcepts: ['mind-is-buddha'], relatedMethods: ['banghe'], relatedPersons: ['baizhang', 'linji'], relatedBooks: ['huangbo']
  },
  {
    id: 'linji', name: '临济义玄', title: '临济宗开山祖师', era: '唐代',
    lifeStory: '义玄，三度问法黄檗被打，后经大愚禅师点化大悟。开创临济宗，以棒喝齐施。',
    teachings: '赤肉团上有一无位真人。逢佛杀佛。',
    quotes: ['随处作主，立处皆真。'],
    classics: ['临济慧照禅师语录'],
    relatedConcepts: ['direct-pointing'], relatedMethods: ['banghe'], relatedPersons: ['huangbo'], relatedBooks: ['linji']
  },
  {
    id: 'zhaozhou', name: '赵州从谂', title: '赵州古佛', era: '唐代',
    lifeStory: '从谂，南泉普愿弟子。以“平常心是道”契悟。活到120岁，以平实语言接机。',
    teachings: '唇皮禅。吃茶去、狗子无佛性。',
    quotes: ['吃茶去。', '狗子无佛性。'],
    classics: ['赵州禅师语录'],
    relatedConcepts: ['koan'], relatedMethods: ['jiefeng'], relatedPersons: ['dongshan'], relatedBooks: ['mazu']
  },
  {
    id: 'dongshan', name: '洞山良价', title: '曹洞宗开山祖师', era: '唐代',
    lifeStory: '良价，参云岩昙晟，过水见影大悟。创曹洞宗，提出五位君臣。',
    teachings: '正偏回互，绵密细致。',
    quotes: ['切忌从他觅，迢迢与我疏。'],
    classics: ['宝镜三昧歌'],
    relatedConcepts: ['non-duality'], relatedMethods: ['mozhao'], relatedPersons: ['zhaozhou'], relatedBooks: ['tanjing']
  }
];

const concepts = [
  { id: 'buddha-nature', title: '佛性', category: '心性', summary: '一切众生皆有佛性。', classicRef: '涅槃经', relatedConcepts: ['self-nature'], relatedPersons: ['huineng'], relatedBooks: ['tanjing'] },
  { id: 'prajna', title: '般若', category: '智慧', summary: '照见万法皆空的智慧。', classicRef: '金刚经', relatedConcepts: ['emptiness'], relatedPersons: ['huineng'], relatedBooks: ['tanjing'] },
  { id: 'emptiness', title: '空', category: '本体', summary: '万法无自性，故空。', classicRef: '心经', relatedConcepts: ['prajna'], relatedPersons: ['bodhidharma'], relatedBooks: ['xuemai'] },
  { id: 'non-duality', title: '不二', category: '境界', summary: '超越对待。', classicRef: '维摩诘经', relatedConcepts: ['samadhi'], relatedPersons: ['sengcan'], relatedBooks: ['xinxinming'] },
  { id: 'koan', title: '公案', category: '实修', summary: '祖师言行记录，用以截断心识。', classicRef: '无门关', relatedConcepts: ['beyond-words'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'samadhi', title: '三昧', category: '定力', summary: '心一境性，不散乱。', classicRef: '法华经', relatedConcepts: ['non-duality'], relatedPersons: ['daoxin'], relatedBooks: ['anxin'] },
  { id: 'affliction-bodhi', title: '烦恼即菩提', category: '境界', summary: '烦恼之体即是菩提。', classicRef: '维摩诘经', relatedConcepts: ['emptiness'], relatedPersons: ['huineng'], relatedBooks: ['tanjing'] },
  { id: 'no-abiding', title: '无住', category: '心法', summary: '应无所住而生其心。', classicRef: '金刚经', relatedConcepts: ['prajna'], relatedPersons: ['huineng'], relatedBooks: ['tanjing'] },
  { id: 'mind-is-buddha', title: '即心即佛', category: '本体', summary: '自心即是佛。', classicRef: '传心法要', relatedConcepts: ['not-mind-not-buddha'], relatedPersons: ['mazu'], relatedBooks: ['mazu'] },
  { id: 'not-mind-not-buddha', title: '非心非佛', category: '本体', summary: '破除对心佛的执着。', classicRef: '传心法要', relatedConcepts: ['mind-is-buddha'], relatedPersons: ['mazu'], relatedBooks: ['mazu'] },
  { id: 'all-returns-to-one', title: '万法归一', category: '境界', summary: '万法同归一理。', classicRef: '碧岩录', relatedConcepts: ['non-duality'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'direct-pointing', title: '直指人心', category: '心法', summary: '不立文字，直指本心。', classicRef: '血脉论', relatedConcepts: ['mind-transmission'], relatedPersons: ['bodhidharma'], relatedBooks: ['xuemai'] },
  { id: 'mind-transmission', title: '以心传心', category: '传承', summary: '心心相印，不立文字。', classicRef: '血脉论', relatedConcepts: ['direct-pointing'], relatedPersons: ['bodhidharma'], relatedBooks: ['xuemai'] },
  { id: 'beyond-words', title: '不立文字', category: '心法', summary: '真理超越语言文字。', classicRef: '血脉论', relatedConcepts: ['koan'], relatedPersons: ['bodhidharma'], relatedBooks: ['xuemai'] },
  { id: 'originally-nothing', title: '本来无一物', category: '本体', summary: '自性空寂，本来无一物。', classicRef: '坛经', relatedConcepts: ['emptiness'], relatedPersons: ['huineng'], relatedBooks: ['tanjing'] }
];

const methods = [
  { id: 'nianfo-chan', title: '念佛禅', summary: '借由一句“阿弥陀佛”收摄身心。', steps: ['念佛', '疑情'], classicRef: '宗镜录', relatedConcepts: ['samadhi'], relatedPersons: ['daoxin'], relatedBooks: ['anxin'] },
  { id: 'banghe', title: '棒喝', summary: '截断徒弟思维，契入空性。', steps: ['学人发问', '禅师截断', '契悟'], classicRef: '临济录', relatedConcepts: ['beyond-words'], relatedPersons: ['linji'], relatedBooks: ['linji'] },
  { id: 'daily-zen', title: '行住坐卧即禅', summary: '融入日常生活。', steps: ['专注当下', '无造作'], classicRef: '马祖语录', relatedConcepts: ['ordinary-mind'], relatedPersons: ['mazu'], relatedBooks: ['mazu'] },
  { id: 'jiefeng', title: '机锋', summary: '隐喻对话，勘验境界。', steps: ['抛出机锋', '不落窠臼'], classicRef: '五灯会元', relatedConcepts: ['beyond-words'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'wumen', title: '无门关', summary: '参究“无”字。', steps: ['提斯无字', '打破漆桶'], classicRef: '无门关', relatedConcepts: ['koan'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] }
];

const qas = [
  { id: 'qa-1', question: '南泉斩猫', answer: '南泉斩猫，赵州顶履。', context: '东西两堂争猫，南泉欲斩。', interpretation: '截断两情。', master: '南泉普愿', source: '无门关', relatedConcepts: ['koan'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'qa-2', question: '赵州狗子', answer: '无。', context: '狗子有佛性否？', interpretation: '截断有无。', master: '赵州从谂', source: '无门关', relatedConcepts: ['koan'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'qa-3', question: '德山棒临济喝', answer: '打，喝。', context: '学人求法。', interpretation: '直指人心。', master: '临济义玄', source: '临济录', relatedConcepts: ['direct-pointing'], relatedPersons: ['linji'], relatedBooks: ['linji'] },
  { id: 'qa-4', question: '百丈野狐', answer: '不昧因果。', context: '野狐问不落因果。', interpretation: '因果历然。', master: '百丈怀海', source: '无门关', relatedConcepts: ['koan'], relatedPersons: ['baizhang'], relatedBooks: ['baizhang'] },
  { id: 'qa-5', question: '香严上树', answer: '开口即堕。', context: '人在树上，有人问法。', interpretation: '逼拶。', master: '香严智闲', source: '无门关', relatedConcepts: ['koan'], relatedPersons: ['baizhang'], relatedBooks: ['mazu'] },
  { id: 'qa-6', question: '风幡之辩', answer: '仁者心动。', context: '风动幡动？', interpretation: '万法唯心。', master: '六祖惠能', source: '坛经', relatedConcepts: ['mind-is-buddha'], relatedPersons: ['huineng'], relatedBooks: ['tanjing'] },
  { id: 'qa-7', question: '磨砖作镜', answer: '坐禅岂能成佛。', context: '马祖坐禅，怀让磨砖。', interpretation: '破执。', master: '南岳怀让', source: '景德传灯录', relatedConcepts: ['mind-is-buddha'], relatedPersons: ['mazu'], relatedBooks: ['mazu'] },
  { id: 'qa-8', question: '庭前柏树子', answer: '庭前柏树子。', context: '如何是祖师西来意？', interpretation: '物物全真。', master: '赵州从谂', source: '无门关', relatedConcepts: ['koan'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'qa-9', question: '吃茶去', answer: '吃茶去。', context: '曾到此间否？', interpretation: '平常心。', master: '赵州从谂', source: '无门关', relatedConcepts: ['ordinary-mind'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'qa-10', question: '万法归一', answer: '一归何处。', context: '万法归一。', interpretation: '绝对本体。', master: '赵州从谂', source: '碧岩录', relatedConcepts: ['all-returns-to-one'], relatedPersons: ['zhaozhou'], relatedBooks: ['mazu'] },
  { id: 'qa-11', question: '拈花微笑', answer: '正法眼藏。', context: '世尊拈花。', interpretation: '以心传心。', master: '释迦牟尼', source: '无门关', relatedConcepts: ['mind-transmission'], relatedPersons: ['bodhidharma'], relatedBooks: ['xuemai'] },
  { id: 'qa-12', question: '慧可断臂', answer: '觅心了不可得。', context: '求法断臂。', interpretation: '安心法门。', master: '菩提达摩', source: '无门关', relatedConcepts: ['non-mind'], relatedPersons: ['huike'], relatedBooks: ['anxin'] }
];

let output = `export interface PersonItem {
  id: string;
  name: string;
  title: string;
  era: string;
  lifeStory: string;
  teachings: string;
  quotes: string[];
  classics: string[];
  relatedConcepts: string[];
  relatedMethods: string[];
  relatedPersons: string[];
  relatedBooks: string[];
}

export interface ConceptItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  etymology?: string;
  quotes?: string[];
  guidance?: string;
  classicRef: string;
  relatedConcepts: string[];
  relatedPersons: string[];
  relatedBooks: string[];
}

export interface MethodItem {
  id: string;
  title: string;
  summary: string;
  origin?: string;
  steps: string[];
  pitfalls?: string[];
  classicRef: string;
  relatedConcepts: string[];
  relatedPersons: string[];
  relatedBooks: string[];
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  context?: string;
  interpretation?: string;
  master: string;
  source: string;
  relatedConcepts: string[];
  relatedPersons: string[];
  relatedBooks: string[];
}

export const ZEN_PERSONS: PersonItem[] = ${JSON.stringify(persons, null, 2)};
export const ZEN_CONCEPTS: ConceptItem[] = ${JSON.stringify(concepts, null, 2)};
export const ZEN_METHODS: MethodItem[] = ${JSON.stringify(methods, null, 2)};
export const ZEN_QAS: QAItem[] = ${JSON.stringify(qas, null, 2)};
`;

fs.writeFileSync('F:/chanzong.space/lib/taxonomy.ts', output);
console.log('taxonomy.ts generated');
