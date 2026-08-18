# -*- coding: utf-8 -*-
# 重建 zhonglun 的 taxonomy 部分（修正版）：
# 1. 删除重复的 jiu-mo-luo-shi（master 已有 kumarajiva）
# 2. 修正 ti-po / seng-rui 的引用
# 3. 补 5 个中观概念
# 4. 补 20 条 FAQ
# 5. 把 zhonglun 关联到 nagarjuna、kumarajiva 的 relatedBooks

import re

t = open('lib/taxonomy.ts', encoding='utf-8').read()

# ---------- 1. 删除 jiu-mo-luo-shi 整个对象 ----------
marker = '\n  {\n    "id": "jiu-mo-luo-shi"'
start = t.find(marker) + 1          # `  {` 的位置
assert start > 0, 'jiu-mo-luo-shi not found'
end = t.find('\n  },\n', start)     # 关闭 `  },\n` 的位置
assert end > 0
t = t[:start] + t[end + 5:]          # 保留 `= [\n`，跳过敏捷的 `  },\n`

# ---------- 2. 修正 ti-po / seng-rui 引用 ----------
t = t.replace('"relatedPersons": ["jiu-mo-luo-shi", "longshu"]', '"relatedPersons": ["kumarajiva", "nagarjuna"]')
t = t.replace('"relatedPersons": ["longshu"]', '"relatedPersons": ["nagarjuna"]')

# ---------- 3. 补 5 个中观概念 ----------
concepts = '''  {
    "id": "babu",
    "title": "八不",
    "category": "般若",
    "summary": "龙树菩萨《中论》开篇立八不中道：不生不灭、不常不断、不一不异、不来不出。涵盖时间（生灭、常断）、空间（一异）、运动（来出）三个维度，破斥一切二元对立，显示诸法缘起性空的中道实相，为《中论》全论的总纲。",
    "etymology": "八不，即八种否定：不生、不灭、不常、不断、不一、不异、不来、不出。",
    "quotes": ["不生亦不灭，不常亦不断，不一亦不异，不来亦不出。 —《中论·破因缘品》"],
    "guidance": "八不是方法论不是戏论：破除对现象界的一切执见后，于当下一念中体会不生不灭的实相——不是没有生灭，而是不执著生灭。",
    "classicRef": "《中论》",
    "relatedConcepts": ["zhongdao", "xingkong", "erdi"],
    "relatedPersons": ["nagarjuna"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "xingkong",
    "title": "性空",
    "category": "般若",
    "summary": "一切法因缘和合而生，无有独立不变的自性，故说性空。空非虚无断灭——空即缘起，缘起即空；正因为空，一切法才能成立。性空是《中论》破斥自性见后的正面彰显，与禅宗于万法当下照见本性真空之境相通。",
    "etymology": "性空，梵语 svabhāva-śūnyatā，自性空义。",
    "quotes": ["以有空义故，一切法得成；若无空义者，一切则不成。 —《中论》"],
    "guidance": "性空不是分析出来的结论，而是直下照见：见花知花无自性，见月知月无自性——于一切法不执自性，即是观性空。",
    "classicRef": "《中论》",
    "relatedConcepts": ["zhongdao", "yuanqi", "babu", "emptiness"],
    "relatedPersons": ["nagarjuna"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "erdi",
    "title": "二谛",
    "category": "般若",
    "summary": "世俗谛与第一义谛：世俗谛是随顺世间言说的道理（如因果、善恶、生死），第一义谛是超越言说的根本实相（诸法空性）。二谛不相离——不依世俗谛不得第一义谛，不依第一义谛不得涅槃。禅宗教下之接引，正是二谛善巧的化用。",
    "etymology": "二谛，世俗谛（saṃvṛti-satya）与胜义谛（paramārtha-satya），又称第一义谛、真谛。",
    "quotes": ["诸佛依二谛，为众生说法；一以世俗谛，二第一义谛。 —《中论·观四谛品》"],
    "guidance": "修行不离二谛：在世间则循世俗谛明因果，证道时则当下契第一义谛——二谛圆融，说空不废有，说有不碍空。",
    "classicRef": "《中论》",
    "relatedConcepts": ["zhongdao", "xingkong", "babu"],
    "relatedPersons": ["nagarjuna"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "siju",
    "title": "四句",
    "category": "般若",
    "summary": "有、无、亦有亦无、非有非无四种语句。《中论》以四句为破斥的框架：一切实、一切不实、亦实亦不实、非实非非实——四句皆不可执，超越四句才能贴近中道实相。禅宗四料简、四宾主等施设，皆承此四句辨破之法。",
    "etymology": "四句，即四句分别（catuṣkoṭi）：肯定、否定、双亦、双非。",
    "quotes": ["一切实非实，亦实亦非实；非实非非实，是名诸佛法。 —《中论·观法品》"],
    "guidance": "用四句自检：对任何说法，问它落于有、无、双亦、双非哪一句——凡落句者皆可破，破到无句可落处，消息自来。",
    "classicRef": "《中论》",
    "relatedConcepts": ["zhongdao", "babu", "xingkong"],
    "relatedPersons": ["nagarjuna"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "zhongguan",
    "title": "中观",
    "category": "般若",
    "summary": "龙树菩萨开创的大乘学派，以《中论》为根本论典，故称中观（Madhyamaka）。核心是缘起性空、八不中道：以破立自在的论辩，扫荡一切自性见，归于无生毕竟空。中观与唯识并称印度大乘两大车轨，经鸠摩罗什译传后成为三论宗的根本，深刻影响中国佛教诸宗。",
    "etymology": "中观，梵语 Madhyamaka，即中道之观，观诸法无自性故不执二边。",
    "quotes": ["众因缘生法，我说即是空，亦为是假名，亦是中道义。 —《中论·观四谛品》"],
    "guidance": "学中观不是学论辩，是学放舍：以中观的抉破力，对治自心深处最珍爱的那一念自性执——执尽处，即见中道。",
    "classicRef": "《中论》《大智度论》《十二门论》",
    "relatedConcepts": ["zhongdao", "babu", "xingkong", "erdi", "siju"],
    "relatedPersons": ["nagarjuna", "kumarajiva"],
    "relatedBooks": ["zhonglun"]
  },'''

