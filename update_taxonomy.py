import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update dahui-zonggao person: add dahuiyulu to relatedBooks
old_related = '"relatedBooks": ["chanlinbaoxun", "changuancejin"]\n  },\n  {\n    "id": "kumarajiva"'
new_related = '"relatedBooks": ["chanlinbaoxun", "changuancejin", "dahuiyulu"]\n  },\n  {\n    "id": "kumarajiva"'
content = content.replace(old_related, new_related, 1)

# 2. Add new concepts before ZEN_CONCEPTS closing ]
# Find the last concept entry's closing and the array end
# ZEN_CONCEPTS ends at line 5602-5603: }  \n];
# We need to insert before the ];
# Find the pattern:  }\n];\n\nexport const ZEN_METHODS
concepts_end = content.find('}\n];\n\nexport const ZEN_METHODS')
if concepts_end == -1:
    print("ERROR: Can't find ZEN_CONCEPTS end")
    exit(1)

new_concepts = '''  },
  {
    "id": "fen-biyanlu",
    "title": "焚毁碧岩录",
    "category": "禅宗典故",
    "summary": "大慧宗杲因其师圜悟克勤所撰《碧岩录》在禅林广为流传，学人沉迷文字评唱，以图口捷，反失禅宗直指人心之旨。大慧遂将《碧岩录》木刻版烧毁，以救斯弊。此举体现了大慧重实参实悟、反对文字禅的立场。",
    "etymology": "《碧岩录》为圜悟克勤所撰，集雪窦重显百则颂古与圜悟评唱而成，禅林视为\\u201c禅门第一书\\u201d。然大慧见学人以此为口实，不务实参，故火之。",
    "quotes": ["大慧禅师因学人入室下语颇异，疑之，才勘而邪锋自挫，再鞠而纳款自降，曰：我《碧岩集》中记来，实非有悟。因虑其后不明根本，专尚语言，以图口捷，由是火之，以救斯弊也。"],
    "guidance": "焚碧岩录非毁其书——乃救其弊。文字本身无过，过在学人执文字为禅。大慧此举，意在令学人回归实参实究，不以文字知解为悟。",
    "classicRef": "《大慧语录》",
    "relatedConcepts": ["wenzi-chan", "kanhua-chan-concept"],
    "relatedPersons": ["dahui-zonggao", "yuanwu-keqin"],
    "relatedBooks": ["dahuiyulu", "huanwuxinyao"]
  },
  {
    "id": "zongfeng",
    "title": "宗风",
    "category": "禅法",
    "summary": "宗风指禅宗各派独特的教学风格与门庭设施。临济宗以棒喝交施、机锋峻烈著称；曹洞宗以绵密细致、默照深沉见长；云门宗以言句简截、一字关闻名；法眼宗以因材施教、循循善诱为特色。大慧宗杲承临济杨岐派，宗风直截痛快，以看话禅逼拶学人。",
    "etymology": "宗风一词，源于禅宗各祖师门庭设施之不同。宗者，宗派；风者，风范、风格。",
    "quotes": ["杀人须是杀人刀，活人须是活人剑。 \\u2014大慧宗杲"],
    "guidance": "宗风无高下——临济棒喝、曹洞默照、云门一字、法眼循循，皆为应机施教。学者须择适合自己根机者而参，不必执此非彼。",
    "classicRef": "《大慧语录》《五灯会元》",
    "relatedConcepts": ["kanhua-chan-concept", "mozhao-chan-concept"],
    "relatedPersons": ["dahui-zonggao", "hongzhi-zhengjue", "linji-yixuan"],
    "relatedBooks": ["dahuiyulu", "chanlinbaoxun"]
  },
  {
    "id": "pu-shuo",
    "title": "普说",
    "category": "禅宗体裁",
    "summary": "普说为禅宗语录中的一种开示体裁，不同于上堂之庄重正式，普说更为随缘开示，普集大众共说。大慧语录中普说部分（卷十三至卷十八）为全录精华，集中阐述看话禅之原理与方法，痛斥默照禅与文字禅。",
    "etymology": "普说者，普集大众而说也。不同于上堂之有仪轨，普说更为随意，因事因人随缘开示。",
    "quotes": [],
    "guidance": "普说为语录中最接地气之部分——上堂有仪式感，法语有针对性，唯普说兼具系统性与随缘性，最宜初学阅读。",
    "classicRef": "《大慧语录》",
    "relatedConcepts": ["kanhua-chan-concept", "yiqing"],
    "relatedPersons": ["dahui-zonggao"],
    "relatedBooks": ["dahuiyulu"]
  },
  {
    "id": "fa-yu",
    "title": "法语",
    "category": "禅宗体裁",
    "summary": "法语为禅师对居士或学人的书面开示，通常以书信形式给出具体修行指导。大慧语录中法语部分（卷十九至卷二十四）为示居士法语，指导在家修行者如何于日用中看话头、起疑情、参究到底，是禅宗居士修行的珍贵文献。",
    "etymology": "法语者，以法示人之语也。不同于上堂普说之口头开示，法语多为书面，针对个人具体修行问题而答。",
    "quotes": [],
    "guidance": "法语最切实际——因针对具体学人之具体问题而答，故最宜初学对照自身修行困惑来读。",
    "classicRef": "《大慧语录》",
    "relatedConcepts": ["kanhua-chan-concept", "yiqing", "canjiu"],
    "relatedPersons": ["dahui-zonggao"],
    "relatedBooks": ["dahuiyulu"]
  }
]
'''

