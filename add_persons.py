import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

person_section = content.split('ZEN_PERSONS')[1].split('ZEN_CONCEPTS')[0]
existing_names = set(re.findall(r'"name": "([^"]+)"', person_section))
existing_ids = set(re.findall(r'"id": "([^"]+)"', person_section))

# Truly missing persons (not just shortened names)
# These appear in the 44 classics and are Zen-relevant
missing_persons = [
    # id, name, title, era, lifeStory, teachings, quotes, classics, relatedConcepts, relatedMethods, relatedPersons, relatedBooks
    {
        "id": "huqiu-shaolong",
        "name": "虎丘绍隆",
        "title": "圆悟克勤法嗣 / 临济宗杨岐派",
        "era": "北宋 (1077-1136)",
        "lifeStory": "绍隆禅师，和州（今安徽和县）人，俗姓袁。少出家，初参长芦崇信，后参圆悟克勤，于克勤座下开悟。师住苏州虎丘山，大弘临济宗杨岐派宗风。师为圆悟克勤之得意门人，克勤以\u201c吾有正法眼藏\u201d付之。师之教以\u201c峻烈\u201d为宗，承圆悟\u201c金刚圈、栗棘蓬\u201d之施设，机锋险绝。门下出应庵昙华，华出密庵咸杰，咸杰出破庵祖先、无准师范——临济宗虎丘派由此传承不绝。",
        "teachings": "虎丘宗风承圆悟之\u201c逼拶\u201d，以峻烈机锋接人，不假方便。其传承为圆悟→虎丘→应庵→密庵→破庵→无准，为临济宗主流传承之一。",
        "quotes": ["要行便行，要坐便坐。"],
        "classics": [],
        "relatedConcepts": ["koan", "self-nature"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["yuanwu-keqin"],
        "relatedBooks": ["huanwuyulu"]
    },
    {
        "id": "xuedou-zhongxian",
        "name": "雪窦重显",
        "title": "雪窦颂古作者 / 云门宗",
        "era": "北宋 (980-1052)",
        "lifeStory": "重显禅师，遂宁（今四川遂宁）人，俗姓李。少出家，参智门光祚，于光祚座下开悟。师住明州雪窦山（今浙江奉化），大弘云门宗风。师集古德公案百则，各加颂古，编成《雪窦颂古》百则——后经圆悟克勤加以评唱，成《碧岩录》十卷，为禅宗公案评唱之集大成者。师以\u201c文采华丽\u201d著称，其颂古文辞优美，意蕴深远，为禅宗文学之巅峰。宋仁宗赐号\u201c明觉大师\u201d。",
        "teachings": "雪窦宗风承云门\u201c涵盖乾坤\u201d之旨，以颂古为施设：以诗意语言诠释公案，于文采中显禅机。其颂古为圆悟克勤《碧岩录》之基础，对后世公案参究影响深远。",
        "quotes": ["透网金鳞犹滞水，回途妙触独惊神。"],
        "classics": ["雪窦颂古"],
        "relatedConcepts": ["koan", "beyond-words"],
        "relatedMethods": [],
        "relatedPersons": ["yuanwu-keqin", "yunmen-wenyan"],
        "relatedBooks": ["huanwuyulu"]
    },
    {
        "id": "touzi-datong",
        "name": "投子大同",
        "title": "唐代禅宗高僧 / 投子山",
        "era": "唐代 (819-914)",
        "lifeStory": "大同禅师，本姓刘，舒州（今安徽潜山）人。少出家，参翠微无学，于无学座下开悟。师住舒州投子山，大弘禅宗宗旨。师以\u201c投子\u201d闻名禅史，赵州从谂曾来访，问\u201c投子来这里否？\u201d师曰\u201c来\u201d。赵州曰\u201c莫是圣否？\u201d师曰\u201c是\u201d。赵州曰\u201c既是圣，为什么来这里？\u201d师曰\u201c为你所以来\u201d。师之教以\u201c直指\u201d为宗，不尚玄妙，于平常语中示禅机。",
        "teachings": "投子宗风以\u201c直指\u201d为要：不假方便，不立玄妙，于寻常问答中令学人悟道。其与赵州之对答，为禅宗公案之经典。",
        "quotes": ["为你所以来。 —答赵州问"],
        "classics": [],
        "relatedConcepts": ["koan", "ordinary-mind"],
        "relatedMethods": [],
        "relatedPersons": ["zhaozhou"],
        "relatedBooks": ["chanlinbaoxun"]
    },
    {
        "id": "shide",
        "name": "拾得",
        "title": "唐代禅僧 / 寒山拾得",
        "era": "唐代 (约8-9世纪)",
        "lifeStory": "拾得禅师，生平不详，相传为天台山国清寺丰干禅师拾得之孤儿，故名\u201c拾得\u201d。与寒山为友，二人于天台山隐修，时人称为\u201c寒山拾得\u201d。师与寒山之诗偈，以通俗语言阐述禅宗\u201c即心即佛\u201d之旨，为禅宗文学之瑰宝。后人尊为\u201c和合二仙\u201d，象征和谐与自在。师之教以\u201c无求\u201d为宗：不求佛，不求法，于日用中逍遥自在。",
        "teachings": "拾得之教，以\u201c无求\u201d为宗：于日用中逍遥自在，不假修行。其诗偈以通俗语言示禅机，示禅宗\u201c平常心是道\u201d之旨。",
        "quotes": ["无去无来本湛然，不居内外及中间。"],
        "classics": [],
        "relatedConcepts": ["ordinary-mind", "self-nature"],
        "relatedMethods": [],
        "relatedPersons": ["hanshan"],
        "relatedBooks": ["dongshanyulu"]
    },
    {
        "id": "wuzhun-shifan",
        "name": "无准师范",
        "title": "宋代禅宗高僧 / 临济宗杨岐派",
        "era": "南宋 (1177-1249)",
        "lifeStory": "师范禅师，剑州（今四川剑阁）人，俗姓雍。少出家，参破庵祖先，于祖先座下开悟。师住径山（今浙江杭州），大弘临济宗杨岐派宗风。师为临济宗虎丘派之重要传人，承圆悟→虎丘→应庵→密庵→破庵之传承。门下弟子众多，日本禅宗之径山派即由师之门人传入。师之教以\u201c逼拶\u201d为宗，承临济\u201c棒喝\u201d之传统，机锋峻烈。",
        "teachings": "无准宗风承临济棒喝之传统，以\u201c逼拶\u201d为宗：直以峻烈机锋逼学人至无回避处，令其亲见本来。",
        "quotes": ["参禅无秘诀，只要生死心切。"],
        "classics": [],
        "relatedConcepts": ["koan", "self-nature"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["poan-zuxian"],
        "relatedBooks": ["chanlinbaoxun"]
    },
    {
        "id": "zhongfeng-mingben",
        "name": "中峰明本",
        "title": "元代禅宗高僧 / 临济宗",
        "era": "元代 (1263-1323)",
        "lifeStory": "明本禅师，钱塘（今浙江杭州）人，俗姓孙。少出家，参高峰原妙，于原妙座下开悟。师不住寺院，随处结庵而居，世称\u201c中峰和尚\u201d。师之教以\u201c参禅无秘诀，只要生死心切\u201d为宗，承临济看话禅之传统。师与赵孟頫交游甚密，赵孟頫从之参禅。师著《天目中峰和尚广录》，以禅净合流为特色，对元代禅宗影响深远。日本禅僧纷纷来华参学于师，师对日本禅宗影响极大。",
        "teachings": "中峰之教，以看话禅为宗，兼融念佛。其教以\u201c生死心切\u201d为根本——参禅须发决定心，以悟为则，不悟不休。师兼融禅净，以禅悟为体，以念佛为用。",
        "quotes": ["参禅无秘诀，只要生死心切。", "一念不生，前后际断。"],
        "classics": [],
        "relatedConcepts": ["koan", "self-nature"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["gaofeng-yuanmiao"],
        "relatedBooks": ["changuancejin"]
    },
    {
        "id": "gaofeng-yuanmiao",
        "name": "高峰原妙",
        "title": "元代禅宗高僧 / 临济宗",
        "era": "南宋元 (1238-1295)",
        "lifeStory": "原妙禅师，吴江（今江苏苏州）人，俗姓徐。少出家，参雪岩祖钦，于祖钦座下开悟。师住天目山（今浙江临安），于山顶结死关，二十年不下山，世称\u201c高峰和尚\u201d。师之教以\u201c万法归一，一归何处\u201d为话头，承临济看话禅之传统。门下出中峰明本，为元代禅宗之代表。师之\u201c死关\u201d示禅僧应以生死大事为重，不慕世俗名利。",
        "teachings": "高峰宗风以\u201c万法归一，一归何处\u201d为话头，逼拶学人于一字上透脱一切知见。其\u201c死关\u201d之举，示参禅须以生死为念，发决定心，不悟不休。",
        "quotes": ["万法归一，一归何处？", "参禅须透生死关。"],
        "classics": [],
        "relatedConcepts": ["koan", "self-nature"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["xueyan-zuqin", "zhongfeng-mingben"],
        "relatedBooks": ["changuancejin"]
    },
    {
        "id": "zhenjing-kewen",
        "name": "真净克文",
        "title": "宋代禅宗高僧 / 临济宗黄龙派",
        "era": "北宋 (1025-1102)",
        "lifeStory": "克文禅师，陕府（今河南陕县）人，俗姓郑。少出家，参黄龙慧南，于慧南座下开悟。师住洞山、圣寿等寺，大弘临济宗黄龙派宗风。师与苏辙交游甚密，苏辙从之参禅。师之教以\u201c直指\u201d为宗，承黄龙慧南\u201c三关\u201d之施设，于峻烈机锋中令学人悟道。师为黄龙派之重要传人，门下弟子众多。",
        "teachings": "真净宗风承黄龙\u201c三关\u201d之施设，以\u201c直指\u201d为宗：不假方便，直以峻烈机锋逼学人亲见本来。",
        "quotes": ["佛法无多子，只是尔诸人不会。"],
        "classics": [],
        "relatedConcepts": ["koan", "self-nature"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["huanglong-huinan"],
        "relatedBooks": ["chanlinbaoxun"]
    },
    {
        "id": "xueyan-zuqin",
        "name": "雪岩祖钦",
        "title": "宋代禅宗高僧 / 临济宗",
        "era": "南宋 (1215-1287)",
        "lifeStory": "祖钦禅师，婺州（今浙江金华）人，俗姓某。少出家，参无准师范，于师范座下开悟。师住雪岩山（今浙江），大弘临济宗风。门下出高峰原妙，为元代禅宗之代表。师之教以\u201c看话头\u201d为宗，承临济看话禅之传统，以\u201c万法归一\u201d为话头逼拶学人。",
        "teachings": "雪岩宗风承临济看话禅之传统，以\u201c万法归一，一归何处\u201d为话头，逼拶学人于一字上透脱一切知见。",
        "quotes": ["万法归一，一归何处？"],
        "classics": [],
        "relatedConcepts": ["koan"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["wuzhun-shifan", "gaofeng-yuanmiao"],
        "relatedBooks": ["changuancejin"]
    },
    {
        "id": "poan-zuxian",
        "name": "破庵祖先",
        "title": "宋代禅宗高僧 / 临济宗",
        "era": "南宋 (1136-1211)",
        "lifeStory": "祖先禅师，广安（今四川广安）人。少出家，参密庵咸杰，于咸杰座下开悟。师住破庵（今浙江），大弘临济宗风。门下出无准师范，为南宋禅宗之代表。师之教以\u201c峻烈\u201d为宗，承临济棒喝之传统。",
        "teachings": "破庵宗风承临济棒喝之传统，以峻烈机锋接人，不假方便。",
        "quotes": ["参禅须是铁汉。"],
        "classics": [],
        "relatedConcepts": ["koan"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["wuzhun-shifan"],
        "relatedBooks": ["changuancejin"]
    },
    {
        "id": "foyin-liaoyuan",
        "name": "佛印了元",
        "title": "宋代禅僧 / 与苏轼交游",
        "era": "北宋 (1032-1098)",
        "lifeStory": "了元禅师，饶州（今江西波阳）人，俗姓林。少出家，参开先善暹，于善暹座下开悟。师住庐山（今江西九江）、金山（今江苏镇江）等寺，大弘云门宗风。师与苏轼、苏辙兄弟交游甚密，苏轼从之参禅，留下诸多佳话。师以\u201c文采\u201d著称，以诗文入禅，为北宋\u201c士大夫禅\u201d之重要推动者。宋神宗赐号\u201c佛印禅师\u201d。",
        "teachings": "佛印之教，以诗文入禅，于文采中显禅机。其与苏轼之交往，为禅宗与文人结合之典范，示禅宗\u201c道在日用\u201d之旨。",
        "quotes": ["一切有为法，如梦幻泡影。"],
        "classics": [],
        "relatedConcepts": ["ordinary-mind", "emptiness"],
        "relatedMethods": [],
        "relatedPersons": ["huangtingjian"],
        "relatedBooks": ["chanlinbaoxun"]
    },
    {
        "id": "niaoke-daolin",
        "name": "鸟窠道林",
        "title": "唐代禅僧 / 鸟窠禅师",
        "era": "唐代 (741-824)",
        "lifeStory": "道林禅师，本姓潘，富阳（今浙江富阳）人。少出家，参径山道钦，于道钦座下开悟。师住杭州秦望山，于松树上结巢而居，世称\u201c鸟窠禅师\u201d。白居易为杭州太守时，常入山参访。白居易问\u201c如何是佛法大意？\u201d师曰\u201c诸恶莫作，众善奉行\u201d。白居易曰\u201c三岁孩童也道得\u201d。师曰\u201c三岁孩童虽道得，八十老翁行不得\u201d。此语为禅宗\u201c知行合一\u201d之经典开示。",
        "teachings": "鸟窠之教，以\u201c诸恶莫作，众善奉行\u201d为宗：佛法不在玄妙，在于日用践行。其\u201c行不得\u201d之语，示禅宗\u201c说一丈不如行一寸\u201d之旨。",
        "quotes": ["诸恶莫作，众善奉行。 —答白居易问", "三岁孩童虽道得，八十老翁行不得。"],
        "classics": [],
        "relatedConcepts": ["ordinary-mind", "self-nature"],
        "relatedMethods": [],
        "relatedPersons": [],
        "relatedBooks": ["huanwuxinyao"]
    },
    {
        "id": "sheli-fu",
        "name": "舍利弗",
        "title": "佛陀十大弟子 / 智慧第一",
        "era": "古印度 (约公元前6-5世纪)",
        "lifeStory": "舍利弗，梵语 Śāriputra，佛陀十大弟子之一，智慧第一。原为外道删阇耶弟子，后闻马胜比丘说因缘偈而皈依佛陀。于佛弟子中智慧最为第一，常代佛陀答覆问难。《心经》中观自在菩萨为舍利弗说般若波罗蜜多，示\u201c色不异空，空不异色\u201d之旨。禅宗之般若智慧，可追溯至舍利弗之智慧传统。",
        "teachings": "舍利弗之智慧，以照见诸法实相为宗。其于《心经》中为观自在菩萨所开示之般若法门，为禅宗\u201c直指人心\u201d之教理基础。",
        "quotes": ["色不异空，空不异色；色即是空，空即是色。 —《心经》"],
        "classics": [],
        "relatedConcepts": ["prajna", "emptiness"],
        "relatedMethods": [],
        "relatedPersons": [],
        "relatedBooks": ["xinjing", "lengyanjing", "weimojiejing"]
    },
    {
        "id": "mulian",
        "name": "目犍连",
        "title": "佛陀十大弟子 / 神通第一",
        "era": "古印度 (约公元前6-5世纪)",
        "lifeStory": "目犍连，梵语 Mahāmaudgalyāyana，佛陀十大弟子之一，神通第一。与舍利弗同为外道删阇耶弟子，后同皈依佛陀。于佛弟子中神通最为第一，能以天眼通观三千大千世界。《楞严经》中目犍连自述圆通法门\u201c旋湛心光发宣，如澄浊水久成清莹\u201d，为禅观之重要开示。",
        "teachings": "目犍连之神通，以心光旋湛为根本：神通不从外得，乃心性本具之妙用。其于《楞严经》所示之圆通法门，为禅观之重要参考。",
        "quotes": ["旋湛心光发宣，如澄浊水久成清莹。 —《楞严经》"],
        "classics": [],
        "relatedConcepts": ["samadhi"],
        "relatedMethods": [],
        "relatedPersons": ["sheli-fu"],
        "relatedBooks": ["lengyanjing", "weimojiejing"]
    },
    {
        "id": "zhu-daosheng",
        "name": "竺道生",
        "title": "涅槃经学者 / 顿悟成佛说",
        "era": "东晋 (约360-434)",
        "lifeStory": "道生，本姓魏，钜鹿（今河北平乡）人。少出家，游学长安，从鸠摩罗什受学。师深通般若，又精涅槃，首倡\u201c顿悟成佛\u201d之说——以为真理不可分，悟理必顿。时人斥为异端，师遂发誓言\u201c若我所说反于经义者，请现身疬疾；若实契佛意，愿舍寿时据师子座\u201d。后《大般涅槃经》全本传至建康，果如师说，时人始服。师又立\u201c一阐提皆有佛性\u201d之说，亦为后出涅槃经所印证。师之顿悟说，为后世禅宗\u201c顿悟见性\u201d之先导。",
        "teachings": "道生之教，以\u201c顿悟成佛\u201d为宗：真理不可分，悟理必顿，非渐次可至。此说为禅宗顿悟法门之理论先导。",
        "quotes": ["夫象以尽意，得意则象忘。", "一阐提皆有佛性。"],
        "classics": [],
        "relatedConcepts": ["instant-enlightenment", "buddha-nature"],
        "relatedMethods": [],
        "relatedPersons": ["nagarjuna"],
        "relatedBooks": ["lengyanjing", "weimojiejing"]
    },
    {
        "id": "zhenxie-qingliao",
        "name": "真歇清了",
        "title": "宋代禅宗高僧 / 曹洞宗",
        "era": "北宋 (1088-1151)",
        "lifeStory": "清了禅师，安州（今四川安县）人，俗姓雍。少出家，参丹霞子淳，于子淳座下开悟。师住长芦（今江苏南京）、真歇（今浙江）等寺，大弘曹洞宗风。师为曹洞宗之重要传人，承丹霞子淳→宏智正觉之传承。师之教以\u201c默照\u201d为宗，承曹洞宗\u201c回互\u201d之旨，于绵密细致中令学人悟道。",
        "teachings": "真歇宗风承曹洞\u201c默照\u201d之旨，以绵密细致为特色：不尚峻烈机锋，于静坐默照中令学人自悟。",
        "quotes": ["不动如山，明静如水。"],
        "classics": [],
        "relatedConcepts": ["samadhi", "self-nature"],
        "relatedMethods": ["mozhao"],
        "relatedPersons": ["danxia-zichun", "hongzhi-zhengjue"],
        "relatedBooks": ["lengyanjing"]
    },
    {
        "id": "tianyi-yihuai",
        "name": "天衣义怀",
        "title": "宋代禅宗高僧 / 云门宗",
        "era": "北宋 (993-1064)",
        "lifeStory": "义怀禅师，永嘉（今浙江温州）人，俗姓陈。少出家，参雪窦重显，于重显座下开悟。师住天衣山（今浙江绍兴），大弘云门宗风。师为雪窦重显之得意门人，承云门宗\u201c涵盖乾坤\u201d之旨。师之教以\u201c直指\u201d为宗，于平常语中示禅机。",
        "teachings": "天衣宗风承云门\u201c涵盖乾坤\u201d之旨，以直指为宗：不假方便，于寻常语中令学人悟道。",
        "quotes": ["佛法无多子。"],
        "classics": [],
        "relatedConcepts": ["koan"],
        "relatedMethods": [],
        "relatedPersons": ["xuedou-zhongxian"],
        "relatedBooks": ["chanlinbaoxun"]
    },
    {
        "id": "kaifu-daoning",
        "name": "开福道宁",
        "title": "五祖法演弟子 / 临济宗杨岐派",
        "era": "北宋 (1059-1114)",
        "lifeStory": "道宁禅师，五祖法演弟子，与圆悟克勤、佛眼清远、太平慧懑并称\u201c五祖四佛\u201d。师住开福寺（今湖南长沙），大弘临济宗杨岐派宗风。师之教以\u201c峻烈\u201d为特色，承五祖法演\u201c逼拶\u201d之旨，机锋险绝。",
        "teachings": "开福宗风承五祖\u201c逼拶\u201d之旨，以峻烈机锋接人，不留情面。",
        "quotes": ["参禅须是铁汉。"],
        "classics": [],
        "relatedConcepts": ["koan"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["wuzu-fayan", "yuanwu-keqin"],
        "relatedBooks": ["chanlinbaoxun"]
    },
    {
        "id": "fojian-huiqin",
        "name": "佛鉴慧勤",
        "title": "五祖法演弟子 / 临济宗杨岐派",
        "era": "北宋 (1059-1117)",
        "lifeStory": "慧勤禅师，五祖法演弟子，与圆悟克勤、佛眼清远并称\u201c五祖三佛\u201d。师住太平州（今安徽当涂），大弘临济宗杨岐派宗风。师之教以\u201c直指\u201d为宗，承五祖法演之旨，于平常语中示禅机。",
        "teachings": "佛鉴宗风承五祖\u201c逼拶\u201d之旨，以直指为宗，不假方便。",
        "quotes": ["佛法无多子。"],
        "classics": [],
        "relatedConcepts": ["koan"],
        "relatedMethods": ["kanhuatou"],
        "relatedPersons": ["wuzu-fayan", "yuanwu-keqin"],
        "relatedBooks": ["chanlinbaoxun"]
    },
]

# Check for ID conflicts
for p in missing_persons:
    if p["id"] in existing_ids:
        print(f'WARNING: ID conflict: {p["id"]}')
    if p["name"] in existing_names:
        print(f'WARNING: Name conflict: {p["name"]}')

print(f'New persons to add: {len(missing_persons)}')
for p in missing_persons:
    print(f'  {p["id"]}: {p["name"]} ({p["era"]})')

# Generate TypeScript entries
entries = []
for p in missing_persons:
    quotes_str = ', '.join([f'"{q}"' for q in p["quotes"]])
    classics_str = ', '.join([f'"{c}"' for c in p["classics"]])
    concepts_str = ', '.join([f'"{c}"' for c in p["relatedConcepts"]])
    methods_str = ', '.join([f'"{m}"' for m in p["relatedMethods"]])
    persons_str = ', '.join([f'"{pn}"' for pn in p["relatedPersons"]])
    books_str = ', '.join([f'"{b}"' for b in p["relatedBooks"]])
    
    entry = f'''  {{
    "id": "{p["id"]}",
    "name": "{p["name"]}",
    "title": "{p["title"]}",
    "era": "{p["era"]}",
    "lifeStory": "{p["lifeStory"]}",
    "teachings": "{p["teachings"]}",
    "quotes": [{quotes_str}],
    "classics": [{classics_str}],
    "relatedConcepts": [{concepts_str}],
    "relatedMethods": [{methods_str}],
    "relatedPersons": [{persons_str}],
    "relatedBooks": [{books_str}]
  }}'''
    entries.append(entry)

# Find insertion point: before the closing ]; of ZEN_PERSONS
# The last entry ends with } and then ]; 
# We need to add a comma after the last entry and insert new ones

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of ZEN_PERSONS array
persons_end = content.find('];', content.find('ZEN_PERSONS'))
# Find the last } before ];
# Go backwards from persons_end to find the last }
last_brace = content.rfind('}', 0, persons_end)
# Check if there's already a comma after it
insertion = ',\n' + ',\n'.join(entries)

new_content = content[:last_brace+1] + insertion + content[last_brace+1:]

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'\nAdded {len(missing_persons)} new persons to taxonomy.ts')
print(f'Total persons now: {len(existing_ids) + len(missing_persons)}')
