'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ZenQuoteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  interpretation?: string;
  sourceTitle?: string;
  author?: string;
}

export default function ZenQuoteCardModal({
  isOpen,
  onClose,
  quote,
  interpretation,
  sourceTitle,
  author
}: ZenQuoteCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    drawCard();
  }, [isOpen, quote, interpretation, sourceTitle, author]);

  if (!isOpen) return null;

  // 绘制高清 Canvas
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const padding = 48;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 2, 3) : 2;

    // 先计算文本行数以确定画布高度
    ctx.font = 'bold 24px "Noto Serif SC", "Songti SC", STSong, "SimSun", serif';
    const quoteLines = wrapText(ctx, quote, width - padding * 2);

    let interpLines: string[] = [];
    if (interpretation) {
      ctx.font = '15px "PingFang SC", "Microsoft YaHei", sans-serif';
      interpLines = wrapText(ctx, interpretation, width - padding * 2);
    }

    const calculatedHeight = 160 + quoteLines.length * 36 + (interpLines.length > 0 ? interpLines.length * 24 + 40 : 0) + 120;
    const height = Math.max(calculatedHeight, 480);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // 1. 背景：宣纸底色
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

    // 2. 宣纸内框装饰双边框
    ctx.strokeStyle = '#E2DCD5';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = '#D5CDC4';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    // 3. 顶部朱红小印章：“正法眼”
    drawSeal(ctx, width / 2, 60, '正法眼');

    // 4. 正文名句
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 22px "Noto Serif SC", "Songti SC", STSong, "SimSun", serif';
    ctx.textAlign = 'center';
    let y = 140;
    quoteLines.forEach((line) => {
      ctx.fillText(line, width / 2, y);
      y += 36;
    });

    // 5. 分割装饰短线
    y += 12;
    ctx.strokeStyle = '#C2B8A3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 40, y);
    ctx.lineTo(width / 2 + 40, y);
    ctx.stroke();

    // 6. 白话解读
    if (interpLines.length > 0) {
      y += 32;
      ctx.fillStyle = '#57534E';
      ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
      interpLines.forEach((line) => {
        ctx.fillText(line, width / 2, y);
        y += 24;
      });
    }

    // 7. 底部出处与标识
    const bottomY = height - 56;
    ctx.fillStyle = '#78716C';
    ctx.font = '13px "Noto Serif SC", "Songti SC", serif';
    const sourceText = [sourceTitle, author ? `· ${author}` : ''].filter(Boolean).join(' ');
    ctx.fillText(sourceText, width / 2, bottomY);

    ctx.fillStyle = '#A8A29E';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('禅宗知识库 · chanzong.space', width / 2, bottomY + 20);

    // 8. 右下角钤印：“心印”
    drawSeal(ctx, width - 60, height - 60, '心印', 14);
  };

  // 辅助：文字自动折行
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    paragraphs.forEach((p) => {
      let currentLine = '';
      for (let i = 0; i < p.length; i++) {
        const char = p[i];
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    });

    return lines;
  }

  // 辅助：绘制朱红古风印章
  function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, size = 18) {
    const sealSize = size * 1.8;
    ctx.save();
    ctx.strokeStyle = '#B91C1C';
    ctx.fillStyle = 'rgba(185, 28, 28, 0.08)';
    ctx.lineWidth = 1.5;

    // 印章外框带微圆角
    ctx.beginPath();
    ctx.rect(x - sealSize / 2, y - sealSize / 2, sealSize, sealSize);
    ctx.fill();
    ctx.stroke();

    // 印章文字
    ctx.fillStyle = '#B91C1C';
    ctx.font = `bold ${size * 0.58}px "Noto Serif SC", "Songti SC", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
    ctx.restore();
  }

  // 保存图片
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `禅语金句_${(sourceTitle || '禅宗知识库').slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // 降级方案：复制纯文本
      navigator.clipboard.writeText(`「${quote}」\n${interpretation ? `${interpretation}\n` : ''}—— 见《${sourceTitle || '禅宗典籍'}》`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-lg w-full bg-[#18181B] border border-stone-700 rounded-2xl shadow-2xl p-6 text-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">📜</span>
            <h3 className="font-serif font-bold text-stone-100">禅语卡片 · 雅集分享</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition"
          >
            ✕
          </button>
        </div>

        {/* 预览卡片容器 */}
        <div className="my-5 flex justify-center overflow-auto max-h-[60vh] rounded-xl shadow-inner border border-stone-800 bg-[#0C0A09] p-3">
          <canvas ref={canvasRef} className="rounded-lg shadow-md max-w-full h-auto" />
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <span className="text-xs text-stone-400">长按或点击右侧按钮保存/分享</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition flex items-center gap-1.5"
            >
              {copied ? '✅ 已复制' : '📋 复制图片'}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition flex items-center gap-1.5"
            >
              {downloading ? '保存中...' : '💾 保存高清海报'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
