# -*- coding: utf-8 -*-
import os
import sys
import json
import urllib.request

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

z_c0_val = "2|1:0|10:1788830245|4:z_c0|92:Mi4xbmRidVRnQUFBQUMydDFrOVk2NTdIQ1lBQUFCZ0FsVk5KYkNNYXdEQmI0LXhrLW5PdldVUEdSUnlJOHlyVE41c3d3|b159bbcafd48da271af5a58c0badf9213639611f315416465a9109bfacdcdb30"
other_cookies = "_xsrf=weDYAcCeb2xYUM2qFuOdfczU89WI0mVg; _zap=73c46dd6-b62e-4708-86d0-c7f601d87e48; d_c0=trdZPWOuexyPTsXTbtSm42-D_B0dgpkWFII=|1782116442; __snaker__id=B2joQIy6QLysb7fv; q_c1=e667f0795c454302925a66e8a797ce4d|1785137784000|1785137784000; Hm_lvt_98beee57fd2ef70ccdd5ca52b9740c49=1786691662,1787124738,1788830247; HMACCOUNT=5955EDD0375579E9; SESSIONID=5Bq3ycGwjfvK2ejW5eqEcGwvuh2MtS7Dro5WlDwIRvz"

profile_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")
os.makedirs(profile_dir, exist_ok=True)

# 尝试无外层引号与带外层引号两种
for attempt, zc0 in enumerate([f'"{z_c0_val}"', z_c0_val]):
    full_cookie = f"z_c0={zc0}; {other_cookies}"
    req = urllib.request.Request(
        "https://www.zhihu.com/api/v4/me",
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Cookie": full_cookie
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"🎉 验证成功 (尝试模式 {attempt+1})！")
            print(f"👉 用户昵称: {data.get('name')}")
            print(f"👉 用户 ID: {data.get('id')}")
            print(f"👉 一句话介绍: {data.get('headline')}")
            print(f"👉 个人主页 token: {data.get('url_token')}")
            
            # 保存到持久化文件
            with open(os.path.join(profile_dir, "zhihu_cookie.txt"), "w", encoding="utf-8") as f:
                f.write(full_cookie)
                
            cookie_dict = {}
            for item in full_cookie.split(";"):
                if "=" in item:
                    k, v = item.strip().split("=", 1)
                    cookie_dict[k.strip()] = v.strip()
                    
            with open(os.path.join(profile_dir, "zhihu_cookie.json"), "w", encoding="utf-8") as f:
                json.dump(cookie_dict, f, indent=2, ensure_ascii=False)
                
            print("✅ 知乎认证 Cookies 已成功持久化保存！")
            sys.exit(0)
    except Exception as e:
        print(f"模式 {attempt+1} 响应:", e)
        if hasattr(e, 'read'):
            try:
                print("详情:", e.read().decode('utf-8')[:300])
            except Exception:
                pass

print("❌ 两种模式均未成功通过，请检查凭据。")
