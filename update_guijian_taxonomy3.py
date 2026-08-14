with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. ZEN_PERSONS ends with:  }\n];\n\nexport const ZEN_CONCEPTS
persons_marker = '}\n];\n\nexport const ZEN_CONCEPTS'
persons_idx = content.find(persons_marker)
if persons_idx == -1:
    print("ERROR: Can't find ZEN_PERSONS end")
    exit(1)

new_person = '''  },
  {
    "id": "tuiyin",
    "name": "退隐禅师",
    "title": "高丽西山禅师 / 禅家龟鉴作者",
    "era": "高丽王朝 (约13-14世纪)",
    "lifeStory": "退隐禅师，高丽国西山禅师，生平不详。住西山一十年，博览五十本经论语录，将日用中参决要切之语句辑录成编，间加注解，编次而绎之，钩锁连环，血脉相通，著成《禅家龟鉴》一书。其书以本心为宗，辨析禅教二途，阐明参话头活句死句、三要、十病，论述五宗家风与临济宗旨，兼及念佛与禅宗关系，堪称禅教之龟鉴、解行之良药。门人白云禅子鲁愿写之，碧泉禅德义天校之，青霞道人法融等稽首再拜，倾钵囊所储入梓流通。",
    "teachings": "退隐之教，兼融禅教：教门以有言至无言，禅门以无言至无言。参禅须参活句莫参死句，须具三要——大信根、大愤志、大疑情。话头有十种病，离之但举话时略抖擞精神，只疑是个甚么。悟后须访明师决择正眼，先开正眼而后说行履。教学者病在自屈，禅学者病在自高，得意修心者不自屈不自高。",
    "quotes": [
      "活句下荐得堪与佛祖为师，死句下荐得自救不了。",
      "参禅须具三要：一有大信根，二有大愤志，三有大疑情。",
      "大疑之下必有大悟。",
      "神光不昧，万古徽猷，入此门来，莫存知解。"
    ],
    "classics": ["禅家龟鉴"],
    "relatedConcepts": ["kanhua-chan-concept", "yiqing", "huoju-siju"],
    "relatedMethods": ["canhuoju"],
    "relatedPersons": ["linji", "huangbo", "huineng"],
    "relatedBooks": ["chanjia_guijian"]
  }
];\n\nexport const ZEN_CONCEPTS'''

content = content[:persons_idx] + new_person + content[persons_idx + len(persons_marker):]

# 2. ZEN_CONCEPTS ends with:  }\n]\n;\n\nexport const ZEN_METHODS
concepts_marker = '}\n]\n;\n\nexport const ZEN_METHODS'
concepts_idx = content.find(concepts_marker)
if concepts_idx == -1:
    print("ERROR: Can't find ZEN_CONCEPTS end")
    exit(1)

