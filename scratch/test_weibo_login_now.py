# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context

cookie_str = "SINAGLOBAL=2903821614676.19.1784622098567; ULV=1784622098568:1:1:1:2903821614676.19.1784622098567:; SCF=Ah_p-ol-FYWI14J-PHJl1S1bPcEcOdU30qiOgX_B9huSC5rvp_Wo_X_zcFcl8FnQHGcOGJVfY7UQGR67UUFN4Iw.; ALF=1792652264; SUB=_2A25Htla4DeRhGeBP4lQX9i7JyDyIHXVkytZwrDV8PUJbkNANLWOskW1NRTTKf06-qNnkWvsrCGDAhCz6Idf0VZKr; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WFPH1o9Qx5zP.dGc-YG81fa5JpX5KMhUgL.Foqp1KqcSo5fe052dJLoI0eLxKMLBKqL1h-LxK-LB--L1KMLxKMLBK.LB.2LxK.L1KMLBoxkqcyydrDadJUkMNWyqc-t"

cookies = []
for item in cookie_str.split(";"):
    if "=" in item:
        k, v = item.strip().split("=", 1)
        cookies.append({"name": k, "value": v, "domain": ".weibo.com", "path": "/"})

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://weibo.com", timeout=25000)
    time.sleep(4)
    print("Weibo URL:", page.url)
    user_avatar = page.query_selector("img[class*='woo-avatar-img'], .woo-avatar")
    print("Weibo logged in:", bool(user_avatar))
    page.screenshot(path="scratch/weibo_test_now.png")
    ctx.close()
