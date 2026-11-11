/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/classics', destination: '/books', permanent: true },
      { source: '/zh-tw/classics', destination: '/zh-tw/books', permanent: true },
      { source: '/books/liuzutanjing', destination: '/classics/tanjing', permanent: true },
      { source: '/classics/liuzutanjing', destination: '/classics/tanjing', permanent: true },
      { source: '/zh-tw/books/liuzutanjing', destination: '/zh-tw/classics/tanjing', permanent: true },
      { source: '/zh-tw/classics/liuzutanjing', destination: '/zh-tw/classics/tanjing', permanent: true },
      { source: '/classics/huanzhu_an_qinggui', destination: '/classics/huanzhu-anqinggui', permanent: true },
      { source: '/zh-tw/classics/huanzhu_an_qinggui', destination: '/zh-tw/classics/huanzhu-anqinggui', permanent: true },
      { source: '/classics/huanzhuanqinggui', destination: '/classics/huanzhu-anqinggui', permanent: true },
      { source: '/zh-tw/classics/huanzhuanqinggui', destination: '/zh-tw/classics/huanzhu-anqinggui', permanent: true },
      { source: '/classics/chixiubaizhangqinggui', destination: '/classics/chixiu-baizhang-qinggui', permanent: true },
      { source: '/zh-tw/classics/chixiubaizhangqinggui', destination: '/zh-tw/classics/chixiu-baizhang-qinggui', permanent: true },
      { source: '/classics/baizhangqinggui', destination: '/classics/chixiu-baizhang-qinggui', permanent: true },
      { source: '/zh-tw/classics/baizhangqinggui', destination: '/zh-tw/classics/chixiu-baizhang-qinggui', permanent: true },
      { source: '/books/wanlinglu', destination: '/classics/huangbo_wanlinglu', permanent: true },
      { source: '/classics/wanlinglu', destination: '/classics/huangbo_wanlinglu', permanent: true },
      { source: '/zh-tw/books/wanlinglu', destination: '/zh-tw/classics/huangbo_wanlinglu', permanent: true },
      { source: '/zh-tw/classics/wanlinglu', destination: '/zh-tw/classics/huangbo_wanlinglu', permanent: true },
      { source: '/books/yunmenguanglu', destination: '/classics/yunmen', permanent: true },
      { source: '/classics/yunmenguanglu', destination: '/classics/yunmen', permanent: true },
      { source: '/zh-tw/books/yunmenguanglu', destination: '/zh-tw/classics/yunmen', permanent: true },
      { source: '/zh-tw/classics/yunmenguanglu', destination: '/zh-tw/classics/yunmen', permanent: true },
      { source: '/books/wanshan_tongguiji', destination: '/classics/wanshantongguiji', permanent: true },
      { source: '/classics/wanshan_tongguiji', destination: '/classics/wanshantongguiji', permanent: true },
      { source: '/zh-tw/books/wanshan_tongguiji', destination: '/zh-tw/classics/wanshantongguiji', permanent: true },
      { source: '/zh-tw/classics/wanshan_tongguiji', destination: '/zh-tw/classics/wanshantongguiji', permanent: true },
      { source: '/books/:id', destination: '/classics/:id', permanent: true },
      { source: '/zh-tw/books/:id', destination: '/zh-tw/classics/:id', permanent: true },
      { source: '/classics/runingyulu', destination: '/classics/rujingyulu', permanent: true },
      { source: '/classics/runingxuyulu', destination: '/classics/rujingxuyulu', permanent: true },
      { source: '/persons/damo', destination: '/persons/bodhidharma', permanent: true },
      { source: '/zh-tw/persons/damo', destination: '/zh-tw/persons/bodhidharma', permanent: true },
      { source: '/persons/zongmi', destination: '/persons/guifeng-zongmi', permanent: true },
      { source: '/zh-tw/persons/zongmi', destination: '/zh-tw/persons/guifeng-zongmi', permanent: true },
      { source: '/persons/dahui', destination: '/persons/dahui-zonggao', permanent: true },
      { source: '/zh-tw/persons/dahui', destination: '/zh-tw/persons/dahui-zonggao', permanent: true },
      { source: '/concepts/kanhuatou', destination: '/methods/kanhuatou', permanent: true },
      { source: '/zh-tw/concepts/kanhuatou', destination: '/zh-tw/methods/kanhuatou', permanent: true },
      { source: '/concepts/daily-zen', destination: '/methods/daily-zen', permanent: true },
      { source: '/zh-tw/concepts/daily-zen', destination: '/zh-tw/methods/daily-zen', permanent: true },
      { source: '/persons/baozhi', destination: '/persons/zhigong', permanent: true },
      { source: '/persons/sengzhao', destination: '/persons/seng-zhao', permanent: true },
      { source: '/persons/farong', destination: '/persons/niutou-farong', permanent: true },
      { source: '/persons/chuyuan', destination: '/persons/shishuang-chuyuan', permanent: true },
      { source: '/persons/runing', destination: '/persons/rujing', permanent: true },
      { source: '/persons/fudaoshi', destination: '/persons/fudashi', permanent: true },
      { source: '/persons/furong-daookai', destination: '/persons/furong-daokai', permanent: true },
      { source: '/persons/taiping-huiman', destination: '/persons/taiping-huimen', permanent: true },
      { source: '/persons/changsha-jingscen', destination: '/persons/changsha-jingcen', permanent: true },
      { source: '/persons/datateleya', destination: '/persons/datateleiya', permanent: true },
      { source: '/concepts/fanyin', destination: '/concepts/fayin', permanent: true },
      { source: '/concepts/ranxiu', destination: '/concepts/ranxin', permanent: true },
      { source: '/concepts/jijing-xingxing', destination: '/concepts/jiji-xingxing', permanent: true },
      { source: '/concepts/wu-shi-zhi-zhi', destination: '/concepts/wu-zhi-zhi-zhi', permanent: true },
      { source: '/concepts/chanyiao-yizhi', destination: '/concepts/chanjiao-yizhi', permanent: true },
      { source: '/concepts/tui-sui-duizhi', destination: '/concepts/tui-duo-duizhi', permanent: true },
      { source: '/concepts/zhanshen-yilu', destination: '/concepts/zhuanshen-yilu', permanent: true },
      { source: '/concepts/siquan', destination: '/concepts/siguan', permanent: true },
      { source: '/concepts/kong-ran-wu-sheng', destination: '/concepts/kuo-ran-wu-sheng', permanent: true },
      { source: '/concepts/fengxian', destination: '/concepts/fengfan', permanent: true },
      { source: '/methods/jiefeng', destination: '/methods/jifeng', permanent: true },
      { source: '/methods/yixing-sammei', destination: '/methods/yixing-sanmei', permanent: true },
      { source: '/methods/linji-ganzong', destination: '/methods/linji-gangzong', permanent: true },
      { source: '/methods/yunmen-ganzong', destination: '/methods/yunmen-gangzong', permanent: true },
      { source: '/methods/caodong-ganzong', destination: '/methods/caodong-gangzong', permanent: true },
      { source: '/methods/weiyang-ganzong', destination: '/methods/weiyang-gangzong', permanent: true },
      { source: '/methods/fayan-ganzong', destination: '/methods/fayan-gangzong', permanent: true },
      { source: '/methods/wujia-ganzong', destination: '/methods/wujia-gangzong', permanent: true },
      { source: '/methods/huanglong-zhanshen-fa', destination: '/methods/huanglong-zhuanshen-fa', permanent: true },
      // 实体去重归并 301 重定向（概念 7 组、祖师 6 组、公案 3 组，覆盖简繁双语路由）
      { source: '/concepts/zheng-fa-yan-zang', destination: '/concepts/zhengfa-yancang', permanent: true },
      { source: '/zh-tw/concepts/zheng-fa-yan-zang', destination: '/zh-tw/concepts/zhengfa-yancang', permanent: true },
      { source: '/concepts/yi-hua-kai-wu-ye', destination: '/concepts/yihua-wuye', permanent: true },
      { source: '/zh-tw/concepts/yi-hua-kai-wu-ye', destination: '/zh-tw/concepts/yihua-wuye', permanent: true },
      { source: '/concepts/yixin-ermen', destination: '/concepts/yi-xin-er-men', permanent: true },
      { source: '/zh-tw/concepts/yixin-ermen', destination: '/zh-tw/concepts/yi-xin-er-men', permanent: true },
      { source: '/concepts/shier-shi-ge', destination: '/concepts/shi-er-shi-ge', permanent: true },
      { source: '/zh-tw/concepts/shier-shi-ge', destination: '/zh-tw/concepts/shi-er-shi-ge', permanent: true },
      { source: '/concepts/san-xuan-san-yao', destination: '/concepts/sanxuan-sanyao', permanent: true },
      { source: '/zh-tw/concepts/san-xuan-san-yao', destination: '/zh-tw/concepts/sanxuan-sanyao', permanent: true },
      { source: '/concepts/yun-men-san-ju', destination: '/concepts/yunmen-sanju', permanent: true },
      { source: '/zh-tw/concepts/yun-men-san-ju', destination: '/zh-tw/concepts/yunmen-sanju', permanent: true },
      { source: '/concepts/shi-cun-wu-guan', destination: '/concepts/shicun-wuguan', permanent: true },
      { source: '/zh-tw/concepts/shi-cun-wu-guan', destination: '/zh-tw/concepts/shicun-wuguan', permanent: true },
      { source: '/persons/seng-rui', destination: '/persons/sengrui', permanent: true },
      { source: '/zh-tw/persons/seng-rui', destination: '/zh-tw/persons/sengrui', permanent: true },
      { source: '/persons/fu-dashi', destination: '/persons/fudashi', permanent: true },
      { source: '/zh-tw/persons/fu-dashi', destination: '/zh-tw/persons/fudashi', permanent: true },
      { source: '/persons/kumarajiva', destination: '/persons/jiumoluoshi', permanent: true },
      { source: '/zh-tw/persons/kumarajiva', destination: '/zh-tw/persons/jiumoluoshi', permanent: true },
      { source: '/persons/ming-bodhisattva', destination: '/persons/maming', permanent: true },
      { source: '/zh-tw/persons/ming-bodhisattva', destination: '/zh-tw/persons/maming', permanent: true },
      { source: '/persons/xuedou-zhongxian', destination: '/persons/xuedou-chongxian', permanent: true },
      { source: '/zh-tw/persons/xuedou-zhongxian', destination: '/zh-tw/persons/xuedou-chongxian', permanent: true },
      { source: '/persons/zhu-daosheng', destination: '/persons/daosheng', permanent: true },
      { source: '/zh-tw/persons/zhu-daosheng', destination: '/zh-tw/persons/daosheng', permanent: true },
      { source: '/koan/koan-164', destination: '/koan/koan-1', permanent: true },
      { source: '/zh-tw/koan/koan-164', destination: '/zh-tw/koan/koan-1', permanent: true },
      { source: '/koan/koan-158', destination: '/koan/koan-4', permanent: true },
      { source: '/zh-tw/koan/koan-158', destination: '/zh-tw/koan/koan-4', permanent: true },
      { source: '/koan/koan-176', destination: '/koan/koan-63', permanent: true },
      { source: '/zh-tw/koan/koan-176', destination: '/zh-tw/koan/koan-63', permanent: true },
    ];
  },

  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // 繁体站响应头显式声明语言（静态 HTML 根标签 lang 由共享根布局决定，响应头与 hreflang / inLanguage 共同提供繁体信号）
        source: '/zh-tw/:path*',
        headers: [{ key: 'Content-Language', value: 'zh-Hant' }],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // 静态图片资产（Logo、OG Banner、打赏码等）长期边缘强缓存，禁止重复回源
        source: '/(logo-.*|og-banner.jpg|images/:path*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // 站点地图、robots 与 GEO 索引文件，允许 CDN 边缘强缓存 7 天，阻断爬虫并发回源穿透
        source: '/(sitemap.xml|sitemaps/:path*|llms.txt|llms-full.txt|robots.txt)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        // 全站所有页面：浏览器端协商缓存（max-age=0），Vercel 边缘 CDN 节点强缓存 7 天（s-maxage=604800），彻底消除 Fast Origin Transfer 回源流量
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=604800, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