new_concepts = '''  },
  {
    "id": "huoju-siju",
    "title": "活句死句",
    "category": "禅法",
    "summary": "话头有句意二门。参句者，径截门，活句也——没心路没语路无摸索故。参意者，圆顿门，死句也——有理路有语路有闻解思相故。活句下荐得堪与佛祖为师，死句下荐得自救不了。此为退隐禅师《禅家龟鉴》所倡参禅要旨。",
    "etymology": "活句者，无理路可循之言句，逼拶学人至思量不及处；死句者，有理路可解之言句，学人落于知解。此说源于禅宗参活句不参死句之传统。",
    "quotes": ["活句下荐得堪与佛祖为师，死句下荐得自救不了。 \\u2014退隐禅师"],
    "guidance": "参活句如蚊子上铁牛，下嘴不得处弃命一攒。非理解，乃逼拶至思量不及处蓦然透脱。参死句则落于理路语路，纵有体会亦自救不了。",
    "classicRef": "《禅家龟鉴》",
    "relatedConcepts": ["kanhua-chan-concept", "yiqing", "huatou-shibing"],
    "relatedPersons": ["tuiyin", "dahui-zonggao"],
    "relatedBooks": ["chanjia_guijian", "wumenguan"]
  },
  {
    "id": "huatou-shibing",
    "title": "话头十病",
    "category": "禅修障碍",
    "summary": "退隐禅师《禅家龟鉴》列举参话头十种病：一曰意根下卜度，二曰扬眉瞬目处挆根，三曰语路上作活计，四曰文字中引证，五曰举起处承当，六曰飏在无事匣里，七曰作有无会，八曰作真无会，九曰作道理会，十曰将迷待悟。离此十病，但举话时略抖擞精神，只疑是个甚么。",
    "etymology": "退隐禅师总结参话头学人易犯之十种偏差，涵盖意识分别、身体反应、语言执着、正面承当、消极逃避、有无二边、等待开悟等。",
    "quotes": ["离此十种病者，但举话时略抖擞精神，只疑是个甚么。 \\u2014退隐禅师"],
    "guidance": "十病总归于以意识心参禅。参话头之要在于疑情截断意识，而非以意识分别思量。如蚊子叮铁牛，下嘴不得处弃命一攒，方为正参。",
    "classicRef": "《禅家龟鉴》",
    "relatedConcepts": ["kanhua-chan-concept", "huoju-siju", "yiqing"],
    "relatedPersons": ["tuiyin"],
    "relatedBooks": ["chanjia_guijian"]
  },
  {
    "id": "can-san-yao",
    "title": "参禅三要",
    "category": "禅法",
    "summary": "退隐禅师《禅家龟鉴》云：参禅须具三要——一有大信根，二有大愤志，三有大疑情。苟阙其一，如折足之鼎，终成废器。佛云成佛者信为根本，永嘉云修道者先须立志，蒙山云参禅者不疑言句是为大病，又云大疑之下必有大悟。",
    "etymology": "三要者，信根、愤志、疑情也。信根为基，愤志为力，疑情为用。三者缺一不可。",
    "quotes": ["参禅须具三要：一有大信根，二有大愤志，三有大疑情。苟阙其一，如折足之鼎，终成废器。 \\u2014退隐禅师"],
    "guidance": "信根——深信自心即佛，不向外求。愤志——生死心切，非悟不可。疑情——举话头时通身起疑团，如吞热铁丸。三者同时具足，参究自然得力。",
    "classicRef": "《禅家龟鉴》",
    "relatedConcepts": ["kanhua-chan-concept", "yiqing", "huoju-siju"],
    "relatedPersons": ["tuiyin", "yongjiaxuanjue"],
    "relatedBooks": ["chanjia_guijian"]
  },
  {
    "id": "wuzong-jiafeng",
    "title": "五宗家风",
    "category": "禅宗流派",
    "summary": "禅宗五家各有门庭设施：临济赤手单刀杀佛杀祖，辨古今于玄要，验龙蛇于主宾；曹洞权开五位善接三根，横抽宝剑斩诸见稠林；云门剑锋有路铁壁无门，掀翻露布葛藤；沩仰师资唱和父子一家，离四句绝百非；法眼言中有响句里藏锋，翠竹黄花宣明妙法。五宗家风虽异，皆归一心。",
    "etymology": "禅宗自六祖后分出五家：临济、曹洞、云门、沩仰、法眼。各祖师接人机用不同，遂成不同家风。",
    "quotes": [
      "临济家风：青天轰霹雳，平地起波涛。",
      "曹洞家风：佛祖未生空劫外，正偏不落有无机。",
      "云门家风：拄杖子跳上天，盏子里诸佛说法。",
      "沩仰家风：断碑横古路，铁牛眠少室。",
      "法眼家风：风送断云归岭去，月和流水过桥来。"
    ],
    "guidance": "五宗家风无高下——临济棒喝、曹洞默照、云门一字、沩仰师资、法眼善巧，皆为应机施教。学者须择适合自己根机者而参。",
    "classicRef": "《禅家龟鉴》《五灯会元》《人天眼目》",
    "relatedConcepts": ["zongfeng", "kanhua-chan-concept", "mozhao-chan-concept"],
    "relatedPersons": ["linji", "dongshan-liangjia", "yunmen-wenyan", "weishan-lingyou", "fayan-wenyi"],
    "relatedBooks": ["chanjia_guijian", "wudenghuiyuan"]
  }
]\n;\n\nexport const ZEN_METHODS'''

content = content[:concepts_idx] + new_concepts + content[concepts_idx + len(concepts_marker):]

# 3. ZEN_METHODS ends with:  }\n]\n;\n\nexport const ZEN_KOANS
methods_marker = '}\n]\n;\n\nexport const ZEN_KOANS'
methods_idx = content.find(methods_marker)
if methods_idx == -1:
    print("ERROR: Can't find ZEN_METHODS end")
    exit(1)

