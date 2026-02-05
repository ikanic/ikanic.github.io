import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    output: "export",
    images: {
        unoptimized: true,
    },

    // iOS Safari 최적화
    compiler: {
        removeConsole: process.env.NODE_ENV === "production", // 프로덕션에서 console.log 제거
    },

    // 실험적 기능 - 더 빠른 빌드와 작은 번들
    experimental: {
        optimizePackageImports: [
            "lucide-react", // 아이콘 라이브러리 트리 쉐이킹
            "date-fns",
        ],
    },
};

export default nextConfig;
