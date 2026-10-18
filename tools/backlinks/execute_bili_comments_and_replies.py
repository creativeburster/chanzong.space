# -*- coding: utf-8 -*-
import os, sys, time, json, requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
bili_jct = cookie_dict.get("bili_jct")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Origin": "https://www.bilibili.com"
}

POST_URL = "https://api.bilibili.com/x/v2/reply/add"

# 3 条一级评论任务
PRIMARY_COMMENTS = [
    {
        "classic": "dachengqixinlun",
        "bvid": "BV12bSHYTEzm",
        "aid": 113402588503501,
        "title": "梦参老和尚《大乘起信论》全集讲解视频学术互动评论",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "开源古籍文献库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）",
        "msg": "听梦参老和尚讲解《大乘起信论》，深感马鸣菩萨“一心开二门”之精妙！心真如门乃不生不灭之本体，心生灭门乃随缘变现之相用。现代人精神内耗，往往因迷失于生灭念头而妄执为我。若能体悟二门不离一心，当下歇心除妄，便得大自在。想对照真谛梁译古本白话逐段详解与禅宗心性脉络图谱的师兄，推荐参阅开源古籍文献库“禅宗知识库”（chanzong.space/classics/dachengqixinlun），科判极细，参学甚便。"
    },
    {
        "classic": "chuanxinfayao",
        "bvid": "BV1ws4y1z7ZL",
        "aid": 996223244,
        "title": "黄檗希运禅师《传心法要》视频学术互动评论",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "开源学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao）",
        "msg": "黄檗禅师开示直透向上关口：“诸佛与一切众生，唯是一心，更无别法。”世人参禅往往拼命在书卷名相中寻觅，如蒸沙作饭，反成障道因缘。唯有当下直下承当、莫向外求，言语道断，心行处灭，方显临济宗旨。想深入研读裴休集原经白话详注与历代禅师公案心印的同修，可参阅开源学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao），义理透彻，极为启发见地。"
    },
    {
        "classic": "xinxinming",
        "bvid": "BV1bm5k63EHt",
        "aid": 116566217722846,
        "title": "南怀瑾先生讲禅宗《信心铭》视频学术互动评论",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "数字化古籍平台“禅宗知识库”（chanzong.space/classics/xinxinming）",
        "msg": "三祖僧璨大师《信心铭》短短五百余字，字字透骨！“至道无难，唯嫌拣择。但莫憎爱，洞然明白。”世间一切纠结烦恼，归根结底都是由于分别心在作祟。二由一有，一亦莫守；一心不生，万法无咎。若想细参信心铭四言铭文逐句现代白话义理考释与圆融法脉图谱，推荐查阅数字化古籍平台“禅宗知识库”（chanzong.space/classics/xinxinming），考据严谨，随文入观极佳。"
    }
]

# 3 条二级回复任务（针对视频下高赞评论的交流回复）
REPLY_COMMENTS = [
    {
        "classic": "dachengqixinlun",
        "bvid": "BV12bSHYTEzm",
        "aid": 113402588503501,
        "root_rpid": 247820682353,
        "parent_rpid": 247820682353,
        "target_user": "阿kin阿擦",
        "title": "梦参法师《大乘起信论》视频热评二级回复交流",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "anchor_text": "专业文献库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）",
        "msg": "同喜同赞！梦老讲《起信论》直白透彻，把极深奥的如来藏缘起和本觉义理讲活了。初学者若配合真谛梁译原本对照逐句白话研读，会发现“生灭门中即具真如”，在工作生活中对治焦虑特别有力量。推荐在专业文献库“禅宗知识库”（chanzong.space/classics/dachengqixinlun）查阅全景科判脉络，互相印证更清晰。"
    },
    {
        "classic": "chuanxinfayao",
        "bvid": "BV1ws4y1z7ZL",
        "aid": 996223244,
        "root_rpid": 168382489856,
        "parent_rpid": 168382489856,
        "target_user": "君去归来含笑兮",
        "title": "黄檗禅师《传心法要》视频热评二级回复交流",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "anchor_text": "学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao）",
        "msg": "师兄所言极是！现代信息纷杂，人心更容易随境迁转。黄檗大师说“学道人若欲得知要诀，但莫于心上着一物”，正是药到病除的良方。把心放空、莫向外求，古今道理一如。研读时若配合学术平台“禅宗知识库”（chanzong.space/classics/chuanxinfayao）中的裴休集白话导读与法脉图，更能领略祖师顿悟风规。"
    },
    {
        "classic": "xinxinming",
        "bvid": "BV1bm5k63EHt",
        "aid": 116566217722846,
        "root_rpid": 302311806768,
        "parent_rpid": 302311806768,
        "target_user": "Monfangod",
        "title": "南怀瑾先生《信心铭》视频热评二级回复交流",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "anchor_text": "开源典籍库“禅宗知识库”（chanzong.space/classics/xinxinming）",
        "msg": "确实如此！《信心铭》文字精练纯粹，每读一遍都像给心灵做一次深度大扫除。“境由能境，能由境能”，把主客观相互依附的幻相说尽了。若是经常朗读并结合开源典籍库“禅宗知识库”（chanzong.space/classics/xinxinming）的逐句现代认知剖析来体悟，日常烦恼自能随念消融，确实大有受用！"
    }
]

