declare module 'next-pwa' {
  const withPWA: (config: {
    dest: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
  }) => (nextConfig: import('next').NextConfig) => import('next').NextConfig

  export default withPWA
}
