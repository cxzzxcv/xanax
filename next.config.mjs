/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export — emits a plain /out folder of HTML/CSS/JS that any static
  // host (Cloudflare Pages, etc.) can serve. No Node server needed.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
