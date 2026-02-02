import { Github, Mail, Linkedin } from "lucide-react";
import { aboutConfig, contactInfo } from "@/config/config";

// X(Twitter) 로고 SVG
const XIcon = ({
    size = 32,
    className = "",
}: {
    size?: number;
    className?: string;
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// 색상 매핑
const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
        blue: "bg-blue-500/20 border-blue-400/40 text-blue-700",
        purple: "bg-purple-500/20 border-purple-400/40 text-purple-700",
        green: "bg-green-500/20 border-green-400/40 text-green-700",
        pink: "bg-pink-500/20 border-pink-400/40 text-pink-700",
        orange: "bg-orange-500/20 border-orange-400/40 text-orange-700",
        red: "bg-red-500/20 border-red-400/40 text-red-700",
        indigo: "bg-indigo-500/20 border-indigo-400/40 text-indigo-700",
        teal: "bg-teal-500/20 border-teal-400/40 text-teal-700",
    };
    return colors[color] || colors.blue;
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-0 sm:px-6">
            {/* 프로필 섹션 */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* 프로필 이미지 */}
                    <div className="w-40 h-40 rounded-full backdrop-blur-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl shrink-0">
                        {aboutConfig.profile.emoji}
                    </div>

                    {/* 소개 */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {aboutConfig.profile.title}
                        </h1>
                        <p className="text-xl text-gray-700 mb-4">
                            {aboutConfig.profile.subtitle}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            {aboutConfig.profile.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* 스킬 섹션 */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Skills
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aboutConfig.skills.map((skill) => (
                        <div key={skill.id}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="text-2xl">{skill.icon}</span>
                                {skill.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skill.items.map((item) => (
                                    <span
                                        key={item}
                                        className={`px-3 py-1 backdrop-blur-xl border rounded-lg text-sm font-medium ${getColorClasses(skill.color)}`}
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 연락처 & SNS */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a
                        href={`mailto:${contactInfo.email}`}
                        className="flex flex-col items-center gap-3 p-6 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all hover:scale-105 group"
                    >
                        <Mail
                            size={32}
                            className="text-gray-700 group-hover:text-blue-600 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Email
                        </span>
                    </a>

                    <a
                        href={contactInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-3 p-6 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all hover:scale-105 group"
                    >
                        <Github
                            size={32}
                            className="text-gray-700 group-hover:text-gray-900 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            GitHub
                        </span>
                    </a>

                    <a
                        href={contactInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-3 p-6 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all hover:scale-105 group"
                    >
                        <Linkedin
                            size={32}
                            className="text-gray-700 group-hover:text-blue-600 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            LinkedIn
                        </span>
                    </a>

                    <a
                        href={contactInfo.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-3 p-6 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all hover:scale-105 group"
                    >
                        <XIcon
                            size={32}
                            className="text-gray-700 group-hover:text-gray-900 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            X
                        </span>
                    </a>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {aboutConfig.contactMessage}
                    </p>
                </div>
            </div>
        </div>
    );
}
