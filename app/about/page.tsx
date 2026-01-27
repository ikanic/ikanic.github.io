import { Github, Mail, Linkedin, Twitter } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-6">
            {/* 프로필 섹션 */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* 프로필 이미지 */}
                    <div className="w-40 h-40 rounded-full backdrop-blur-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl shrink-0">
                        👨‍💻
                    </div>

                    {/* 소개 */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            안녕하세요!
                        </h1>
                        <p className="text-xl text-gray-700 mb-4">
                            개발을 사랑하는 개발자입니다
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            웹 개발과 새로운 기술을 배우는 것을 좋아합니다. 이
                            블로그에서는 개발 과정에서 배운 것들과 경험을
                            공유하고 있습니다.
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
                    {/* Frontend */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-2xl">💻</span>
                            Frontend
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "React",
                                "Next.js",
                                "TypeScript",
                                "Tailwind CSS",
                                "Vue.js",
                            ].map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/40 rounded-lg text-sm text-blue-700 font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Backend */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-2xl">⚙️</span>
                            Backend
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Node.js",
                                "Express",
                                "Python",
                                "FastAPI",
                                "PostgreSQL",
                            ].map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 backdrop-blur-xl bg-purple-500/20 border border-purple-400/40 rounded-lg text-sm text-purple-700 font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* DevOps & Tools */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🛠️</span>
                            DevOps & Tools
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Git",
                                "Docker",
                                "AWS",
                                "GitHub Actions",
                                "Vercel",
                            ].map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 backdrop-blur-xl bg-green-500/20 border border-green-400/40 rounded-lg text-sm text-green-700 font-medium"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Design */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎨</span>
                            Design
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {["Figma", "Adobe XD", "UI/UX Design"].map(
                                (skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 backdrop-blur-xl bg-pink-500/20 border border-pink-400/40 rounded-lg text-sm text-pink-700 font-medium"
                                    >
                                        {skill}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 연락처 & SNS */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a
                        href="mailto:your@email.com"
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
                        href="https://github.com"
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
                        href="https://linkedin.com"
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
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-3 p-6 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all hover:scale-105 group"
                    >
                        <Twitter
                            size={32}
                            className="text-gray-700 group-hover:text-blue-400 transition-colors"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Twitter
                        </span>
                    </a>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        언제든지 연락주세요! 함께 이야기 나누는 것을 좋아합니다
                        😊
                    </p>
                </div>
            </div>
        </div>
    );
}
