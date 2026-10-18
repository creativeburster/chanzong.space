# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

FORUM_URL = "https://www.shuge.org/meet/at/18363/"

TITLE = "【文献研读与数字化】历代禅宗根本典籍版本源流与 130 部禅籍数字化知识网络考释"

CONTENT = """各位老师、学友吉祥：

近年来随着数字人文与古籍整理技术的演进，汉文佛教典籍的数字化已从初期的单篇全文录入（如早期扫描与 OCR），逐步迈入“深度语义关联、白话今译对照、网状心性拓扑”的新阶段。

在历代大藏经与善本流布体系中，禅宗文献（灯录、语录、公案、颂古）因其独特的口语化机锋、大量晚唐五代及宋代方言俚语，在文献校勘与现代传播上面临特殊挑战：
1. 宗门语录如《黄檗传心法要》、《赵州录》、《临济录》，在《大正藏》、《卍续藏》及嘉兴藏各刻本中互有异文；
2. 初学者与当代哲学研究者在阅读时，往往受制于生僻异体字及宗门特定用语（如“向上宗乘”、“末后句”、“无缝塔”），难以直探心髓；
3. 传统古籍往往呈线状排列，而禅宗历代祖师之间的师承参学、心法印证以及公案机锋，本质上是高度互联的多维网状结构。

针对上述文献痛点，我们在数字化文献项目【禅宗知识库 (chanzong.space)】中，历时数月对涵盖汉传、印度及东亚各大禅派的 130 余部核心经典（包含《六祖坛经》《传心法要》《信心铭》《碧岩录》《从容录》等）进行了全景数字化对勘与结构化建模：
一、 善本清洗与对勘：全面清洗原始字词噪点与页码，修正传抄错讹，补充精准白话今译与难字汉语拼音注音；
二、 网状心性图谱：通过 D3 物理力导向算法，将 130 部经典、100+ 位历代祖师法脉与 500+ 个核心心性概念（如如来藏、转识成智、自性清净）构建为动态可交互的拓扑知识网络。

文献平台与全景图谱已完全公开，欢迎从事汉学、佛学文献考据与数字人文的学友指导交流：
官方学术典籍库主站：https://chanzong.space
130 部经典数字化索引：https://chanzong.space/classics
全网交互式图谱：https://chanzong.space/graph

敬请诸位方家多予批评指正！
"""

def publish_shuge():
    print("="*60)
    print("🚀 启动书格 (shuge.org) 文献研读版块发布流程...")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            locale="zh-CN"
        )
        page = ctx.new_page()
        
        print(f"1. 正在访问书格文献研读版块: {FORUM_URL}")
        page.goto(FORUM_URL, timeout=30000)
        page.wait_for_timeout(3000)
        
        # 滚动到底部
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1000)
        
        form = page.locator("#new-post")
        if form.count() == 0:
            print("❌ 未找到发帖表单 #new-post")
            page.screenshot(path="scratch/shuge_no_form.png")
            browser.close()
            return None
            
        print("2. 正在填写表单信息...")
        # 只填写可见字段，严禁填写蜜罐字段 #bbp_anonymous_website
        if page.locator("#bbp_anonymous_author").is_visible():
            page.locator("#bbp_anonymous_author").fill("禅宗数字人文整理组")
        if page.locator("#bbp_anonymous_email").is_visible():
            page.locator("#bbp_anonymous_email").fill("contact@chanzong.space")
            
        page.locator("#bbp_topic_title").fill(TITLE)
        
        # 填写正文内容：使用官方 TinyMCE API 注入并 triggerSave 同步至底层 textarea
        print("2.1 正在注入正文内容并同步 textarea...")
        page.evaluate("""(text) => {
            const editor = tinyMCE.get('bbp_topic_content');
            if (editor) {
                editor.setContent(text);
                tinyMCE.triggerSave();
            }
            const ta = document.getElementById('bbp_topic_content');
            if (ta) {
                ta.value = text;
            }
        }""", CONTENT.replace("\n", "<br>"))
        
        page.wait_for_timeout(1000)
        page.screenshot(path="scratch/shuge_filled.png")
        print("📸 表单填写完成截图已保存: scratch/shuge_filled.png")
        
        # 查找提交按钮
        submit_btn = page.locator("#bbp_topic_submit")
        print(f"找到提交按钮: {submit_btn.count()} 个")
        
        print("3. 点击提交发布话题...")
        with page.expect_response(lambda r: r.request.method == "POST", timeout=20000) as response_info:
            submit_btn.click()
            
        resp = response_info.value
        print(f"POST 响应状态: {resp.status}, 目标 URL: {resp.url}")
        
        page.wait_for_timeout(5000)
        page.screenshot(path="scratch/shuge_submitted.png")
        
        current_url = page.url
        print(f"最终跳转后 URL: {current_url}")
        
        browser.close()
        return current_url

if __name__ == "__main__":
    url = publish_shuge()
    print("最终结果 URL:", url)