# Replace the concepts closing
content = content[:concepts_end] + new_concepts + content[concepts_end+3:]

# 3. Add new methods before ZEN_METHODS closing ]
# Find ZEN_METHODS end
methods_end = content.find('}\n];\n\nexport const ZEN_KOANS')
if methods_end == -1:
    print("ERROR: Can't find ZEN_METHODS end")
    exit(1)

new_methods = '''  },
  {
    "id": "can-shengsi",
    "title": "参生死",
    "category": "禅修法门",
    "summary": "将生死大事贴在额头上，时刻提撕，以此为参禅之根本动力。大慧宗杲常开示学人：生死事大，无常迅速。以生死之心参禅，则不敢怠惰；以生死之心看话头，则疑情自起。此法门重在以生死切题，逼拶学人放下万缘，一味参去。",
    "steps": [
      "将生死大事贴在额头上——时刻提醒自己：我是为生死来参禅的",
      "提起话头——以无字或念佛是谁为所缘",
      "以生死之心逼拶——若生死心切，则自然不起杂念",
      "疑情自起——生死心切则疑情猛利，不假用力",
      "蓦然透脱——疑到山穷水尽处，忽然透过"
    ],
    "pitfalls": [
      "口头说生死——说生死事大而心不切，此是口头禅",
      "急求开悟——以生死为压力反而急躁，须任运自然",
      "忽视教理——生死心切非盲目参究，须先明禅宗宗旨"
    ],
    "classicRef": "《大慧语录》",
    "relatedConcepts": ["yiqing", "kanhua-chan-concept", "canjiu"],
    "relatedPersons": ["dahui-zonggao"],
    "relatedBooks": ["dahuiyulu", "changuancejin"]
  },
  {
    "id": "po-wo-zhi",
    "title": "破我执",
    "category": "禅修法门",
    "summary": "大慧宗杲以为参禅之最大障碍即是我执——以意识分别心参禅，终不离我见。看话禅之要，即以疑情截断意识分别，逼拶学人于思量不及处蓦然透脱，由此破除我执。大慧云：尔只管将能与不能、解与不解、同与不同，扫向他方世界，却向不可扫处看。",
    "steps": [
      "提起话头——以无字为所缘",
      "不起分别——莫作有无会、莫作道理会",
      "通身疑团——如吞热铁丸，吐不出咽不下",
      "蓦然爆破——我执顿破，亲见本来"
    ],
    "pitfalls": [
      "以我见参禅——以意识分别思量话头，恰恰与参究相反",
      "执着境界——参究中若有境界现前，不可执着",
      "将悟作解会——悟非理解，不可作道理会"
    ],
    "classicRef": "《大慧语录》",
    "relatedConcepts": ["kanhua-chan-concept", "yiqing", "self-nature"],
    "relatedPersons": ["dahui-zonggao"],
    "relatedBooks": ["dahuiyulu"]
  }
]
'''

content = content[:methods_end] + new_methods + content[methods_end+3:]

# 4. Add new koans before ZEN_KOANS closing ]
# Find ZEN_KOANS end - it's before the FAQ section
koans_end = content.find('}\n\n/* ---- AI')
if koans_end == -1:
    # Try alternative
    koans_end = content.find('}\n]\n\n/* ---- AI')
    if koans_end == -1:
        print("ERROR: Can't find ZEN_KOANS end")
        # Let's search more carefully
        idx = content.find('/* ---- AI')
        print(f"FAQ marker at: {idx}")
        print(f"Context: {content[idx-50:idx+50]}")
        exit(1)

