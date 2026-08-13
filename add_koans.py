import re

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find max koan number
koan_section = content.split('ZEN_KOANS')[1].split('export interface FAQItem')[0]
koan_nums = [int(m) for m in re.findall(r'"id": "koan-(\d+)"', koan_section)]
max_koan = max(koan_nums)
print(f'Current max koan: koan-{max_koan}, total: {len(koan_nums)}')

# New koans to add - from the 21 classics that have no koans
new_koans = [
    # qifo - 七佛传法偈
    {"id": "koan-219", "question": "毗婆尸佛偈曰：\u201c身从无相中受生，犹如幻出诸形像。幻人心识本来无，罪福皆空无所住。\u201d此偈何意？", "answer": "身从无相中受生——身本无相，从妄想中受生，如幻化人。心识本来空寂，罪福皆不可得。此示万法缘起性空之旨。", "context": "毗婆尸佛传法偈。过去七佛各说一偈，明万法性空之旨。", "relatedQa": "faq-1", "relatedBooks": ["qifo"]},
    {"id": "koan-220", "question": "释迦牟尼佛偈曰：\u201c法本法无法，无法法亦法。今付无法时，法法何曾法。\u201d此偈何意？", "answer": "法本无法——法之本性是空，故曰\u201c法无法\u201d。虽曰无法，此\u201c无法\u201d亦是法，故曰\u201c无法法亦法\u201d。今付此无法之法时，法法何曾有一法可得？此示传法实无所传之旨。", "context": "释迦牟尼佛传法偈，为七佛传法偈之最后一首，明传法实无所传。", "relatedQa": "faq-1", "relatedBooks": ["qifo"]},
    
    # juelin - 绝观论
    {"id": "koan-221", "question": "《绝观论》问：\u201c云何为心？\u201d答：\u201c不生不灭。\u201d又问：\u201c既不生不灭，何名心？\u201d答：\u201c以不生不灭故，名之为心。\u201d此段何意？", "answer": "心本不生不灭，非从因缘生，亦非从因缘灭。以不生不灭故，名之为心。若生灭则有来去，有来去则非心。此示真心本无生灭之旨。", "context": "《绝观论》以问答形式直指心性，明心本不生不灭。", "relatedQa": "faq-10", "relatedBooks": ["juelin"]},
    
    # wenshu - 文殊说般若经
    {"id": "koan-222", "question": "文殊师利白佛言：\u201c世尊，云何名一行三昧？\u201d佛言：\u201c法界一相，系缘法界，是名一行三昧。\u201d何谓一行三昧？", "answer": "一行三昧者，系心于一法界，不生分别。法界一相，即无相。于无相中系缘，即是一行。此为四祖道信念佛禅之所依。", "context": "《文殊说般若经》中佛为文殊说一行三昧，为禅宗念佛禅之教理依据。", "relatedQa": "faq-20", "relatedBooks": ["wenshu"]},
    
    # wuran - 无心论
    {"id": "koan-223", "question": "问：\u201c既云无心，谁能说法？\u201d答：\u201c无心即是说法。若有心即不名说法。\u201d此段何意？", "answer": "无心即是说法——有心则有能所，能所对立则非真说法。无心说法，如空谷回声，如镜照物，应而无形。此示无心之妙用。", "context": "《无心论》以问答明无心之旨，无心非死寂，而是无住生心。", "relatedQa": "faq-30", "relatedBooks": ["wuran"]},
    
    # zhangzhi - 观心论
    {"id": "koan-224", "question": "问：\u201c云何名观心？\u201d答：\u201c观心者，观自心也。自心本净，因境生念。但观此念起处，即见自心。\u201d此段何意？", "answer": "观心非观外境，而是观自心起念之处。念起即观，观即无念。于念起处见自心本净，即是观心。此为禅宗内观之根本法门。", "context": "《观心论》明观心之方法：观念起处，即见自心。", "relatedQa": "faq-40", "relatedBooks": ["zhangzhi"]},
    
    # wuxinglun - 五行论
    {"id": "koan-225", "question": "问：\u201c五行之中，何为究竟？\u201d答：\u201c五行皆方便，唯止观为究竟。前四门为助行，止观为正行。\u201d此段何意？", "answer": "施、戒、忍、进四门为助行，止观为正行。前四门积集福德资粮，止观开发智慧。福慧双修，方名究竟。此示禅宗止观并重之旨。", "context": "《五行论》明五种修行，以止观为根本。", "relatedQa": "faq-50", "relatedBooks": ["wuxinglun"]},
    
    # poxianglun - 破相论
    {"id": "koan-226", "question": "问：\u201c云何破相？\u201d答：\u201c相本无相，破无所破。若执有相可破，即是被相所缚。但了相本空，即是破相。\u201d此段何意？", "answer": "相本无相——万法之相从因缘生，无有自性，故曰无相。破相非灭相，而是了达相本空。若执有相可破，即被相缚。此示破相实无所破之旨。", "context": "《破相论》明破相之方法：了相本空，即名破相。", "relatedQa": "faq-60", "relatedBooks": ["poxianglun"]},
    
    # wuxinlun - 无心论
    {"id": "koan-227", "question": "问：\u201c无心与有心何异？\u201d答：\u201c无心即真心，有心即妄心。真心无心而无不知，妄心有心而全属分别。\u201d此段何意？", "answer": "真心无心——无妄念分别，而灵知不昧。妄心有心——有念有相，全属分别。无心非木石无知，而是无妄念之真心。此示真心与妄心之别。", "context": "《无心论》明无心即真心，有心即妄心。", "relatedQa": "faq-70", "relatedBooks": ["wuxinlun"]},
    
    # xixulun - 息诤论
    {"id": "koan-228", "question": "问：\u201c云何息诤？\u201d答：\u201c诤从分别起，无分别即无诤。但了诸法本空，诤自息灭。\u201d此段何意？", "answer": "诤论从分别心生——有分别则有是非，有是非则有诤。了达诸法本空，分别自灭，诤亦自息。此示无诤三昧之旨。", "context": "《息诤论》明息诤之方法：了诸法本空，分别自灭。", "relatedQa": "faq-80", "relatedBooks": ["xixulun"]},
    
    # sixingguan - 四行观
    {"id": "koan-229", "question": "达摩大师说报冤行：\u201c修道人若受苦时，当自念言：我往昔无数劫中，弃本从末，流浪诸有，多起冤憎，违害无限。今虽无犯，是我宿殃，恶业果熟，非天非人所能见与，甘心忍受，都无冤诉。\u201d此何意？", "answer": "达摩四行之第一行——报冤行。受苦时不怨天尤人，了知皆是宿业果报，甘心忍受。此为修行之初门：于逆境中不起嗔心，即与道相应。", "context": "达摩大师《四行观》明四种修行：报冤行、随缘行、无所求行、称法行。", "relatedQa": "faq-90", "relatedBooks": ["sixingguan"]},
    
    # xinxinming - 信心铭
    {"id": "koan-230", "question": "《信心铭》曰：\u201c至道无难，唯嫌拣择。但莫憎爱，洞然明白。\u201d此四句何意？", "answer": "至道本不难，唯人自生分别——有憎有爱，有取有舍，即成障碍。但莫憎爱，不生分别，至道自然洞然明白。此为禅宗无分别心之根本纲宗。", "context": "三祖僧璨《信心铭》开篇四句，为禅宗纲宗。", "relatedQa": "faq-100", "relatedBooks": ["xinxinming"]},
    
    # fangcunlun - 方寸论
    {"id": "koan-231", "question": "问：\u201c方寸之间，有何物？\u201d答：\u201c方寸本无一物。若有一物，即非方寸。以无物故，能含万法。\u201d此段何意？", "answer": "方寸即心。心本无一物——若有物则非心。以无物故，能含万法——心如虚空，不碍万象。此示心性本空而能生万法之旨。", "context": "《方寸论》以\u201c方寸\u201d喻心，明心本空而含万法。", "relatedQa": "faq-110", "relatedBooks": ["fangcunlun"]},
    
    # zuishangcheng - 最上乘论
    {"id": "koan-232", "question": "五祖弘忍问：\u201c何名最上乘？\u201d答：\u201c最上乘者，即一心也。一心之外，更无别法。若离一心而求佛法，如缘木求鱼。\u201d此段何意？", "answer": "最上乘即一心——心外无法，法外无心。若离心求法，如缘木求鱼，永不可得。此示禅宗\u201c即心即佛\u201d之究竟旨。", "context": "五祖弘忍《最上乘论》明最上乘即一心。", "relatedQa": "faq-120", "relatedBooks": ["zuishangcheng"]},
    
    # xiuxinjue - 修心诀
    {"id": "koan-233", "question": "普照知讷《修心诀》曰：\u201c心性本净，客尘所染。但离妄念，即同如来。\u201d此段何意？", "answer": "心性本净——真心本来清净。客尘所染——烦恼如客尘，非心本有。但离妄念——去其客尘。即同如来——净心显现，与佛无二。此示禅宗\u201c但离妄念即同如来\u201d之旨。", "context": "高丽普照知讷《修心诀》明修心之要：但离妄念，即同如来。", "relatedQa": "faq-130", "relatedBooks": ["xiuxinjue"]},
    
    # dunwu - 顿悟入道要门论
    {"id": "koan-234", "question": "大珠慧海问：\u201c云何名顿悟？\u201d答：\u201c顿者，顿除妄念；悟者，悟无所得。顿除妄念名顿，悟无所得名悟。顿悟者，即顿除妄念、悟无所得也。\u201d此段何意？", "answer": "顿悟非渐次修行——顿除妄念，一时放下。悟无所得——本来是佛，无所可得。此示禅宗顿悟法门之根本：但除妄念，即同如来。", "context": "大珠慧海《顿悟入道要门论》明顿悟之义。", "relatedQa": "faq-140", "relatedBooks": ["dunwu"]},
    
    # zhenxin - 真心直说
    {"id": "koan-235", "question": "普照知讷《真心直说》曰：\u201c真心者，本来自性清净，不假修成，但离妄缘，即如如佛。\u201d此段何意？", "answer": "真心本自清净——非从修得。但离妄缘——去除妄念因缘。即如如佛——真心显现，本来是佛。此示禅宗\u201c本觉\u201d之旨：修行只是恢复本来，非从外得。", "context": "普照知讷《真心直说》明真心本净，但离妄缘即同如来。", "relatedQa": "faq-150", "relatedBooks": ["zhenxin"]},
    
    # shenhui - 荷泽神会
    {"id": "koan-236", "question": "神会禅师问六祖：\u201c先佛后佛，无有异法，只传一乘。云何一乘？\u201d六祖曰：\u201c一乘者，即一心也。汝若悟一心，即名一乘。\u201d此段何意？", "answer": "一乘即一心——佛佛所传，唯传一心。悟一心即名一乘，非别有一乘可修。此示禅宗\u201c以心传心\u201d之究竟旨。", "context": "荷泽神会参六祖惠能，问一乘之义。", "relatedQa": "faq-160", "relatedBooks": ["shenhui"]},
    
    # shiniutu - 十牛图
    {"id": "koan-237", "question": "廓庵师远《十牛图》第七图\u201c忘牛存人\u201d颂曰：\u201c骑牛已得到家山，牛也空兮人也闲。红日三竿犹作梦，鞭绳空顿草堂间。\u201d此颂何意？", "answer": "忘牛存人——牛喻妄心，已驯伏故忘；人喻觉照，尚存故在。牛空人闲——妄心已息，觉照自在。此示修行至能所初忘之境界：妄心已伏，真心独存。", "context": "廓庵《十牛图》第七图\u201c忘牛存人\u201d，示妄心已伏、真心独存之境界。", "relatedQa": "faq-170", "relatedBooks": ["shiniutu"]},
    
    # baojingsanmei - 宝镜三昧
    {"id": "koan-238", "question": "洞山良价《宝镜三昧》曰：\u201c如临宝镜，形影相睹。汝不是渠，渠正是汝。\u201d此段何意？", "answer": "宝镜喻心。形影相睹——心与境相对，如形与影。汝不是渠——你不是境。渠正是汝——境即是心之显现。此示心境不二、能所一如之旨，为曹洞宗\u201c回互\u201d之根本施设。", "context": "洞山良价《宝镜三昧》以宝镜喻心，明心境不二之旨。", "relatedQa": "faq-180", "relatedBooks": ["baojingsanmei"]},
    
    # yongjia - 永嘉证道歌
    {"id": "koan-239", "question": "永嘉玄觉《证道歌》曰：\u201c梦里明明有六趣，觉后空空无大千。\u201d此句何意？", "answer": "梦里六趣——迷时见六道轮回，历历分明。觉后空空——悟时了达万法本空，大千世界了不可得。此示迷悟之别：迷时万法皆有，悟时万法皆空。", "context": "永嘉玄觉《证道歌》以梦觉喻迷悟，明万法性空之旨。", "relatedQa": "faq-190", "relatedBooks": ["yongjia"]},
    
    # bashiguijusong - 八识规矩颂
    {"id": "koan-240", "question": "玄奘大师《八识规矩颂》曰：\u201c性境现量通三性，眼耳身三二地居。\u201d此句何意？", "answer": "前五识（眼耳鼻舌身）缘性境，以现量了别，通善、恶、无记三性。眼耳身三识在初禅二地尚有，鼻舌二识唯欲界有。此明前五识之活动范围与功能。", "context": "玄奘《八识规矩颂》明八识之规矩，此为前五识颂。", "relatedQa": "faq-200", "relatedBooks": ["bashiguijusong"]},
]

print(f'New koans to add: {len(new_koans)} (koan-{max_koan+1} to koan-{max_koan+len(new_koans)})')

# Generate TS entries
entries = []
for k in new_koans:
    entry = f'''  {{
    "id": "{k["id"]}",
    "question": "{k["question"]}",
    "answer": "{k["answer"]}",
    "context": "{k["context"]}",
    "relatedQa": "{k["relatedQa"]}",
    "relatedBooks": [{", ".join([f'"{b}"' for b in k["relatedBooks"]])}]
  }}'''
    entries.append(entry)

# Find insertion point: end of ZEN_KOANS array
koans_start = content.find('ZEN_KOANS')
koans_end = content.find('];', koans_start)
last_brace = content.rfind('}', 0, koans_end)

insertion = ',\n' + ',\n'.join(entries)
new_content = content[:last_brace+1] + insertion + content[last_brace+1:]

with open('lib/taxonomy.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Added {len(new_koans)} new koans to taxonomy.ts')
print(f'Total koans now: {len(koan_nums) + len(new_koans)}')
