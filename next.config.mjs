/** @type {import('next').NextConfig} */
// 重定向与响应头规则已迁移至 public/_redirects 与 public/_headers，由 Cloudflare Pages 边缘原生执行
const nextConfig = {
  output: 'export',
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
