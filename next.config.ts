import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    output: "export",
    images: {
        unoptimized: true,
    },

    // 프로덕션 최적화
    compiler: {
        removeConsole: process.env.NODE_ENV === "production",
    },

    // 실험적 기능 - 더 빠른 빌드와 작은 번들
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "date-fns",
            "react",
            "react-dom",
        ],
    },

    // Turbopack 설정 (Next.js 16+ 기본값)
    // Turbopack은 자동으로 번들 최적화를 수행합니다
    turbopack: {},
};

export default nextConfig;