new_method = '''  },
  {
    "id": "canhuoju",
    "title": "参活句",
    "summary": "参活句为退隐禅师《禅家龟鉴》所倡参禅正法。活句者，没心路没语路无摸索之言句，逼拶学人至思量不及处蓦然透脱。参活句如蚊子上铁牛，下嘴不得处弃命一攒和身透入。活句下荐得堪与佛祖为师，死句下荐得自救不了。",
    "steps": [
      "举话头——如狗子无佛性之无字",
      "不起分别——莫作道理会、莫作有无会",
      "通身起疑团——如吞热铁丸，吐不出咽不下",
      "下嘴不得处弃命——如蚊子上铁牛，更不问如何若何",
      "蓦然透脱——疑到山穷水尽处，忽然透过"
    ],
    "pitfalls": [
      "参死句——有理路有语路，落于知解",
      "作道理会——以意识分别思量话头",
      "将迷待悟——等待开悟而非当下参究",
      "飏在无事匣——消极放任而非积极参究"
    ],
    "classicRef": "《禅家龟鉴》",
    "relatedConcepts": ["huoju-siju", "kanhua-chan-concept", "yiqing", "huatou-shibing"],
    "relatedPersons": ["tuiyin", "dahui-zonggao"],
    "relatedBooks": ["chanjia_guijian", "wumenguan"]
  }
]\n;\n\nexport const ZEN_KOANS'''

content = content[:methods_idx] + new_method + content[methods_idx + len(methods_marker):]

# 4. ZEN_KOANS ends with:  }\n];\n\nexport interface FAQItem
koans_marker = '}\n];\n\nexport interface FAQItem'
koans_idx = content.find(koans_marker)
if koans_idx == -1:
    print("ERROR: Can't find ZEN_KOANS end")
    exit(1)

new_koans = '''  },
  {
    "id": "koan-246",
    "question": "说似一物即不中",
    "answer": "六祖问：什么物？伊么来？怀让罔措，至八年方自肯曰：说似一物即不中。",
    "context": "六祖告众云：吾有一物无名无字，诸人还识否？神会即出曰：诸佛之本源，神会之佛性。六祖斥为孽子。怀让自嵩山来，六祖问：什么物？伊么来？怀让罔措，至八年方自肯曰：说似一物即不中。退隐禅师评曰：此所以为六祖之嫡子也。",
    "interpretation": "神会答诸佛之本源神会之佛性——落于知解，以意识分别心描述本心，故被斥为孽子。怀让经八年方悟说似一物即不中——本心不可名状，说它像什么就不对了。嫡子与孽子之别，不在聪明，在于是否落于知解。",
    "master": "六祖惠能",
    "source": "禅家龟鉴",
    "relatedConcepts": ["self-nature", "huoju-siju"],
    "relatedPersons": ["huineng", "huairang", "shenhui", "tuiyin"],
    "relatedBooks": ["chanjia_guijian", "tanjing"]
  },
  {
    "id": "koan-247",
    "question": "老鼠入牛角",
    "answer": "又不得将迷待悟，就不可思量处思量。心无所之。如老鼠入牛角便见倒断也。",
    "context": "退隐禅师《禅家龟鉴》云：话头不得举起处承当，不得思量卜度，又不得将迷待悟，就不可思量处思量。心无所之，如老鼠入牛角便见倒断也。",
    "interpretation": "老鼠钻入牛角，越钻越窄，到最后无路可走——此喻参话头至思量不及处。不可思量处思量，即逼拶至意识穷尽处。倒断即透脱，非思量所得，乃思量穷尽后蓦然契悟。",
    "master": "退隐禅师",
    "source": "禅家龟鉴",
    "relatedConcepts": ["kanhua-chan-concept", "yiqing", "huatou-shibing"],
    "relatedPersons": ["tuiyin"],
    "relatedBooks": ["chanjia_guijian"]
  },
  {
    "id": "koan-248",
    "question": "孤轮独照江山静",
    "answer": "孤轮独照江山静，自笑一声天地惊。",
    "context": "退隐禅师《禅家龟鉴》结尾颂曰：如斯举唱明宗旨，笑杀西来碧眼僧。然毕竟如何？孤轮独照江山静，自笑一声天地惊。",
    "interpretation": "孤轮独照——悟后心如明月，独照江山而不染一尘。自笑一声——自笑从前枉用功夫，天地惊——一悟一切悟，惊天动地。此为退隐禅师全篇总结：始于一物之名状不得，终于莫存知解，以孤轮独照之境收束全篇。",
    "master": "退隐禅师",
    "source": "禅家龟鉴",
    "relatedConcepts": ["self-nature", "huoju-siju"],
    "relatedPersons": ["tuiyin"],
    "relatedBooks": ["chanjia_guijian"]
  }
];\n\nexport interface FAQItem'''

