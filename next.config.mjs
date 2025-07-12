/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // The `ssh2` package is a server-side dependency that uses native Node.js
    // addons. Webpack, which Next.js uses for bundling, cannot handle these
    // native addons correctly. By marking `ssh2` as an external module, we
    // tell Webpack to not bundle it, and instead, it will be required at
    // runtime directly from `node_modules`.
    if (isServer) {
      config.externals.push("ssh2");
    }
    return config;
  },
};

export default nextConfig;