anchor = 'export const ZEN_CONCEPTS: ConceptItem[] = ['
pos = t.find(anchor) + len(anchor) + 1  # 跳过 `\n`
t = t[:pos] + concepts + '\n' + t[pos:]

# ---------- 4. 补 20 条 FAQ ----------
faqs = '''  {
    "id": "faq-885",
    "question": "《中论》的核心思想是什么？",
    "answer": "《中论》以八不中道为总纲，破斥一切自性见，显示缘起性空的中道实相。核心命题是众因缘生法我说即是空——一切法因缘和合、无有自性故空；空非断灭，即缘起故有假名；不落空有二边即是中道。全论由破因缘品到观邪见品，层层扫荡执见。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-886",
    "question": "什么是八不中道？",
    "answer": "不生不灭、不常不断、不一不异、不来不出。这八不涵盖时间（生灭、常断）、空间（一异）、运动（来出）三个维度：一切法因缘和合故不能说生，因缘离散而相续故不能说灭；相续不断故不常，非断灭故不断；不一不异、不来不出例同。超越这四对二元对立，就是中道实相。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-887",
    "question": "何为缘起性空？空是不是什么都没有？",
    "answer": "缘起是一切法皆因缘和合而生，无独立自性；性空是说正因无自性，所以本质是空。空不是什么都没有——缘起现象宛然存在，只是没有固定不变的自性。正因为空，事物才能生灭变化，一切法才能成立。若认为空是什么都没有，就是落于断见，与中观正见相违。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-888",
    "question": "什么是二谛？世俗谛与第一义谛有何关系？",
    "answer": "二谛即世俗谛与第一义谛。世俗谛是随顺世间言说的道理，如因果、善恶、生死；第一义谛是超越言说的根本实相，即诸法空性。二者不相离：不依世俗谛，无从表达和证得第一义谛；不证第一义谛，不能到达涅槃。佛说法常依二谛善巧，说空不废有、说有不碍空。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-889",
    "question": "什么是四句？为什么说四句皆不可执？",
    "answer": "四句是有、无、亦有亦无、非有非无四种表述。龙树以四句为破斥框架：对任何主张，看它落在哪一句，然后指出该句的过失——有无相违、双亦自矛盾、双非无所依。四句既破，则无句可落，正是中道无诤之处。禅宗四料简、四宾主等也承此辨破之法。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-890",
    "question": "龙树的破而不立是什么意思？",
    "answer": "破而不立是指龙树不正面建立自己的主张，只揭破对方论点的内在矛盾，让其自见其非。如观去来品中，无论认为去者是常、是断、是定有、是定无，都被一一指出过失；当一切论点都被破尽，剩下的不是某个新论点，而是戏论止息处的空性。这是归谬法的极致运用。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-891",
    "question": "三是偈是什么意思？",
    "answer": "众因缘生法，我说即是空，亦为是假名，亦是中道义。这四句是《中论》的枢纽：一切因缘所生之法，我说其本质是空；空不是名言所能执取的实有，只是为引导众生而立的假名；既不执空为实有、又不废假名之用，离有无二边，就是中道。它统摄了空、假、中三者的圆融。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-892",
    "question": "为什么说以有空义故一切法得成？",
    "answer": "因为有空的义理，一切法才能成立：事物正因无固定自性，才能随缘变化、生灭相续；若执事物有固定自性，则不能变化、不能生灭，因果罪福、修行解脱都无法安立。中论观四谛品说：以有空义故一切法得成，若无空义者一切则不成——空是成就诸法的根据，不是破坏诸法。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-893",
    "question": "中观与唯识并称两大车轨，二者有何区别？",
    "answer": "中观（龙树）以一切法皆空为宗，重在遮破自性见，立缘起性空；唯识（无著、世亲）以万法唯识为宗，安立阿赖耶识等八识的缘起结构与转识成智的修行次第。二者并称印度大乘两大车轨：中观侧重实相般若的遮诠，唯识侧重依他起性的正面安立。禅宗受两者影响，而重心在中观一路的离戏论。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-894",
    "question": "《中论》全论有几品？各品如何组织？",
    "answer": "《中论》共二十七品。观因缘品至观燃可燃品（一至十品）破作与作者、根境识等基本范畴；观本际品至观合品（十一至十四品）破生死、苦、行、合；观有无品至观业品（十五至十七品）破有无、缚解、业报；观法品至观颠倒品（十八至二十三品）明无我实相、时、因果、成坏、如来、颠倒；观四谛品至观邪见品（二十四至二十七品）总摄四谛、涅槃、十二因缘与一切邪见。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-895",
    "question": "龙树菩萨的师承及在中国的影响如何？",
    "answer": "龙树（约2-3世纪）南印度人，出家后广学三藏，据传于龙宫得《华严经》，造《中论》《大智度论》《十二门论》等，创立中观学派。禅宗列他为西天第十四祖，付法于弟子提婆。中观之学经鸠摩罗什译传中国，由吉藏大成三论宗；提婆著《百论》《四百论》继承其破执方法。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-896",
    "question": "有人说万物由大自在天或微尘所生，龙树如何破斥？",
    "answer": "观因缘品开头即列举八种邪因论：大自在天生、韦纽天生、和合生、时生、世性生、变生、自然生、微尘生。龙树指出这些都堕于无因、邪因、断常等邪见。其根本破法是四句推破：果不从自生、不从他生、不从共生、不从无因生；再以四缘（因缘、次第缘、缘缘、增上缘）逐一推破，显示诸法本无自性的生，生不可得则灭亦不可得。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-897",
    "question": "《中论》如何理解时间？为什么说时不可得？",
    "answer": "观时品以相待义破时间：过去、现在、未来三世互相因待而有——因过去有现在未来，因现在有过去未来。若三世真各独立，则互不相待；若相待成，则没有独立自性。再推：时因物而有，离物无时，而物已被破，故时亦空。时间的实有感是错觉，一切时式中无有可得，所以说时不可得。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-898",
    "question": "涅槃与世间无有分别是什么意思？",
    "answer": "观涅槃品说涅槃与世间无有少分别，世间与涅槃亦无少分别。因为：五阴性毕竟空、无受、寂灭，而所谓世间即是五阴相续往来；一切法不生不灭故，生死与涅槃同归空性，无可分别。但这不等于不修即悟——是说涅槃不离当处，于生死烦恼的当下照见空性，即是涅槃，无需别寻一个涅槃去处。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-899",
    "question": "大圣说空法为离诸见，若复见有空会怎样？",
    "answer": "观行品说：大圣说空法，为离诸见故；若复见有空，诸佛所不化。佛说空是为了破除六十二见及无明爱等烦恼，不是要人执取一个空的实境。若人在空上又生执见（认为空是实有、或认为什么都没有），就像病已愈却执药为病，诸佛也拿他没办法。正确的态度是：空亦复空，连空的执著也要放下。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-900",
    "question": "《中论》与禅宗有关系吗？",
    "answer": "关系很深。禅宗虽标教外别传，但其核心教理与中观一脉相通：八不中道离一切戏论，正是禅宗不立文字、直指人心的理论根据；空亦复空、无住无得，与六祖本来无一物境界相合；四句百非的破除方法，是禅门机锋的底层逻辑。鸠摩罗什译《中论》后，三论宗与禅宗并行于中土，彼此影响。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-901",
    "question": "为何说颠倒灭则无明灭、十二因缘皆灭？",
    "answer": "观颠倒品解释：净不净颠倒生贪嗔痴三毒，而三毒本身无自性、空不可得——因为我不可得，能起烦恼者不可得，烦恼无所属。若如实知颠倒虚妄，则四颠倒（常乐我净）灭；颠倒灭则无明灭；无明灭则行灭，乃至老死灭，十二因缘全链还灭。这不是断灭，是照见其本来空寂后的自然止息。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-902",
    "question": "若一切空，还应做善事断恶事吗？",
    "answer": "观业品正是回答这个问题：虽空亦不断，虽有亦不常，业果报不失——空不坏因果，反而成立因果。正因为业无固定自性，所作的善恶业才会有果报转变的可能；若业有固定自性，则成常法、不可造作，也不可有果报和修行解脱。所以性空之下，因果宛然，善恶业报不失，修行不是被空所废，而是被空所成。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-903",
    "question": "我于过去世为有为无，这类邪见如何破除？",
    "answer": "观邪见品处理六十二见中依过去、未来世的诸见。若过去世的我即是今我，则堕常边——修福生天的众生与今人就是同一，业与解脱之果就混乱了；若过去世的我异于今我，则堕断边——失业果报、自作他受。常断、有边无边、亦有亦无、非有非无，都因相待而无自性，究其实际皆不可得。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-904",
    "question": "如何用《中论》的方法帮助现代生活？",
    "answer": "《中论》的核心方法是观照自性见：当我们对某物、某人、某种情绪产生坚固的执著时，追问它是有、是无、是亦有亦无、是非有非无——会发现这四句都靠不住，执著自然松动。由此对治焦虑、对立、我慢，于一切法中不执自性、随缘自在。这是一种深刻的认知方法，也是禅修止观的预修。",
    "relatedBooks": ["zhonglun"]
  },'''

anchor_faq = 'export const ZEN_FAQS: FAQItem[] = ['
pos_faq = t.find(anchor_faq) + len(anchor_faq) + 1
t = t[:pos_faq] + faqs + '\n' + t[pos_faq:]

# ---------- 5. nagarjuna / kumarajiva 关联 zhonglun ----------
nar_i = t.find('"id": "nagarjuna"')
nar_end = t.find('\n  },\n', nar_i)
nar_block = t[nar_i:nar_end]
t = t[:nar_i] + nar_block.replace('"relatedBooks": []', '"relatedBooks": ["zhonglun"]') + t[nar_end:]

kum_i = t.find('"id": "kumarajiva"')
kum_end = t.find('\n  },\n', kum_i)
kum_block = t[kum_i:kum_end]
t = t[:kum_i] + kum_block.replace('"relatedBooks": ["jingangjing", "weimojiejing"]', '"relatedBooks": ["jingangjing", "weimojiejing", "zhonglun"]') + t[kum_end:]

open('lib/taxonomy.ts', 'w', encoding='utf-8').write(t)
print('taxonomy.ts 重建完成')