content = content[:koans_idx] + new_koans + content[koans_idx + len(koans_marker):]

# 5. ZEN_FAQS ends with:  }\n]; (at end of file)
faqs_marker = '}\n];'
faqs_idx = content.rfind(faqs_marker)
if faqs_idx == -1:
    print("ERROR: Can't find ZEN_FAQS end")
    exit(1)

new_faqs = '''  },
  {
    id: 'faq-696',
    question: '《禅家龟鉴》是什么书？',
    answer: '《禅家龟鉴》是高丽国西山退隐禅师所述的禅宗修行指南。退隐禅师住西山十年，博览五十本经论语录，将日用中参决要切之语句辑录成编，间加注解。全书以本心为宗，辨析禅教二途，阐明参话头活句死句、三要（信根·愤志·疑情）、话头十病，论述戒定慧三学、五宗家风、临济宗旨，兼及念佛与禅宗关系。言言见谛，句句朝宗，堪称禅教之龟鉴、解行之良药。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-697',
    question: '"有一物"是什么意思？',
    answer: '退隐禅师开篇即说有一物于此，从本以来昭昭灵灵，不曾生不曾灭，名不得状不得。此一物即众生本心、佛性。六祖问吾有一物无名无字诸人还识否，神会答诸佛之本源神会之佛性却被斥为孽子，怀让答说似一物即不中被印为嫡子。差别在于：神会落于知解，怀让直下体认——本心不可名状，说它像什么就不对了。',
    relatedBooks: ['chanjia_guijian', 'tanjing'],
  },
  {
    id: 'faq-698',
    question: '禅和教有什么区别？',
    answer: '退隐禅师辨析：禅是佛心，教是佛语。世尊三处传心为禅旨，一代所说为教门。以无言至于无言者禅也，以有言至于无言者教也。失之于口则拈花微笑皆是教迹，得之于心则世间粗言细语皆是禅旨。禅教之源同为世尊，派则为迦叶（禅）与阿难（教）。教学者病在自屈，禅学者病在自高，得意修心者不自屈不自高。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-699',
    question: '什么是活句和死句？',
    answer: '话头有句意二门。参句者是径截门、活句——没心路没语路无摸索，逼拶学人至思量不及处蓦然透脱。参意者是圆顿门、死句——有理路有语路有闻解思相，落于知解。活句下荐得堪与佛祖为师，死句下荐得自救不了。参活句如蚊子上铁牛，下嘴不得处弃命一攒和身透入。',
    relatedBooks: ['chanjia_guijian', 'wumenguan'],
  },
  {
    id: 'faq-700',
    question: '参禅三要是什么？',
    answer: '退隐禅师云：参禅须具三要——一有大信根，二有大愤志，三有大疑情。苟阙其一，如折足之鼎，终成废器。信根即深信自心即佛；愤志即生死心切、非悟不可；疑情即举话头时通身起疑团。佛云成佛者信为根本，永嘉云修道者先须立志，蒙山云大疑之下必有大悟。',
    relatedBooks: ['chanjia_guijian', 'yongjia'],
  },
  {
    id: 'faq-701',
    question: '话头十种病是哪些？',
    answer: '退隐禅师列举：一曰意根下卜度（猜测揣度），二曰扬眉瞬目处挆根（身体反应），三曰语路上作活计（语言执着），四曰文字中引证（引经据典），五曰举起处承当（正面承当），六曰飏在无事匣里（消极放任），七曰作有无会（落于有无二边），八曰作真无会（落于虚无），九曰作道理会（道理理解），十曰将迷待悟（等待开悟）。离此十病，但举话时略抖擞精神，只疑是个甚么。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-702',
    question: '参话头如老鼠入牛角是什么意思？',
    answer: '退隐禅师云：不得将迷待悟，就不可思量处思量，心无所之，如老鼠入牛角便见倒断也。老鼠钻入牛角越钻越窄，到最后无路可走——此喻参话头至思量不及处。倒断即透脱，非思量所得，乃思量穷尽后蓦然契悟。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-703',
    question: '五宗家风各有什么特色？',
    answer: '临济：赤手单刀杀佛杀祖，青天轰霹雳平地起波涛；曹洞：权开五位善接三根，佛祖未生空劫外正偏不落有无机；云门：剑锋有路铁壁无门，拄杖子跳上天盏子里诸佛说法；沩仰：师资唱和父子一家，断碑横古路铁牛眠少室；法眼：言中有响句里藏锋，风送断云归岭去月和流水过桥来。五宗家风虽异，皆归一心。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-704',
    question: '临济宗旨有哪些施设？',
    answer: '临济宗接人法门包括：三玄三要（一句中具三玄，一玄中具三要）、四料拣（夺人不夺境、夺境不夺人、人境俱夺、人境俱不夺）、四宾主（宾中宾、宾中主、主中宾、主中主）、四照用（先照后用、先用后照、照用同时、照用不同时）、四喝（金刚王宝剑、踞地狮子、探竿影草、一喝不作一喝用）、八棒等。皆是大机大用，全身出没，全身担荷。',
    relatedBooks: ['chanjia_guijian', 'linji'],
  },
  {
    id: 'faq-705',
    question: '退隐禅师如何看待念佛与禅宗的关系？',
    answer: '退隐禅师兼融二者：既引五祖守本真心胜念十方诸佛、六祖佛向性中作莫向身外求，又引阿弥陀佛四十八愿劝人往生。他认为上根利智可直指本心，中下根人须借佛力。自力他力一迟一速，如种树作船（迟）与借船越海（速）。但警告自性弥陀者：彼佛无贪无嗔，我亦无贪嗔乎？不可以一时贡高致永劫沉堕。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-706',
    question: '悟后为什么还要访明师？',
    answer: '退隐禅师云：然一念子爆地一破，然后须访明师决择正眼。此事极不容易，须生惭愧始得。道如大海转入转深，慎勿得小为足。悟后若不见人，则醍醐上味翻成毒药。古德云：只贵子眼正，不贵汝行履处。先开正眼而后说行履——悟后须经明师印可，方知所见是否真正。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-707',
    question: '参禅工夫如调弦是什么意思？',
    answer: '退隐禅师云：工夫如调弦之法，紧缓得其中。勤则近执著，忘则落无明。惶惶历历，密密绵绵。急则动血囊，忘则入鬼窟，不徐不疾妙在其中。如弹琴者缓急得中然后清音普矣。工夫到行不知行坐不知坐，当此之时八万四千魔军在六根门头伺候，心若不起则争如之何。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-708',
    question: '打破漆桶是什么意思？',
    answer: '退隐禅师云：若欲敌生死，须得这一念子爆地一破，方了得生死。爆打破漆桶声——以打破漆桶然后生死可敌也。漆桶喻无明暗昧之心，黑漆漆一片不见光明。打破漆桶即无明顿破、亲见本来面目。诸佛因地法行者只此而已。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-709',
    question: '神光不昧万古徽猷是什么意思？',
    answer: '此为退隐禅师《禅家龟鉴》结尾之语。神光不昧——结上昭昭灵灵，即本心从本以来光明觉照不曾断灭。万古徽猷——结上本不生灭，即大道万古常存。入此门来莫存知解——结上不可守名生解。退隐禅师以此三句收束全篇：始于一物之名状不得，终于莫存知解。',
    relatedBooks: ['chanjia_guijian'],
  },
  {
    id: 'faq-710',
    question: '《禅家龟鉴》适合什么人读？',
    answer: '此书适合两类人：一是初学参禅者，可借此了解参话头的正法（活句死句、三要、十病），避免走入歧途；二是兼学禅教的修行者，可借此厘清禅教关系，既不自屈也不自高。全书不到万字，但涵盖禅宗修行之全体，言简意赅，最适合作为参禅入门指南。',
    relatedBooks: ['chanjia_guijian'],
  }
];'''

content = content[:faqs_idx] + new_faqs + content[faqs_idx + len(faqs_marker):]

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    verify = f.read()

q = '"'
print(f"tuiyin: {verify.count(q + 'id' + q + ': ' + q + 'tuiyin' + q)}")
print(f"huoju-siju: {verify.count(q + 'id' + q + ': ' + q + 'huoju-siju' + q)}")
print(f"canhuoju: {verify.count(q + 'id' + q + ': ' + q + 'canhuoju' + q)}")
print(f"koan-246: {verify.count(q + 'id' + q + ': ' + q + 'koan-246' + q)}")
print(f"koan-248: {verify.count(q + 'id' + q + ': ' + q + 'koan-248' + q)}")
print(f"faq-696: {verify.count(chr(39) + 'faq-696' + chr(39))}")
print(f"faq-710: {verify.count(chr(39) + 'faq-710' + chr(39))}")
print("Done")
