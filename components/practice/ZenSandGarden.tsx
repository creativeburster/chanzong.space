'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Sparkles, Download, Eraser } from 'lucide-react';
import { zenAudio } from '@/lib/audio';
import { useLang } from '@/context/LangContext';

export const ZenSandGarden: React.FC = () => {
  const { t } = useLang();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // 初始化沙地与禅石
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 宣纸沙地底色
    ctx.fillStyle = '#EBE7DF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制自然沙地细腻底纹
    ctx.fillStyle = 'rgba(180, 160, 130, 0.08)';
    for (let i = 0; i < canvas.width; i += 8) {
      for (let j = 0; j < canvas.height; j += 8) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 4, 4);
        }
      }
    }

    // 绘制 3 尊自然禅石 (京都枯山水石组)
    drawZenRock(ctx, canvas.width * 0.3, canvas.height * 0.45, 36, '#475569');
    drawZenRock(ctx, canvas.width * 0.7, canvas.height * 0.55, 48, '#334155');
    drawZenRock(ctx, canvas.width * 0.55, canvas.height * 0.3, 24, '#64748B');
  };

  const drawZenRock = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
    // 禅石暗影
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 6, r * 1.1, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    // 禅石主体
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // 苔藓微绿修饰
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(101, 163, 13, 0.35)';
    ctx.fill();
  };

  useEffect(() => {
    initCanvas();
  }, []);

  const drawRakeLines = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (lastPointRef.current) {
      zenAudio.playSandRake(0.18);
      const prev = lastPointRef.current;

      // 绘制多股平行梳齿波纹 (模拟五齿木耙)
      const prongs = [-12, -6, 0, 6, 12];
      prongs.forEach((offset) => {
        ctx.beginPath();
        ctx.moveTo(prev.x + offset, prev.y + offset);
        ctx.lineTo(x + offset, y + offset);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(140, 115, 85, 0.35)';
        ctx.lineCap = 'round';
        ctx.stroke();

        // 凸起反光高光
        ctx.beginPath();
        ctx.moveTo(prev.x + offset + 1, prev.y + offset + 1);
        ctx.lineTo(x + offset + 1, y + offset + 1);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();
      });
    }

    lastPointRef.current = { x, y };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPointRef.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    drawRakeLines(clientX - rect.left, clientY - rect.top);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-b from-stone-50 via-white to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-sm select-none">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-800 font-bold">
            {t('一沙一世界 · 耙沙抚心')}
          </div>
          <h3 className="text-xl font-bold font-serif-zen text-slate-900">
            {t('枯山水 · 禅意指尖沙盘')}
          </h3>
        </div>

        <button
          onClick={initCanvas}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition-colors flex items-center space-x-1"
          title={t('平整沙盘 · 抹平心尘')}
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">{t('抹平')}</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {t('在沙面上轻缓划动，绘制水波涟漪与环石云纹。观沙痕起灭，歇去万千执念。')}
      </p>

      {/* 耙沙画布 */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-900/20 shadow-inner flex justify-center bg-[#EBE7DF]">
        <canvas
          ref={canvasRef}
          width={500}
          height={320}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="w-full h-auto cursor-crosshair touch-none"
        />

        <div className="absolute bottom-2 right-3 text-[10px] text-stone-500 font-serif-zen pointer-events-none opacity-60">
          京都枯山水 · 寂静清净
        </div>
      </div>
    </div>
  );
};
