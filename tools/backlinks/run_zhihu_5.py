# -*- coding: utf-8 -*-
"""
知乎 5 篇高权重深度问答批量发布与追踪引擎
"""
import os
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from zhihu_answer_runner import publish_zhihu_answer

from publish_damo import RAW_ANSWER as ANS_DAMO
from publish_lengyan import RAW_ANSWER as ANS_LENGYAN
from publish_bashi import RAW_ANSWER as ANS_BASHI
from publish_xinxin import RAW_ANSWER as ANS_XINXIN
from publish_zhengdao import RAW_ANSWER as ANS_ZHENGDAO

ZHIHU_TASKS = [
    {
        "name": "知乎问答 1：见性成佛与达摩血脉论",
        "question_url": "https://www.zhihu.com/question/1920463062604940234",
        "question_title": "为什么说见性成佛，而不说见性即佛，见性和成佛之间还有什么吗？",
        "raw_answer": ANS_DAMO,
        "target_url": "https://chanzong.space/classics/damoxuemai",
        "anchor_text": "禅宗知识库 · 达摩大师血脉论现代白话导读与见性成佛实相",
        "notes": "知乎认证账号【i禅修】发布高权重问答，解析达摩血脉论见性即佛与二入四行理入行入，含达摩专页与D3图谱回链"
    },
    {
        "name": "知乎问答 2：楞严经核心与狂心若歇",
        "question_url": "https://www.zhihu.com/question/1936384195430687530",
        "question_title": "《楞严经》的核心是什么？",
        "raw_answer": ANS_LENGYAN,
        "target_url": "https://chanzong.space/classics/lengyanjing",
        "anchor_text": "禅宗知识库 · 楞严经十卷全文现代白话导读与七处征心图谱",
        "notes": "知乎认证账号【i禅修】发布高权重问答，解析开悟楞严、破妄显真与狂心若歇，含楞严经专页与D3图谱回链"
    },
    {
        "name": "知乎问答 3：八识规矩颂与转识成智",
        "question_url": "https://www.zhihu.com/question/1962834109404542124",
        "question_title": "有谁知道什么是阿赖耶识，如何转识成智？",
        "raw_answer": ANS_BASHI,
        "target_url": "https://chanzong.space/classics/bashiguijusong",
        "anchor_text": "禅宗知识库 · 八识规矩颂全文白话详注与阿赖耶识修证图谱",
        "notes": "知乎认证账号【i禅修】发布高权重问答，解析玄奘大师八识规矩颂与唯识转识成智，含八识专页与图谱回链"
    },
    {
        "name": "知乎问答 4：信心铭至道无难唯嫌拣择",
        "question_url": "https://www.zhihu.com/question/459168425",
        "question_title": "至道无难，唯嫌拣择这句话出自什么哪里？",
        "raw_answer": ANS_XINXIN,
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "禅宗知识库 · 三祖僧璨信心铭全文现代白话导读与圆融互链",
        "notes": "知乎认证账号【i禅修】发布高权重问答，考证至道无难唯嫌拣择出处与三祖信心铭不二法门，含信心铭专页回链"
    },
    {
        "name": "知乎问答 5：永嘉证道歌不除妄想不求真",
        "question_url": "https://www.zhihu.com/question/1967165225909335858",
        "question_title": "永嘉大师为何说“不除妄想不求真”？",
        "raw_answer": ANS_ZHENGDAO,
        "target_url": "https://chanzong.space/classics/zhengdaoge",
        "anchor_text": "禅宗知识库 · 永嘉玄觉大师证道歌全文白话导读与法嗣谱系",
        "notes": "知乎认证账号【i禅修】发布高权重问答，深入剖析永嘉证道歌不除妄想不求真顿悟心法，含证道歌专页与谱系回链"
    }
]

def run_all_zhihu():
    results = []
    for idx, t in enumerate(ZHIHU_TASKS):
        print(f"\n[{idx+1}/{len(ZHIHU_TASKS)}] 开始执行: {t['name']}")
        try:
            url = publish_zhihu_answer(
                question_url=t["question_url"],
                question_title=t["question_title"],
                raw_answer=t["raw_answer"],
                target_url=t["target_url"],
                anchor_text=t["anchor_text"],
                notes=t["notes"]
            )
            results.append({"name": t["name"], "url": url, "status": "Success" if url else "Failed"})
        except Exception as e:
            print(f"❌ 执行异常: {e}")
            results.append({"name": t["name"], "url": None, "status": f"Error: {e}"})
            
        if idx < len(ZHIHU_TASKS) - 1:
            print("⏳ 保持 15 秒安全冷却时间...")
            time.sleep(15)
            
    print("\n" + "="*60)
    print("🎉 知乎 5 篇问答发布任务执行完毕！汇总统计：")
    for r in results:
        print(f"  👉 {r['name']}: {r['status']} -> {r['url']}")
    print("="*60)

if __name__ == "__main__":
    run_all_zhihu()
