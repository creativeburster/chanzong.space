# -*- coding: utf-8 -*-
import os
import sys

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink

ZHIHU_ANSWERS = [
    {
        "post_title": "为什么说见性成佛，而不说见性即佛，见性和成佛之间还有什么吗？",
        "target_url": "https://chanzong.space/classics/damoxuemai",
        "backlink_url": "https://www.zhihu.com/question/1920463062604940234/answer/2080595715986813616",
        "anchor_text": "禅宗知识库 · 达摩大师血脉论现代白话导读与见性成佛实相",
        "notes": "知乎认证账号【i禅修】发布深度文献解答，剖析达摩血脉论见性即佛与二入四行理入行入，含达摩专页与D3图谱回链"
    },
    {
        "post_title": "《楞严经》的核心是什么？",
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "backlink_url": "https://www.zhihu.com/question/1936384195430687530/answer/2080595975081665597",
        "anchor_text": "禅宗知识库 · 楞严经十卷全文现代白话导读与七处征心图谱",
        "notes": "知乎认证账号【i禅修】发布深度解答，解析开悟楞严、破妄显真与狂心若歇，含楞严经专页与D3图谱回链"
    },
    {
        "post_title": "有谁知道什么是阿赖耶识，如何转识成智？",
        "target_url": "https://chanzong.space/classics/bashiguijusong",
        "backlink_url": "https://www.zhihu.com/question/1962834109404542124/answer/2080596233115246671",
        "anchor_text": "禅宗知识库 · 八识规矩颂全文白话详注与阿赖耶识修证图谱",
        "notes": "知乎认证账号【i禅修】发布深度解答，解析玄奘大师八识规矩颂与唯识转识成智，含八识专页与图谱回链"
    },
    {
        "post_title": "至道无难，唯嫌拣择这句话出自什么哪里？",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "backlink_url": "https://www.zhihu.com/question/459168425/answer/2080596824281310060",
        "anchor_text": "禅宗知识库 · 三祖僧璨信心铭全文现代白话导读与圆融互链",
        "notes": "知乎认证账号【i禅修】发布深度考证解答，考证至道无难唯嫌拣择出处与三祖信心铭不二法门，含信心铭专页回链"
    },
    {
        "post_title": "永嘉大师为何说“不除妄想不求真”？",
        "target_url": "https://chanzong.space/classics/zhengdaoge",
        "backlink_url": "https://www.zhihu.com/question/1967165225909335858/answer/2080597189684999141",
        "anchor_text": "禅宗知识库 · 永嘉玄觉大师证道歌全文白话导读与法嗣谱系",
        "notes": "知乎认证账号【i禅修】发布深度解答，深入剖析永嘉证道歌不除妄想不求真顿悟心法，含证道歌专页与谱系回链"
    }
]

for item in ZHIHU_ANSWERS:
    add_backlink(
        platform="知乎 (Zhihu DA 95+)",
        region="国内",
        category="顶级中文问答社区",
        post_title=item["post_title"],
        target_url=item["target_url"],
        backlink_url=item["backlink_url"],
        anchor_text=item["anchor_text"],
        link_type="Dofollow / UGC",
        status="Live",
        notes=item["notes"]
    )

print("5 篇知乎高权重问答已全部成功登记至 backlinks_log.csv 及报告！")