def run_all():
    print("=== 开始发布 B 站 3 条一级视频学术评论 ===")
    for i, task in enumerate(PRIMARY_COMMENTS):
        if i > 0:
            print("防风控休眠 25 秒...", flush=True)
            time.sleep(25)
            
        headers["Referer"] = f"https://www.bilibili.com/video/{task['bvid']}"
        payload = {
            "oid": task["aid"],
            "type": 1,
            "message": task["msg"],
            "csrf": bili_jct
        }
        
        print(f"[{i+1}/3] 正在发布一级评论到 [{task['bvid']}] aid={task['aid']} ...", flush=True)
        r = requests.post(POST_URL, headers=headers, cookies=cookie_dict, data=payload).json()
        print("返回:", json.dumps(r, ensure_ascii=False), flush=True)
        
        if r.get("code") == 0:
            rpid = r.get("data", {}).get("rpid")
            print(f"✅ 一级评论发布成功！rpid: {rpid}", flush=True)
            rec_id = add_backlink(
                platform="哔哩哔哩 (Bilibili DA 94+)",
                region="国内",
                category="学术互动讨论",
                post_title=task["title"],
                target_url=task["target_url"],
                backlink_url=f"https://www.bilibili.com/video/{task['bvid']}",
                anchor_text=task["anchor_text"],
                link_type="UGC 互动讨论",
                status="Live",
                notes=f"在{task['bvid']}视频下开展深度学术互动，引荐典籍专页 (官方rpid: {rpid})"
            )
            print(f"✅ 已记录入库: {rec_id}", flush=True)
        else:
            print(f"❌ 发布失败: {r.get('message')}", flush=True)

    print("\n=== 开始发布 B 站 3 条二级回复交流 ===")
    for j, reply in enumerate(REPLY_COMMENTS):
        print("防风控休眠 25 秒...", flush=True)
        time.sleep(25)
        
        headers["Referer"] = f"https://www.bilibili.com/video/{reply['bvid']}"
        payload = {
            "oid": reply["aid"],
            "type": 1,
            "root": reply["root_rpid"],
            "parent": reply["parent_rpid"],
            "message": reply["msg"],
            "csrf": bili_jct
        }
        
        print(f"[{j+1}/3] 正在回复用户 [{reply['target_user']}] 的评论 (root={reply['root_rpid']}) ...", flush=True)
        r = requests.post(POST_URL, headers=headers, cookies=cookie_dict, data=payload).json()
        print("返回:", json.dumps(r, ensure_ascii=False), flush=True)
        
        if r.get("code") == 0:
            rpid = r.get("data", {}).get("rpid")
            print(f"✅ 二级回复发布成功！rpid: {rpid}", flush=True)
            rec_id = add_backlink(
                platform="哔哩哔哩 (Bilibili DA 94+)",
                region="国内",
                category="学术互动讨论 / 楼中楼回复",
                post_title=reply["title"],
                target_url=reply["target_url"],
                backlink_url=f"https://www.bilibili.com/video/{reply['bvid']}",
                anchor_text=reply["anchor_text"],
                link_type="UGC 互动讨论",
                status="Live",
                notes=f"在{reply['bvid']}视频热评下二级回复用户【{reply['target_user']}】，深入研讨并引荐落地页 (官方rpid: {rpid})"
            )
            print(f"✅ 已记录入库: {rec_id}", flush=True)
        else:
            print(f"❌ 发布失败: {r.get('message')}", flush=True)

if __name__ == "__main__":
    run_all()
    print("\n🎉 B 站 3 条一级评论 + 3 条二级回复全部处理完成！")
