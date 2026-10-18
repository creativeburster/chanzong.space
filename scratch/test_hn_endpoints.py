# -*- coding: utf-8 -*-
import requests

TOKEN = "41b853b7-84ae-4b98-a293-7723ef9c6b1c"
proxies = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
headers = {"Authorization": TOKEN, "Content-Type": "application/json"}
query = {"query": "{ me { id username } }"}

endpoints = [
    "https://api.hashnode.com",
    "https://gql.hashnode.com",
    "https://api.hashnode.com/graphql"
]

for ep in endpoints:
    try:
        r = requests.post(ep, json=query, headers=headers, proxies=proxies, timeout=8)
        ctype = r.headers.get("content-type", "")
        print(f"{ep} -> status: {r.status_code}, type: {ctype}")
        if "json" in ctype:
            print("  -> JSON:", r.json())
        else:
            print("  -> Text:", r.text[:150])
    except Exception as e:
        print(f"{ep} -> error: {e}")
