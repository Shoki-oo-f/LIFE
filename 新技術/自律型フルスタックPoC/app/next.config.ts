import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // streamUI (AI SDK RSC) requires experimental serverActions
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default nextConfig;
