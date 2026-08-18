import re

t = open('lib/taxonomy.ts', encoding='utf-8').read()

# 1. 添加人物：龙树菩萨
person_entry = '''  {
    "id": "longshu",
    "name": "龙树菩萨",
    "title": "中观学派创始人",
    "era": "约2-3世纪",
    "lifeStory": "龙树菩萨（Nāgārjuna），印度大乘佛教中观学派创始人，约生于2-3世纪。出身南印度婆罗门家庭，幼年精通四吠陀，后因厌世出家学佛，遍学三藏，尤精般若经。据传曾入龙宫取得《华严经》等大乘经典，被尊为"千部论主"。主要著作有《中论》《大智度论》《十二门论》等，以"八不中道"为核心，破斥一切边见，显示缘起性空的中道实相，为大乘佛教奠定理论基础。在中国被尊为八宗共祖。",
    "teachings": "龙树菩萨的核心思想是"八不中道"：不生不灭、不常不断、不一不异、不来不出。通过严密的逻辑推理，破斥一切边见执着，显示缘起性空的中道实相。提出"二谛"理论：世俗谛与第一义谛，二谛不相离。运用"四句"方法破斥有、无、亦有亦无、非有非无四种边见。采用"破而不立"的方法，不提出自己的主张，只破斥对方观点，使其自悟其非。",
    "quotes": [
      "不生亦不灭，不常亦不断，不一亦不异，不来亦不出。",
      "众因缘生法，我说即是空，亦为是假名，亦是中道义。",
      "以有空义故，一切法得成；若无空义者，一切则不成。",
      "未曾有一法，不从因缘生；是故一切法，无不是空者。"
    ],
    "classics": ["zhonglun"],
    "relatedConcepts": ["zhongdao", "babu", "yuanqi", "xingkong", "erdi", "siju", "zhongguan"],
    "relatedMethods": [],
    "relatedPersons": [],
    "relatedBooks": ["zhonglun"]
  },'''

# 2. 添加概念
concept_entries = '''  {
    "id": "zhongdao",
    "title": "中道",
    "category": "concept",
    "summary": "不落空有二边的正见。龙树菩萨以"八不"揭示中道实相：不生不灭、不常不断、不一不异、不来不出。超越一切二元对立，即是中道。中道不是折中，而是超越对立。",
    "classicRef": "《中论》：不生亦不灭，不常亦不断，不一亦不异，不来亦不出。",
    "relatedConcepts": ["babu", "yuanqi", "xingkong"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "babu",
    "title": "八不",
    "category": "concept",
    "summary": "龙树菩萨《中论》开篇揭示的中道实相：不生不灭、不常不断、不一不异、不来不出。涵盖时间（生灭、常断）、空间（一异）、运动（来出）三个维度，破斥人们对现象界的一切执着。",
    "classicRef": "《中论》：不生亦不灭，不常亦不断，不一亦不异，不来亦不出。",
    "relatedConcepts": ["zhongdao", "yuanqi"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "yuanqi",
    "title": "缘起",
    "category": "concept",
    "summary": "因缘和合而生起。一切法皆因缘和合而生，无有独立自存的自性。缘起是佛教对事物存在方式的根本解释。正因为缘起，所以是空；正因为空，缘起才能成立。",
    "classicRef": "《中论》：众因缘生法，我说即是空。",
    "relatedConcepts": ["xingkong", "zhongdao"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "xingkong",
    "title": "性空",
    "category": "concept",
    "summary": "一切法无有自性，本质为空。空非虚无，而是指事物的存在方式是依他而起、无有自性。正因为空，缘起才能成立；正因为缘起，所以是空。空与缘起，一体两面。",
    "classicRef": "《中论》：以有空义故，一切法得成。",
    "relatedConcepts": ["yuanqi", "zhongdao"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "erdi",
    "title": "二谛",
    "category": "concept",
    "summary": "世俗谛与第一义谛。世俗谛是世间约定的真理，如因果、善恶、生死等；第一义谛是超越言说的究竟真理，即诸法实相。二谛不相离：不离世俗谛而说第一义谛，不离第一义谛而说世俗谛。",
    "classicRef": "《中论》：诸佛依二谛，为众生说法。",
    "relatedConcepts": ["zhongdao"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "siju",
    "title": "四句",
    "category": "concept",
    "summary": "有、无、亦有亦无、非有非无。龙树菩萨运用四句方法破斥一切执着，指出这四种观点都是边见，都不能如实认识事物的真相。真正的中道，是超越四句、离一切执着的。",
    "classicRef": "《中论》：一切实非实，亦实亦非实，非实非非实，是名诸佛法。",
    "relatedConcepts": ["zhongdao"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "zhongguan",
    "title": "中观",
    "category": "concept",
    "summary": "龙树菩萨创立的大乘佛教学派，以《中论》为根本论典。中观思想的核心是缘起性空、八不中道。采用"破而不立"的方法，不提出自己的主张，只破斥对方观点，使其自悟其非。",
    "classicRef": "《中论》：众因缘生法，我说即是空，亦为是假名，亦是中道义。",
    "relatedConcepts": ["zhongdao", "babu", "yuanqi", "xingkong"],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },'''

