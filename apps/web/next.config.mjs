import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sistema-mare/core", "@sistema-mare/database"],
  webpack(config) {
    // Resolve workspace packages from their source directly,
    // so no manual `pnpm build` is needed during development.
    config.resolve.alias["@sistema-mare/core"] = path.resolve(
      __dirname,
      "../../packages/core/src/index.ts",
    );
    return config;
  },
};

export default nextConfig;
