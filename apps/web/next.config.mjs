import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@sistema-mare/core", "@sistema-mare/database"],
  webpack(config) {
    // Resolve workspace packages from their source directly in development,
    // so no manual `pnpm build` is needed. In production the packages are
    // built before Next.js runs, so the alias is not needed.
    if (process.env.NODE_ENV !== "production") {
      config.resolve.alias["@sistema-mare/core"] = path.resolve(
        __dirname,
        "../../packages/core/src/index.ts",
      );
    }
    return config;
  },
};

export default nextConfig;
