'use client';

import { useEffect, useRef } from 'react';

/**
 * 精准心跳：用 Web Worker 驱动，避免浏览器对后台标签页的 setInterval 节流
 * （Chrome 在页面隐藏 5 分钟后会把定时器降到约 1 次/分钟）。
 * 调用方应当基于“结束时间戳”计算剩余时间，心跳只负责触发刷新，而不是累加秒数。
 * 页面重新可见时会立即补一次心跳。Worker 不可用时降级为 setInterval。
 */
export function useAccurateTicker(active: boolean, onTick: () => void, intervalMs = 250) {
  const cbRef = useRef(onTick);
  useEffect(() => {
    cbRef.current = onTick;
  });

  useEffect(() => {
    if (!active) return;
    const tick = () => cbRef.current();
    let worker: Worker | null = null;
    let url: string | null = null;
    let fallback: ReturnType<typeof setInterval> | null = null;

    const startFallback = () => {
      if (!fallback) fallback = setInterval(tick, intervalMs);
    };

    try {
      const blob = new Blob([`setInterval(function(){postMessage(0)},${intervalMs});`], {
        type: 'application/javascript',
      });
      url = URL.createObjectURL(blob);
      worker = new Worker(url);
      worker.onmessage = tick;
      worker.onerror = () => {
        worker?.terminate();
        worker = null;
        startFallback();
      };
    } catch {
      startFallback();
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      if (fallback) clearInterval(fallback);
    };
  }, [active, intervalMs]);
}

/**
 * 计时进行中请求屏幕常亮（手机端息屏会让计时与声音中断）。
 * 浏览器不支持时静默忽略；页面重新可见时自动重新申请。
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const nav = navigator as unknown as {
          wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
        };
        if (!nav.wakeLock) return;
        const s = await nav.wakeLock.request('screen');
        if (cancelled) {
          s.release().catch(() => {});
        } else {
          sentinel = s;
        }
      } catch {
        // 用户拒绝或系统省电模式，忽略
      }
    };

    request();
    const onVisible = () => {
      if (document.visibilityState === 'visible') request();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
