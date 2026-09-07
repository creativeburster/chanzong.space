# -*- coding: utf-8 -*-
"""
chanzong.space 自动化外链建设总控调度器
配比策略：国内 60% : 海外/繁体 40%
"""
import os
import sys
import argparse

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from tracker import init_tracker, generate_markdown_report
from platform_runners.zhihu_runner import run_zhihu_backlinks
from platform_runners.vocus_runner import run_vocus_backlinks
from platform_runners.directory_submitter import run_directory_submissions

def main():
    parser = argparse.ArgumentParser(description="chanzong.space 自动化外链建设工具")
    parser.add_argument(
        "--platform",
        choices=["zhihu", "vocus", "directory", "all"],
        default="all",
        help="选择执行平台: zhihu (国内知乎问答), vocus (台湾方格子繁体专栏), directory (目录收录), all (全自动调度)"
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="仅重新生成并打印外链成果报表"
    )
    
    args = parser.parse_args()
    init_tracker()
    
    if args.report:
        generate_markdown_report()
        print("外链监控报表已更新至 seo/BACKLINKS_REPORT.md")
        return
        
    print("\n========================================================")
    print("  🌐 禅宗知识库 (chanzong.space) 自动化外链建设引擎")
    print("  🎯 战略规划：国内 60%  |  海外及繁体 40%")
    print("========================================================\n")
    
    if args.platform in ["zhihu", "all"]:
        print("\n>>> [1/3] 开始国内阵地：知乎 (Zhihu) 高权重问答外链建设...")
        run_zhihu_backlinks(max_answers=1)
        
    if args.platform in ["vocus", "all"]:
        print("\n>>> [2/3] 开始海外繁体阵地：方格子 (Vocus) 专栏外链建设...")
        run_vocus_backlinks()
        
    if args.platform in ["directory", "all"]:
        print("\n>>> [3/3] 开始网站目录收录批量提交...")
        run_directory_submissions()
        
    generate_markdown_report()
    print("\n🎉 本轮外链任务执行完毕！可查看 seo/BACKLINKS_REPORT.md 检查最新成果。")

if __name__ == "__main__":
    main()
