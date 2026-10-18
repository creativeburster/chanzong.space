# -*- coding: utf-8 -*-
import requests

proxies = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
s = requests.Session()
s.proxies = proxies

html = """
<div id="graph-container">
  <h3>ChanZong Knowledge Base (chanzong.space)</h3>
  <p>Interactive Knowledge Graph for 130+ Zen Classics powered by D3.js v7</p>
  <a href="https://chanzong.space/graph" target="_blank">Visit Live Knowledge Graph</a>
  <a href="https://chanzong.space" target="_blank">Official Home</a>
</div>
"""

payload = {
    "title": "ChanZong Knowledge Base - D3.js Knowledge Graph Engine",
    "description": "Interactive D3.js knowledge graph physics engine for 130+ Zen Classics. Official: https://chanzong.space",
    "html": html,
    "css": "body { background: #FAF9F6; font-family: sans-serif; }",
    "js": "console.log('ChanZong D3 Engine loaded. Visit https://chanzong.space/graph');"
}

r = s.post("https://jsfiddle.net/api/post/library/pure/", data=payload, timeout=15)
print("JSFiddle status:", r.status_code)
print("JSFiddle URL:", r.url)
print("JSFiddle text sample:", r.text[:300])