new_koans = '''  },
  {
    "id": "koan-243",
    "question": "一茎草上现琼楼玉殿",
    "answer": "若端的得一回汗出，便向一茎草上现琼楼玉殿。若未端的得一回汗出，纵有琼楼玉殿，却被一茎草盖却。",
    "context": "大慧宗杲举白云端师翁语：若端的得一回汗出也，便向一茎草上现琼楼玉殿。若未端的得一回汗出，纵有琼楼玉殿，却被一茎草盖却。大慧云：一茎草上现琼楼玉殿，决定可信。琼楼玉殿被一茎草盖却，莫被他热谩。",
    "interpretation": "一茎草现琼楼玉殿——悟则一茎草即是琼楼玉殿，一物全彰。琼楼玉殿被一茎草盖却——未悟则琼楼玉殿亦被一茎草遮蔽，不见全体。大慧补一句\\u201c莫被他热谩\\u201d——莫被言语瞒过，须实参实悟。此则体现大慧宗风：不废言句而不死于言句。",
    "master": "大慧宗杲",
    "source": "大慧语录卷第二",
    "relatedConcepts": ["kanhua-chan-concept", "self-nature"],
    "relatedPersons": ["dahui-zonggao"],
    "relatedBooks": ["dahuiyulu"]
  },
  {
    "id": "koan-244",
    "question": "杀人刀活人剑",
    "answer": "杀人须是杀人刀，活人须是活人剑。",
    "context": "大慧宗杲上堂云：杀人须是杀人刀，活人须是活人剑。临济老汉握一柄金刚王宝剑，气冲宇宙，天下横行。既杀得人，须活得人。若杀得人而不能活人，即是死汉。若活得人而不能杀人，即是俗汉。",
    "interpretation": "杀人刀——截断学人知见执着，斩其意识分别。活人剑——活其本命元辰，令其亲见本来面目。须杀活同时：杀其妄而活其真。只杀不活则落断灭，只活不杀则落常见。此为大慧宗风之写照——峻烈痛快而不失慈悲。",
    "master": "大慧宗杲",
    "source": "大慧语录卷第一",
    "relatedConcepts": ["kanhua-chan-concept", "zongfeng"],
    "relatedPersons": ["dahui-zonggao", "linji-yixuan"],
    "relatedBooks": ["dahuiyulu"]
  },
  {
    "id": "koan-245",
    "question": "径山无寸土庄田",
    "answer": "径山无寸土庄田，今夏随宜结众缘。慵论道懒谈禅。拄杖挑来个个圆。不用息心除妄想，大家吃饭了噇眠。",
    "context": "大慧宗杲上堂云：径山无寸土庄田，今夏随宜结众缘。慵论道懒谈禅。拄杖挑来个个圆。不用息心除妄想，大家吃饭了噇眠。噇眠则不无，或若梦中有人索饭钱又作么生。",
    "interpretation": "不用息心除妄想——妄想本空，何须更息？吃饭噇眠——日用即是修行，何须别求？然大慧又追问\\u201c梦中有人索饭钱又作么生\\u201d——日用虽是修行，若在梦中（无明中）仍被业力牵引，则吃饭噇眠又成业障。此则看似轻松，实则深峻：即俗即真，而又不可安于俗。",
    "master": "大慧宗杲",
    "source": "大慧语录卷第一",
    "relatedConcepts": ["self-nature", "ordinary-mind"],
    "relatedPersons": ["dahui-zonggao"],
    "relatedBooks": ["dahuiyulu"]
  }
]
'''

content = content[:koans_end] + new_koans + content[koans_end+3:]

# 5. Add new FAQs before ZEN_FAQS closing ]
# Find the end of ZEN_FAQS array
faqs_end = content.rfind('\n];')
if faqs_end == -1:
    print("ERROR: Can't find ZEN_FAQS end")
    exit(1)

