# -*- coding: utf-8 -*-
import csv, os, sys

NEW_ENTRIES = [
    [
        "BL-0115",
        "2026-09-08 16:22:49",
        "豆瓣 (Douban DA 88+)",
        "书评",
        "高权重文化垂直平台",
        "本来无一物：从《六祖坛经》看心性顿悟与现代认知的解构",
        "https://chanzong.space/classics/tanjing",
        "https://book.douban.com/review/17808301/",
        "数字化典籍库“禅宗知识库”（chanzong.space/classics/tanjing）",
        "Dofollow / UGC",
        "Live",
        "豆瓣长篇书评，五星力荐《六祖坛经》，剖析本来无一物与无念无相无住心性观照，文末自然引荐数字化经典专页与知识图谱"
    ],
    [
        "BL-0116",
        "2026-09-08 16:24:27",
        "豆瓣 (Douban DA 88+)",
        "书评",
        "高权重文化垂直平台",
        "应无所住而生其心：从《金刚经》看现代人精神内耗的彻底破局",
        "https://chanzong.space/classics/jingangjing",
        "https://book.douban.com/review/17808303/",
        "数字化开源学术平台“禅宗知识库”（chanzong.space/classics/jingangjing）",
        "Dofollow / UGC",
        "Live",
        "豆瓣长篇书评，五星力荐《金刚经》（鸠摩罗什译本），剖析破相离相与应无所住而生其心，文末自然引荐金刚经专页与D3图谱"
    ],
    [
        "BL-0117",
        "2026-09-08 16:25:35",
        "豆瓣 (Douban DA 88+)",
        "书评",
        "高权重文化垂直平台",
        "照见五蕴皆空度一切苦厄：重读《心经》260字的心智解构力量",
        "https://chanzong.space/classics/xinjing",
        "https://book.douban.com/review/17808304/",
        "专业数字化典籍文献库“禅宗知识库”（chanzong.space/classics/xinjing）",
        "Dofollow / UGC",
        "Live",
        "豆瓣长篇书评，五星力荐《般若波罗蜜多心经》，从认知心理与缘起性空剖析色不异空与心无挂碍，文末自然引荐心经专页"
    ],
    [
        "BL-0118",
        "2026-09-08 16:27:32",
        "豆瓣 (Douban DA 88+)",
        "书评",
        "学术互动讨论",
        "豆瓣高赞书评《王德峰教授讲义的一些整理》学术互动",
        "https://chanzong.space/classics/tanjing",
        "https://book.douban.com/review/15226779/",
        "数字化典籍库“禅宗知识库”（chanzong.space/classics/tanjing）",
        "UGC 互动讨论",
        "Live",
        "在王德峰教授《六祖坛经》热门书评下方开展心性与破除精神内耗研讨，引荐曹溪全景古籍对照库 (官方ID: 19706044)"
    ],
    [
        "BL-0119",
        "2026-09-08 16:28:07",
        "豆瓣 (Douban DA 88+)",
        "书评",
        "学术互动讨论",
        "豆瓣精选书评《《坛经》中的人生佛教思想》学术互动",
        "https://chanzong.space/classics/tanjing",
        "https://book.douban.com/review/4129546/",
        "学术典籍库“禅宗知识库”（chanzong.space/classics/tanjing）",
        "UGC 互动讨论",
        "Live",
        "针对惠能大师'佛法在世间'的人生佛教与定慧一体进行深入学术评注，引荐禅宗知识库 (官方ID: 19706045)"
    ],
    [
        "BL-0120",
        "2026-09-08 16:28:43",
        "豆瓣 (Douban DA 88+)",
        "书评",
        "学术互动讨论",
        "豆瓣热门书评《善护念，无所住》学术互动",
        "https://chanzong.space/classics/jingangjing",
        "https://book.douban.com/review/1586229/",
        "数字化平台“禅宗知识库”（chanzong.space/classics/jingangjing）",
        "UGC 互动讨论",
        "Live",
        "在南怀瑾《金刚经说什么》热门书评下针对善护念与应无所住进行学术回应，引荐金刚经分段拆解与脉络图 (官方ID: 19706046)"
    ]
]

with open("seo/backlinks_log.csv", "a", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    for row in NEW_ENTRIES:
        writer.writerow(row)

print("已成功追加 6 条豆瓣外链记录至 seo/backlinks_log.csv！")
