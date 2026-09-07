# -*- coding: utf-8 -*-
import json
import re

LOG_PATH = r"C:\Users\willp\.gemini\antigravity\brain\2b575eb7-4be7-4c28-b36c-cd00d34a7fb9\.system_generated\logs\transcript_full.jsonl"

def extract_all():
    found_urls = set()
    tokens = []
    
    with open(LOG_PATH, "r", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                content = str(data.get("content", "")) + str(data.get("tool_calls", ""))
                
                # 提取 URLs
                urls = re.findall(r'https?://[^\s"\'<>]+', content)
                for u in urls:
                    if any(domain in u for domain in ["dev.to", "hashnode", "medium", "uneed", "startupbase", "producthunt", "github", "vocus", "zhihu", "pypi"]):
                        found_urls.add(u)
                        
                # 提取关于 key / token / password
                for line in content.split("\n"):
                    if any(k in line.lower() for k in ["api_key", "apikey", "api-key", "token", "access_token", "secret", "pypi-"]):
                        if len(line.strip()) < 200 and not line.strip().startswith("//"):
                            tokens.append(f"[Step {idx}] {line.strip()}")
            except Exception:
                pass
                
    print("=== 核心外链平台及 URL ===")
    for u in sorted(list(found_urls))[:30]:
        print(u)
        
    print("\n=== 找到的凭证与 Token 记录 ===")
    for t in tokens[:25]:
        print(t)

if __name__ == "__main__":
    extract_all()
