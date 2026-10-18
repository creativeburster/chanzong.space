# -*- coding: utf-8 -*-
import requests

cookie_str = "buvid3=C8101220-2DB4-B00C-F744-7C42C3FAB6FC81051infoc; b_nut=1788856981; _uuid=2C12E921-4EDA-2788-8168-1F4B94D1F2DF81907infoc; buvid4=98BEEE75-AD56-E1DD-2BB3-9A9AF2B42CC783934-126090816-5Uzezra3eE6njWDeDMpXrQ%3D%3D; buvid_fp=2b6f585c0877cda65798b417a3bfbbe1; lang=zh-Hans; DedeUserID=520219006; DedeUserID__ckMd5=0c271d43cea6e684; theme-tip-show=SHOWED; theme-avatar-tip-show=SHOWED; CURRENT_FNVAL=4048; CURRENT_QUALITY=0; rpdid=|(u~)Yk~)|Rk0J'u~)))l)))l; home_feed_column=4; hit-dyn-v2=1; bp_t_offset_520219006=1247445037483032576; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; bmg_af_sc=%7B%22none%22%3A%7B%22on%22%3A1%2C%22def%22%3A%22i1.hdslb.com%22%7D%2C%22sgp%22%3A%7B%22on%22%3A1%2C%22def%22%3A%22i1-sgp.hdslb.com%22%7D%7D; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTAzMTk0NzcsImlhdCI6MTc5MDA2MDIxNywicGx0IjotMX0.Mi5n415O-p1bxrCPQCACCSlZIRvB87hFJ78DoxO6Gfo; bili_ticket_expires=1790319417; SESSDATA=95471ec9%2C1805612284%2Cb0fe4%2A91CjC9kBMMWr4w5wSGACYjRl_sDJxogcNmqse1u2Rs87PNAK9RpdbW9iNWVMzNKYgy1jwSVjNBb1BfQlVUdUxVMjkzWG8zb3lSNVNyV1doWktTNXdkMEdhaEhSVF9ic1RuWUVZOW42VmF2ZnU1TEN1RkUwa0pQQVN5Vm1Bc1MzX09MVVRaT1FlWnJRIIEC; bili_jct=1fba5a08ddf91bae24195238e18f2c43; sid=q92tk4kh; browser_resolution=1132-1567; b_lsid=01778EB6_1A0C7ED3418"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Cookie": cookie_str
}
r = requests.get("https://api.bilibili.com/x/web-interface/nav", headers=headers, timeout=5)
data = r.json().get("data", {})
print("Bilibili isLogin:", data.get("isLogin"))
print("Bilibili uname:", data.get("uname"))
print("Bilibili mid:", data.get("mid"))
