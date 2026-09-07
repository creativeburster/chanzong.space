/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/books/liuzutanjing', destination: '/classics/tanjing', permanent: true },
      { source: '/classics/liuzutanjing', destination: '/classics/tanjing', permanent: true },
      { source: '/zh-tw/books/liuzutanjing', destination: '/zh-tw/classics/tanjing', permanent: true },
      { source: '/zh-tw/classics/liuzutanjing', destination: '/zh-tw/classics/tanjing', permanent: true },
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
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
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
    ];
  },
};

export default nextConfig;
