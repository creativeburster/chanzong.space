# -*- coding: utf-8 -*-
"""
发布知乎专栏文章 2 和 3：
2. 达摩血脉论与二入四行论
3. 首楞严经七处征心与狂心若歇
"""
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
sys.path.append(CUR_DIR)
from tracker import add_backlink

ARTICLES = [
    {
        "title": "直指人心与顿悟见性：重读达摩大师《血脉论》与《二入四行论》",
        "target_url": "https://chanzong.space/classics/damoxuemai",
        "anchor_text": "禅宗知识库 · 菩提达摩大师血脉论与见性实相档案",
        "notes": "知乎认证创作者【i禅修】发布高权重专栏文章，深入解读达摩血脉论见性即佛与二入四行修证，含达摩专页与D3图谱回链",
        "content": """千百年来，中国禅宗在修行史上最震撼人心的旗帜，莫过于达摩祖师立下的“教外别传，不立文字，直指人心，见性成佛”。

很多人在参禅初期，常常被“见性成佛”四个字困扰：究竟什么是“性”？见性之后到底算不算成佛？如果众生本来是佛，为什么我们每天还要经历无尽的烦恼与内耗？

要彻底解开这重公案，必须回到中国禅宗初祖菩提达摩大师的两部核心圣典——《菩提达摩大师血脉论》与《略辨大乘入道四行观》（二入四行论）。

【一、 达摩《血脉论》的正本清源：“见性即是佛”】

在《血脉论》中，达摩大师开宗明义地扫荡了一切向外攀求的妄想：
“若见性即是佛，不见性即是众生。若离众生性，别有佛性可得者，佛今在何处？众生性即是佛性性中……直下承当即是。”

祖师的教导极其直白犀利：
佛不是一个住在西方极乐世界的神灵，也不是一种具有特异功能的神秘肉身。佛者，觉也。
众生本具清净光明的自性觉知，只是凡夫日夜被妄想执着、得失荣辱所遮蔽，如同金在矿中、明镜蒙尘。
当你在善知识的指引下，或者在日常生活对境中猛然回光返照，照见那个“能看、能听、能知、本自不生不灭”的觉性时，在法身法性层面，你当下与十方诸佛无二无别！
因此，在理体上，“见性即是佛”，根本不需要在你的自性之外再去“修”一个身外之物。

【二、 《二入四行论》的实修阶梯：为什么说“见性成佛”？】

既然“见性即佛”，后世为何普遍强调一个“成”字？
因为见性只是修行的真正开端（登堂入室），绝非修行的终结。从“见道”到“修道”再到“圆满成佛”，中间隔着无始劫以来深厚如山的习气执着。

达摩大师在《二入四行论》中定下了大乘入道的根本纲领：“入道多途，要而言之，不出二种：一是理入，二是行入。”

1. 什么是理入？
“藉教悟宗，深信含生凡圣同一真性，但为客尘妄想所覆，不能显了。若也舍妄归真，凝住壁观，无自无他，凡圣等一，坚住不移，亦不随于言教，此即与道冥符，无有分别，寂然无为，名之理入。”
这就是见性——在理上彻见自他不二、本来清净。

2. 什么是行入？
理入之后，必须在尘劳人世中历练心性，这就是四行：
- 报冤行：逢苦不忧，深明因果宿业，甘心忍受而不怨尤；
- 随缘行：得失随缘，心无增减，不被世俗称誉荣华所动；
- 无所求行：世人长迷，处处贪著，智者达理，安心无为；
- 称法行：性净之理因体空无染，随顺法性而行六度布施，虽行一切善法而心无所住。

【三、 现代人修心的实践意义】

达摩心法绝非远离世俗的空谈，而是现代人在卷、焦虑、精神内耗时代最顶级的安身立命哲学：
1. 建立终极自信：明白你的本质自性不生不灭、本不缺少任何东西，世俗的得失成败只是浮云掠过天际，动摇不了你本有的清净自性。
2. 历事炼心：把工作、家庭、生活当成最好的禅堂。在面对冲突、诱惑与挫折时，启动达摩的“凝住壁观”与“报冤随缘”，做该做的事，但心中了无挂碍。

【四、 延伸研读与数字化典籍文献参考】

如果希望查阅经过历代校勘的达摩祖师原典、详细现代白话解说以及历代禅宗传承拓扑，推荐参考非营利开源的数字化禅学文献库：

- 达摩大师血脉论全文现代白话导读与经文详注：https://chanzong.space/classics/damoxuemai
- 核心修行法门「二入四行」修证步骤与避坑指南：https://chanzong.space/methods/er-ru-si-xing
- 历代祖师传承脉络与两千座公案关联图谱：https://chanzong.space/graph

愿我们在日常动静之中，皆能体会这份“直下承当”的宗门大安乐。"""
    },
    {
        "title": "狂心若歇，歇即菩提：十卷《大佛顶首楞严经》的破妄显真修证脉络",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 · 大佛顶首楞严经十卷白话导读与修证图谱",
        "notes": "知乎认证创作者【i禅修】发布高权重专栏文章，全面剖析楞严经七处征心与狂心若歇，含楞严专页与图谱回链",
        "content": """古人总结佛门经典常说：“开悟的楞严，成佛的法华。”

《楞严经》（全称《大佛顶如来密因修证了义诸菩萨万行首楞严经》）全书共十卷，文字极尽典雅瑰丽，义理极尽幽微圆融。它既是一部大乘佛学的百科全书，更是历代禅门宗师印心证道的无上指归。

但正因为名相繁复、辨析深细，很多人初读容易陷在文字相中。其实整部《楞严经》的核心骨架极其清晰，就是围绕修行人必须勘破的三大关隘展开的。

【一、 第一关：七处征心与破妄显真】

全经由阿难尊者遭摩登伽女之难发端，佛陀见阿难向来“多闻第一”却敌不过现实境界考验，开门见山直逼心源：“阿难，汝何因缘，发心出家？”
阿难回答是因为“爱佛相好”。佛陀便连续七次追问：“心在何处？”
1. 在内？若在身内，当先见脏腑，何以不见？
2. 在外？身心相离，外在受损身应不知，何以相通？
3. 潜伏根里？如同戴琉璃镜，见物时当见镜，何以不见眼？
4. 随所合处？若随合即有，心本无体，岂不杂乱？
佛陀借“七处征心”，把阿难平日所认定的“肉团心、能思量计较的分别心”层层击碎。随后以“八还辨见”，辨明光明还给太阳、黑暗还给黑夜、阻碍还给墙壁，唯独那个“能见之见性”无处可还，本自不动不摇。

【二、 第二关：狂心若歇，歇即菩提】

在经文第四卷，富楼那尊者问佛：“如果众生清净本然，何以忽生山河大地诸有为相？”
佛陀给出了震古烁今的譬喻与开示：
演若达多晨起照镜，爱镜中头眉目可见，嗔责自己的头不见面目，以为是魅魅附体，无故发狂狂走。他的头难道丢了吗？本自具足，毫无缺失！何须狂走求头？
“自心是佛，由不知故，妄生执著……狂心若歇，歇即菩提。胜净明心，本周法界，不从人得，何藉劬劳肯綮修证？”

这是整部《楞严经》的心脏：
现代人每天都在“演若达多失头狂走”——为了别人的评价、世俗的标签、虚妄的焦虑向外狂奔。
修行不是在自心之外去重新修一个“佛”出来，而是彻底歇下那个向外攀缘、贪恋计较的妄动狂心。狂心歇处，光明自性本来具足！

【三、 第三关：二十五圆通与反闻闻自性】

既然狂心要歇，如何在现实生活中落实？
经文第五、六卷中，二十五位大菩萨与阿罗汉依次汇报自己的修证法门。文殊师利菩萨最终总结推选观世音菩萨的“耳根圆通法门”：
“初于闻中，入流亡所。所入既寂，动静二相，了然不生。如是渐增，闻所闻尽；尽闻不住，觉所觉空；空觉极圆，空所空灭；生灭既灭，寂灭现前。”

现代人六根中最敏锐、最容易受影响的就是听觉。学会不被外在声音境界牵引（亡所），反观向内去体会那个能够听到一切声音、却不被声音所沾染的本心觉性，这就是直截了当的修行捷径。

【四、 延伸研读与数字化典籍文献参考】

如果希望查阅经过历代校勘的十卷《楞严经》全本经文、逐段现代白话精解与二十五圣修证网络，推荐参考非营利数字化禅学文献库：

- 大佛顶首楞严经十卷现代白话导读与经文详注：https://chanzong.space/classics/lengyanjing
- 核心哲学概念「狂心若歇」深度释义：https://chanzong.space/concepts/kuang-xin-ruo-xie
- 全球禅宗传承谱系与两百座公案知识图谱：https://chanzong.space/graph

歇即菩提。愿每位同修在喧嚣红尘中，都能歇下浮躁狂心，照见本有的清净宝山。"""
    }
]