new_faqs = '''  },
  {
    id: 'faq-680',
    question: '大慧宗杲禅师是谁？',
    answer: '大慧宗杲（1089-1163），南宋临济宗杨岐派禅师，宣州宁国人，俗姓奚。十七岁出家，初参曹洞宗湛堂文准，后谒圜悟克勤于汴京天宁寺，因参有句无句话头而大悟，得圜悟印可。一生住持径山、育王等名刹，因主战被秦桧流放衡阳、梅州十六年。赦还后再住径山，道俗归向如初。谥号普觉，塔名宝光。大慧是看话禅的集大成者，对后世禅宗影响深远。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-681',
    question: '《大慧语录》有多少卷？内容结构是什么？',
    answer: '《大慧普觉禅师语录》共三十卷，由弟子蕴闻编集。内容包括：上堂示众（卷一至卷九）、室中机缘、颂古（卷十）、偈颂（卷十一）、赞佛祖（卷十二）、普说（卷十三至卷十八）、法语（卷十九至卷二十四）。其中普说与法语部分最为精要，集中阐述看话禅思想。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-682',
    question: '大慧宗杲为什么要烧《碧岩录》？',
    answer: '大慧宗杲发现学人沉迷于《碧岩录》的文字评唱，以图口捷，反失禅宗直指人心之旨。学人入室下语，多从《碧岩录》中记来，实非有悟。大慧虑其后不明根本，专尚语言，遂将《碧岩录》木刻版烧毁，以救斯弊。此举非毁其书，乃救其弊——文字本身无过，过在学人执文字为禅。',
    relatedBooks: ['dahuiyulu', 'huanwuxinyao'],
  },
  {
    id: 'faq-683',
    question: '看话禅和默照禅有什么区别？',
    answer: '看话禅由大慧宗杲提倡，以参公案话头（如无字）为入门，以疑情截断意识分别，逼拶学人于思量不及处蓦然透脱。默照禅由宏智正觉提倡，以默然静坐为法门，于默中观照本心。大慧痛斥默照禅为枯木死灰、鬼窟里作活计，以为其落入无记空寂。实则二者各有侧重，看话主动逼拶，默照静观本心，皆为禅宗正行。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-684',
    question: '大慧宗杲的看话禅怎么修？',
    answer: '大慧教人：只将一个无字提撕，行住坐卧，穿衣吃饭，屙屎送尿，心心相顾，猛着精彩，守一个无字。日久岁深，打成一片。忽然如吞栗棘蓬，如中毒药丸，吐又吐不出，咽又咽不下。正当恁么时，荡尽从前恶知恶觉。久久纯熟，蓦然爆破，惊天动地。关键在于：不作道理会，不作有无会，只以疑情逼拶到底。',
    relatedBooks: ['dahuiyulu', 'wumenguan'],
  },
  {
    id: 'faq-685',
    question: '大慧宗杲对在家居士有什么修行指导？',
    answer: '大慧法语部分（卷十九至卷二十四）专门示居士修行。大慧强调：修行不离日用，看话头不拘行住坐卧。示清净居士云：佛境界非外境界有相，佛乃自觉圣智之境界。决欲知此境界，不假庄严修证而得，当净意根下无始时来客尘烦恼之染。大慧对居士的指导切合实际，不要求离俗出家，而在日用中看话头、起疑情。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-686',
    question: '"杀人须是杀人刀，活人须是活人剑"是什么意思？',
    answer: '此为大慧宗杲宗风之写照。杀人刀——截断学人知见执着，斩其意识分别。活人剑——活其本命元辰，令其亲见本来面目。须杀活同时：杀其妄而活其真。只杀不活则落断灭，只活不杀则落常见。大慧承临济宗风，棒喝交施，杀活自在。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-687',
    question: '大慧宗杲与圜悟克勤是什么关系？',
    answer: '大慧宗杲是圜悟克勤的嗣法弟子。大慧初参曹洞宗湛堂文准，湛堂去世后，大慧谒丞相张商英，求准塔铭。后参圜悟克勤于汴京天宁寺，因参有句无句话头而大悟，圜悟印可，以临济正宗付之。圜悟以《碧岩录》付大慧，令掌记室。大慧虽后来焚毁《碧岩录》刻板，但始终尊圜悟为师，其看话禅亦承圜悟之教而来。',
    relatedBooks: ['dahuiyulu', 'huanwuxinyao', 'huanwuyulu'],
  },
  {
    id: 'faq-688',
    question: '《大慧语录》中的普说和法语有什么区别？',
    answer: '普说是普集大众的开示，较为系统，针对普遍性问题阐述禅法原理。法语是针对个人的书面开示，通常以书信形式，针对具体学人的具体修行问题而答。普说如课堂讲授，法语如个别辅导。大慧语录中普说（卷十三至十八）集中阐述看话禅原理，法语（卷十九至二十四）则指导具体修行方法。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-689',
    question: '大慧宗杲为什么被流放？',
    answer: '大慧宗杲因与主战派张九成往来密切，又常在开示中议论时政，遭秦桧忌恨。绍兴十一年（1141），秦桧以鼓动反对和议为由，褫夺大慧衣牒，流放衡州（今湖南衡阳），后移梅州（今广东梅县）。流放十六年间，大慧虽处逆境而道心不退，随缘度众，四方学者云集。绍兴二十六年（1156）赦还，重住径山，道俗归向如初。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-690',
    question: '"不用息心除妄想，大家吃饭了噇眠"是何意？',
    answer: '此为大慧宗杲上堂偈。不用息心除妄想——妄想本空，何须更息？若起心息妄，则妄上加妄。大家吃饭了噇眠——日用即是修行，穿衣吃饭、困来睡觉，皆是禅。然大慧又追问：梦中有人索饭钱又作么生？——日用虽是修行，若在无明中仍被业力牵引，则吃饭噇眠又成业障。看似轻松，实则深峻。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-691',
    question: '《大慧语录》适合什么人读？',
    answer: '此语录适合三类人：一是有禅修基础者，可循看话禅之原理深入参究；二是对禅宗思想感兴趣者，可借此了解宋代禅宗宗风与看话默照之辨；三是在家修行者，法语部分对居士修行有具体指导。建议先读普说部分了解看话禅原理，再读法语部分对照自身修行。语录中机锋用语较多，可配合 glossary 生僻字词表阅读。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-692',
    question: '大慧宗杲对文字禅是什么态度？',
    answer: '大慧宗杲痛斥文字禅——学人沉迷语言文字，以知解为悟，以口捷为能。大慧焚毁《碧岩录》刻板，正是为了救文字禅之弊。但大慧并非完全否定文字——其自身语录即以文字流传。大慧之意：文字是指月之指，因指见月则可，执指为月则不可。参禅须以实参实悟为宗，文字仅为助缘。',
    relatedBooks: ['dahuiyulu', 'changuancejin'],
  },
  {
    id: 'faq-693',
    question: '大慧宗杲的疑情与一般疑惑有什么不同？',
    answer: '大慧所倡疑情非一般疑惑。一般疑惑是犹豫不决、心有旁骛。疑情是穷追不舍、一心一意——如猫捕鼠、如鸡孵卵，不杂用心。疑情如石头堵在胸口，吐不出、咽不下，非弄明白不可。大疑大悟，小疑小悟，不疑不悟。疑情是参禅的动力——以一疑逼拶到底，疑到极处，便是悟时。',
    relatedBooks: ['dahuiyulu', 'changuancejin'],
  },
  {
    id: 'faq-694',
    question: '大慧语录中的颂古是什么体裁？',
    answer: '颂古是禅宗特有的诗偈体裁，以诗偈吟咏古则公案。大慧语录卷十为颂古部分，以诗偈吟咏世尊降生、达磨面壁、赵州狗子等古则。颂古不同于评唱——评唱以散文解说公案，颂古以诗境暗示悟境。言在意外，意在言外。读颂古不可作道理会，须透过诗偈文字，体会其中悟境。',
    relatedBooks: ['dahuiyulu'],
  },
  {
    id: 'faq-695',
    question: '大慧宗杲如何看待修行与悟道的关系？',
    answer: '大慧主张顿悟渐修——悟须实悟，不可作道理会；修须实修，不可只尚口说。大慧云：参须实参，悟须实悟。又云：道无不在，何处不通？只为有心，便成隔碍。大慧以为，修行不是积累知识，而是以疑情截断意识分别，于思量不及处蓦然透脱。悟后犹须保任磨炼，非一悟即了。',
    relatedBooks: ['dahuiyulu', 'changuancejin'],
  }
];
'''

content = content[:faqs_end] + new_faqs + content[faqs_end+3:]

# Save
with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('taxonomy.ts 更新完成')
print(f'新增概念: 4 (fen-biyanlu, zongfeng, pu-shuo, fa-yu)')
print(f'新增法门: 2 (can-shengsi, po-wo-zhi)')
print(f'新增公案: 3 (koan-243 至 koan-245)')
print(f'新增FAQ: 16 (faq-680 至 faq-695)')
print(f'更新人物: dahui-zonggao relatedBooks 添加 dahuiyulu')
