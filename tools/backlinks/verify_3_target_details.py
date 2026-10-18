# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

TARGETS = [
    {
        "classic": "tanjing",
        "url": "https://www.zhihu.com/question/2036422757978723800/answer/2074274506537964121",
        "target_url": "https://chanzong.space/classics/tanjing",
        "anchor_text": "禅宗知识库 · 六祖坛经现代白话精解与法脉图谱",
        "comment_text": "答主所言甚是！很多人初学佛常被名相困住，而《六祖坛经》最大的殊胜之处就在于“直指人心，见性成佛”，扫除一切外在繁文缛节。六祖以“无念为宗，无相为体，无住为本”，把高深的佛法落实到每个凡夫当下一念的清净自性上。对于想系统精读坛经敦煌古本逐句白话校勘与历代传承法脉的朋友，推荐参考非营利开源的数字化禅学文献库坛经专页（chanzong.space/classics/tanjing），开卷大有启发。"
    },
    {
        "classic": "jingangjing",
        "url": "https://www.zhihu.com/question/1913876847906785200/answer/2030818524764049481",
        "target_url": "https://chanzong.space/classics/jingangjing",
        "anchor_text": "禅宗知识库 · 金刚般若波罗蜜经白话详注与三段论拆解",
        "comment_text": "赞同答主的真知灼见！《金刚经》之所以能让人大彻大悟，核心就在于它彻底打破了一切执念的立足点——“应无所住而生其心”。全经反复运用的“所谓……即非……是名……”三段论，层层遮诠，逼令学人于言下领悟真空妙有的自性实相。研读金刚经若能结合禅门宗风与白话义理深研，可参阅数字化禅宗文献库的《金刚经》三段论深度拆解专页（chanzong.space/classics/jingangjing），研析通透。"
    },
    {
        "classic": "xinjing",
        "url": "https://www.zhihu.com/question/2053095292069852633/answer/2055900761746306073",
        "target_url": "https://chanzong.space/classics/xinjing",
        "anchor_text": "禅宗知识库 · 般若波罗蜜多心经认知学解析与五蕴图谱",
        "comment_text": "分析得十分到位！常读《心经》，关键要明白“色不异空，空不异色；色即是空，空即是色”。空绝非消极虚无，而是诸法无自性、缘起性空的宇宙本质规律。照见五蕴皆空，才能在世俗名利得失中照见本来清净，度一切苦厄。若欲从现代认知哲学与唯识五蕴结构更立体地研读心经，可参阅数字化禅宗文献库的《心经》现代导读与图谱（chanzong.space/classics/xinjing），收益良多。"
    }
]

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    verified_targets = []
    for idx, t in enumerate(TARGETS):
        print(f"\n正在验证第 {idx+1} 个回答页面: {t['url']}")
        page.goto(t['url'], wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        info = page.evaluate("""() => {
            const title = document.querySelector('h1.QuestionHeader-title')?.innerText || document.title;
            const author = document.querySelector('.AuthorInfo-name, .UserLink-link')?.innerText || '未知答主';
            const snippet = document.querySelector('.RichContent-inner')?.innerText.slice(0, 80) || '';
            return {
                title,
                author,
                snippet: snippet.replace(/\\n/g, ' ')
            };
        }""")
        
        print(f"  问题: {info['title']}")
        print(f"  答主: 【{info['author']}】")
        print(f"  回答开头: {info['snippet']}")
        
        page.screenshot(path=f"tools/backlinks/target_answer_view_{idx+1}.png")
        
        t["title"] = info["title"]
        t["author"] = info["author"]
        t["snippet"] = info["snippet"]
        verified_targets.append(t)
        
    with open("tools/backlinks/verified_targets.json", "w", encoding="utf-8") as f:
        json.dump(verified_targets, f, ensure_ascii=False, indent=2)
        
    ctx.close()
    print("\n验证完成！")