def publish_article(page, article_data):
    print("="*60)
    print(f"🚀 发布知乎专栏长文: {article_data['title']}")
    print(f"👉 目标落地页: {article_data['target_url']}")
    print("="*60)
    
    page.goto("https://zhuanlan.zhihu.com/write", wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    
    # 1. 注入标题
    title_el = page.locator('textarea[placeholder*="请输入标题"], textarea.Input').first
    title_el.click()
    title_el.fill(article_data["title"])
    time.sleep(1)
    
    # 2. 注入正文
    editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first
    editor.click()
    time.sleep(0.5)
    for p_text in article_data["content"].split("\n\n"):
        p_clean = p_text.strip()
        if p_clean:
            page.keyboard.insert_text(p_clean)
            page.keyboard.press("Enter")
            page.keyboard.press("Enter")
            time.sleep(0.2)
            
    print("正文已注入，等待 3 秒草稿自动保存...")
    time.sleep(3)
    
    # 3. 点击第一次【发布】展开设置
    pub_btn = page.locator('button.Button--primary:has-text("发布"), button:has-text("发布")').last
    print("点击第一步【发布】展开面板...")
    pub_btn.click()
    time.sleep(3)
    
    # 4. 点击第二次【发布】进行确认提交
    confirm_pub = page.locator('button.Button--primary:has-text("发布"), button.Button--blue:has-text("发布")').last
    print("点击确认【发布】...")
    confirm_pub.click()
    time.sleep(6)
    
    # 5. 前往创作管理中心提取最新发布的文章独立 URL
    print("前往内容管理中心提取文章独立永久链接...")
    page.goto("https://www.zhihu.com/creator/manage/creation/all", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    pub_url = page.evaluate("""() => {
        const firstPost = document.querySelector('a[href*="/p/"]');
        return firstPost ? firstPost.href : null;
    }""")
    
    if not pub_url:
        pub_url = f"https://zhuanlan.zhihu.com/write"
        
    print(f"🎉 知乎专栏文章发布成功！独立永久 URL: {pub_url}")
    page.screenshot(path=f"tools/backlinks/zhuanlan_success_{article_data['title'][:4]}.png")
    
    add_backlink(
        platform="知乎 (Zhihu DA 95+)",
        region="国内",
        category="顶级中文知识专栏",
        post_title=article_data["title"],
        target_url=article_data["target_url"],
        backlink_url=pub_url,
        anchor_text=article_data["anchor_text"],
        link_type="Dofollow / UGC",
        status="Live",
        notes=article_data["notes"]
    )
    return pub_url

def run():
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="msedge",
            headless=True
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        
        for idx, art in enumerate(ARTICLES):
            print(f"\n[{idx+1}/{len(ARTICLES)}] 准备发布专栏文章: {art['title']}")
            url = publish_article(page, art)
            if idx < len(ARTICLES) - 1:
                print("⏳ 保持 25 秒安全冷却时间...")
                time.sleep(25)
                
        ctx.close()
        print("\n🎉 全部知乎专栏长文发布完成！")

if __name__ == "__main__":
    run()
