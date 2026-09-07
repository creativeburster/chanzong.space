# -*- coding: utf-8 -*-
import json
import re

LOG_PATH = r"C:\Users\willp\.gemini\antigravity\brain\2b575eb7-4be7-4c28-b36c-cd00d34a7fb9\.system_generated\logs\transcript_full.jsonl"

def inspect():
    with open(LOG_PATH, "r", encoding="utf-8", errors="ignore") as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                step_type = data.get("type", "")
                content = data.get("content", "")
                
                # 检查是否是用户输入或包含关键凭证信息
                if step_type == "USER_INPUT":
                    print(f"--- [Step {idx} USER_INPUT] ---")
                    print(content[:500])
                    print("\n")
                elif any(kw in content for kw in ["token", "Token", "api_key", "apiKey", "Bearer", "secret", "dev.to", "github", "vocus", "medium", "zhihu"]):
                    print(f"--- [Step {idx} {step_type}] ---")
                    # 打印匹配关键词的上下文行
                    for l in content.split("\n"):
                        if any(kw in l.lower() for kw in ["key", "token", "secret", "bearer", "api", "cookie", "login"]):
                            print(l[:200])
                    print("\n")
            except Exception:
                pass

if __name__ == "__main__":
    inspect()