# 3. 添加FAQ（20条）
faq_entries = '''  {
    "id": "faq-863",
    "question": "《中论》的核心思想是什么？",
    "answer": "《中论》的核心思想是"八不中道"和"缘起性空"。龙树菩萨以"不生不灭、不常不断、不一不异、不来不出"八不揭示中道实相，通过严密的逻辑推理，破斥一切边见执着，显示一切法因缘和合、无有自性、本质为空的中道实相。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-864",
    "question": "什么是"八不中道"？",
    "answer": "八不是指不生不灭、不常不断、不一不异、不来不出。这八不涵盖了时间（生灭、常断）、空间（一异）、运动（来出）三个维度，破斥人们对现象界的一切执着。一切法因缘和合，无有自性，故不能说"生"；因缘聚散，现象宛然，故不能说"灭"。超越一切二元对立，即是中道。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-865",
    "question": "什么是"缘起性空"？",
    "answer": "缘起性空是《中论》的核心命题。一切法皆因缘和合而生，无有独立自存的自性，故说为空。但空非虚无，而是指事物的存在方式是依他而起、无有自性。正因为空，缘起才能成立；正因为缘起，所以是空。空与缘起，一体两面，不相妨碍。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-866",
    "question": "什么是"二谛"？",
    "answer": "二谛指世俗谛与第一义谛。世俗谛是世间约定的真理，如因果、善恶、生死等；第一义谛是超越言说的究竟真理，即诸法实相。二谛不相离：不离世俗谛而说第一义谛，不离第一义谛而说世俗谛。通达二谛即能理解佛法的深义。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-867",
    "question": "什么是"四句"？",
    "answer": "四句指有、无、亦有亦无、非有非无。龙树菩萨运用四句方法破斥一切执着，指出这四种观点都是边见，都不能如实认识事物的真相。真正的中道，是超越四句、离一切执着的。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-868",
    "question": "龙树菩萨的"破而不立"方法是什么意思？",
    "answer": "龙树菩萨采用"破而不立"的方法：不提出自己的主张，只破斥对方的观点。通过揭示对方观点的内在矛盾，使其自悟其非。这种方法被称为"归谬法"，是龙树菩萨的独特贡献。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-869",
    "question": "《中论》的"三是偈"是什么意思？",
    "answer": "三是偈是"众因缘生法，我说即是空，亦为是假名，亦是中道义"。意思是：一切因缘和合而生的事物，我说它的本质是空；但这种空不是虚无，而是假名施设；能够同时理解空与假名，就是中道的义理。空、假、中三谛，一体圆融。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-870",
    "question": "为什么说"以有空义故，一切法得成"？",
    "answer": "正因为有空的意义，一切法才能成立；如果没有空的意义，一切法都不能成立。空不是破坏事物，而是成就事物。正因为空，缘起才能成立。如果事物有固定不变的自性，就不能变化，也就没有缘起。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-871",
    "question": "《中论》对后世有什么影响？",
    "answer": "《中论》是大乘佛教中观学派的根本论典，对后世影响深远。在中国，三论宗（以《中论》《十二门论》《百论》为根本）由吉藏大师创立，成为大乘佛教八大宗之一。《中论》的中观思想也深刻影响了天台宗、华严宗、禅宗等宗派。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-872",
    "question": "龙树菩萨是谁？",
    "answer": "龙树菩萨（Nāgārjuna），印度大乘佛教中观学派创始人，约生于2-3世纪。出身南印度婆罗门家庭，后出家学佛，遍学三藏。主要著作有《中论》《大智度论》《十二门论》等。在中国被尊为"八宗共祖"，对大乘佛教各宗派都有深远影响。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-873",
    "question": "《中论》为什么叫"中论"？",
    "answer": "《中论》以"中"为名，是因为它阐述的是中道实相；以"论"为称，是因为它通过逻辑推理来阐明真理。中道是不落空有二边的正见，论是破斥边见的方法。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-874",
    "question": "《中论》有多少品？",
    "answer": "《中论》共27品，每品破斥一种边见或执着。从破斥"生灭"开始，到破斥"邪见"结束，系统地破斥了人们对时间、空间、因果、自我等一切执着。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-875",
    "question": "《中论》的阅读难点在哪里？",
    "answer": "《中论》的阅读难点主要有：一是逻辑推理密集，需要理解因明学的推理方法；二是"破而不立"的论述方式，需要把握其用意；三是名相繁多，如四句、二谛、八不等；四是古文简奥，需要耐心研读；五是思想深邃，涉及空、有、真、俗等深层哲学问题。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-876",
    "question": "《中论》与禅宗有什么关系？",
    "answer": "《中论》的中观思想对禅宗有深远影响。禅宗"不立文字、直指人心"的方法，与龙树菩萨"破而不立"的精神一脉相承。禅宗的"空"观、"无住"思想，都源于《中论》的缘起性空思想。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-877",
    "question": "什么是"中观学派"？",
    "answer": "中观学派是龙树菩萨创立的大乘佛教学派，以《中论》为根本论典。核心思想是缘起性空、八不中道。采用"破而不立"的方法，不提出自己的主张，只破斥对方观点。中观学派与瑜伽行派（唯识学派）并列为印度大乘佛教的两大主流。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-878",
    "question": "《中论》的"空"是什么意思？",
    "answer": "《中论》的"空"不是虚无，而是指一切法无有自性、依他而起的存在方式。空非断灭，缘起现象宛然存在；空非实有，一切法无有自性。空与缘起，一体两面，不相妨碍。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-879",
    "question": "为什么说"未曾有一法，不从因缘生"？",
    "answer": "这是《中论》对中观思想最简洁的概括：从来没有一法，不是从因缘而生的；因此一切法，无不是空的。一切法因缘和合，无有自性，故说为空。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-880",
    "question": "《中论》的"破"是什么意思？",
    "answer": "《中论》的"破"是破斥、破除的意思。龙树菩萨通过揭示对方观点的内在矛盾，使其自悟其非。破斥的目的不是建立自己的观点，而是破除一切执着，让人回归中道实相。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-881",
    "question": "《中论》与《般若经》有什么关系？",
    "answer": "《中论》是对《般若经》思想的系统化、理论化。《般若经》提出"空"的思想，《中论》通过严密的逻辑推理，阐明空的含义，破斥对空的误解。两者共同构成大乘佛教中观学派的思想基础。",
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "faq-882",
    "question": "学习《中论》有什么好处？",
    "answer": "学习《中论》可以帮助我们：一是破除对自我和世界的执着；二是理解缘起性空的中道实相；三是培养严密的逻辑思维能力；四是通达佛法的深义；五是为修行奠定理论基础。",
    "relatedBooks": ["zhonglun"]
  },'''

# 插入到对应数组
# ZEN_PERSONS
t = re.sub(r'(export const ZEN_PERSONS: PersonItem\[\] = \[)', r'\1\n' + person_entry, t, count=1)

# ZEN_CONCEPTS
t = re.sub(r'(export const ZEN_CONCEPTS: ConceptItem\[\] = \[)', r'\1\n' + concept_entries, t, count=1)

# ZEN_FAQS - 在最后一个 faq 后插入
t = re.sub(r'(\s*"relatedBooks": \["fayanyulu"\]\s*\}\s*\n)(\s*\];)', r'\1,\n' + faq_entries + r'\2', t, count=1)

open('lib/taxonomy.ts', 'w', encoding='utf-8').write(t)
print('taxonomy.ts 已更新：新增1人物、7概念、20FAQ')
