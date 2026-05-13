// 사이트 기본 정보
export const siteConfig = {
    title: "MeenuLog",
    description: "개발, 디자인, 그리고 일상의 이야기를 공유합니다",
    author: "Mintaek Kim",
    copyright: "© 2021-2026 MeenuLog. Built with Next.js & Tailwind CSS",
};

// 연락처 정보
export const contactInfo = {
    email: "min4644@gmail.com",
    github: "https://github.com/ikanic",
    linkedin: "https://www.linkedin.com/in/ian-kim-kr/",
    x: "https://x.com/i_k_an_ic", // Twitter → X
};

// 네비게이션 메뉴
export const navigation = [
    { name: "Blog", path: "/blog" },
    { name: "Project", path: "/project" },
    { name: "About Me", path: "/about" },
];

// 홈 섹션
export const homeConfig = {
    hero: {
        title: "Welcome to My Blog",
        description: "개발, 디자인, 그리고 일상의 이야기를 공유합니다",
    },
    sections: [
        {
            title: "Blog",
            icon: "📝",
            description: "개발 관련 글과 학습 내용을 정리합니다",
            link: "/blog",
            gradient: "from-blue-500/20 to-purple-500/20",
        },
        {
            title: "Project",
            icon: "🚀",
            description: "진행한 프로젝트들을 소개합니다",
            link: "/project",
            gradient: "from-purple-500/20 to-pink-500/20",
        },
        {
            title: "About Me",
            icon: "👋",
            description: "저에 대해 소개합니다",
            link: "/about",
            gradient: "from-pink-500/20 to-orange-500/20",
        },
    ],
};

// About 페이지
export const aboutConfig = {
    profile: {
        emoji: "👨‍💻",
        title: "안녕하세요!",
        subtitle: "개발을 사랑하는 개발자입니다",
        description:
            "iOS 앱 개발과 새로운 기술을 배우는 것을 좋아합니다. 이 블로그에서는 개발 과정에서 배운 것들과 경험을 공유하고 있습니다.",
    },
    // 스킬을 배열로 변경 - 자유롭게 추가/삭제 가능
    skills: [
        {
            id: 1,
            title: "iOS",
            icon: "📱",
            color: "blue", // blue, purple, green, pink 등
            items: ["Swift", "SwiftUI", "UIKit", "AVFoundation", "URLSession"],
        },
        {
            id: 2,
            title: "Backend",
            icon: "⚙️",
            color: "purple",
            items: ["Node.js", "Express", "PostgreSQL"],
        },
        {
            id: 3,
            title: "DevOps & Tools",
            icon: "🛠️",
            color: "green",
            items: ["Git", "AWS"],
        },
        {
            id: 4,
            title: "Design",
            icon: "🎨",
            color: "pink",
            items: ["Figma"],
        },
    ],
    contactMessage:
        "언제든지 연락주세요! 함께 이야기 나누는 것을 좋아합니다 😊",
};

// Project 페이지
export const projectConfig = {
    header: {
        title: "Projects",
        description: "지금까지 진행한 프로젝트들을 소개합니다",
    },
    projects: [
        {
            id: 1,
            title: "PiPPl",
            description:
                "iOS / iPadOS용 Picture in Picture 비디오 플레이어 앱입니다.",
            tags: ["Picture in Picture", "AVKit", "PhotoKit"],
            image: "🌐",
            // 링크는 필요한 것만 추가 (없으면 빈 배열)
            links: [
                // { type: "demo", url: "#", label: "Demo" },
                {
                    type: "github",
                    url: "https://github.com/ikanic/PiPPl",
                    label: "GitHub",
                },
                {
                    type: "appstore",
                    url: "https://apps.apple.com/kr/app/pippl/id6479563734",
                    label: "App Store",
                },
            ],
            period: "2024.01 -",
        },
        // {
        //     id: 2,
        //     title: "iOS Sample App",
        //     description:
        //         "Swift와 SwiftUI를 사용한 iOS 앱입니다. Core Data를 활용한 데이터 관리와 MVVM 아키텍처를 적용했습니다.",
        //     tags: ["Swift", "SwiftUI", "iOS"],
        //     image: "📱",
        //     links: [
        //         {
        //             type: "project",
        //             url: "/project/ios-music-app",
        //             label: "Details",
        //         }, // 내부 프로젝트 페이지
        //         {
        //             type: "appstore",
        //             url: "https://apps.apple.com",
        //             label: "App Store",
        //         },
        //         {
        //             type: "video",
        //             url: "https://youtube.com",
        //             label: "Demo Video",
        //         },
        //         { type: "github", url: "https://github.com", label: "GitHub" },
        //     ],
        //     period: "2023.12",
        // },
        // {
        //     id: 3,
        //     title: "Sample Project",
        //     description: "GitHub 링크만 있는 프로젝트입니다.",
        //     tags: ["Vue.js", "Firebase"],
        //     image: "💡",
        //     links: [
        //         { type: "github", url: "https://github.com", label: "GitHub" },
        //     ],
        //     period: "2023.11",
        // },
        // {
        //     id: 4,
        //     title: "Private Project",
        //     description: "내부 프로젝트 페이지만 있는 프로젝트입니다.",
        //     tags: ["React", "TypeScript"],
        //     image: "🔒",
        //     links: [
        //         { type: "project", url: "/project/private", label: "Details" },
        //     ],
        //     period: "2023.10",
        // },
    ],
    footerMessage: "더 많은 프로젝트는 GitHub에서 확인하실 수 있습니다",
};
