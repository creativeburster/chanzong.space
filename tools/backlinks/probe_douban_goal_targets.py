# -*- coding: utf-8 -*-
import os, sys, json, requests
from bs4 import BeautifulSoup

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookies = json.load(f)

cookie_dict = {c["name"]: c["value"] for c in cookies}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    "Referer": "https://book.douban.com"
}

def search_book(kw):
    url = f"https://www.douban.com/j/search_suggest?q={kw}"
    r = requests.get(url, headers=headers, cookies=cookie_dict).json()
    items = []
    for card in r:
        if card.get("type") == "b": # book
            items.append({
                "id": card.get("id"),
                "title": card.get("title"),
                "url": card.get("url")
            })
    return items

keywords = ["大乘起信论", "传心法要", "信心铭"]
targets = {}
for kw in keywords:
    books = search_book(kw)
    print(f"\n=== 搜索书籍: {kw} ===")
    for b in books[:3]:
        print(f"  ID: {b['id']} | 标题: {b['title']} | URL: {b['url']}")
    if books:
        best = books[0]
        targets[kw] = best
        # 获取该书热门书评列表
        reviews_url = f"https://book.douban.com/subject/{best['id']}/reviews"
        rev_resp = requests.get(reviews_url, headers=headers, cookies=cookie_dict)
        soup = BeautifulSoup(rev_resp.text, "html.parser")
        rev_items = []
        for r_div in soup.select(".review-item")[:3]:
            a_tag = r_div.select_one("h2 a")
            author_tag = r_div.select_one(".name")
            if a_tag:
                rev_id = a_tag.get("href", "").split("/")[-2]
                rev_items.append({
                    "review_id": rev_id,
                    "title": a_tag.text.strip(),
                    "author": author_tag.text.strip() if author_tag else "",
                    "url": a_tag.get("href")
                })
        targets[kw]["top_reviews"] = rev_items
        print(f"  已抓取热门书评: {len(rev_items)} 篇")
        for rv in rev_items:
            print(f"    - [{rv['review_id']}] {rv['author']}: {rv['title']}")

with open(os.path.join(CUR_DIR, "douban_goal_targets.json"), "w", encoding="utf-8") as f:
    json.dump(targets, f, ensure_ascii=False, indent=2)

print("\n豆瓣目标已固化至 douban_goal_targets.json！")
