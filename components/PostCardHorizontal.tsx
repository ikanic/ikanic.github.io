import Link from "next/link";
import Image from "next/image";
import { PostData } from "@/lib/posts";
import { Calendar, Tag, Folder } from "lucide-react";
import { format } from "date-fns";

interface PostCardHorizontalProps {
    post: PostData;
}

export default function PostCardHorizontal({ post }: PostCardHorizontalProps) {
    // 표시할 날짜 결정
    const displayDate = post.modifiedDate || post.createdDate;
    const isModified =
        post.modifiedDate && post.modifiedDate !== post.createdDate;

    return (
        <Link href={`/blog/${post.slug}`}>
            <article className="group backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl overflow-hidden hover:bg-white/60 hover:border-white/80 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] transition-all duration-300">
                <div className="flex flex-col sm:flex-row">
                    {/* 콘텐츠 영역 */}
                    <div className="flex-1 p-6 flex flex-col justify-between min-w-0 order-2 sm:order-1">
                        <div>
                            {/* 시리즈 배지 */}
                            {post.series && (
                                <div className="inline-block mb-2 px-3 py-1 rounded-full backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40">
                                    <span className="text-xs text-blue-700 font-medium">
                                        📚 {post.series}
                                    </span>
                                </div>
                            )}

                            {/* 제목 */}
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {post.title}
                            </h2>

                            {/* 설명 */}
                            {post.description && (
                                <p className="text-gray-700 mb-4 line-clamp-2 text-sm sm:text-base">
                                    {post.description}
                                </p>
                            )}
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                            {/* 날짜 */}
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>
                                    {format(
                                        new Date(displayDate),
                                        "yyyy.MM.dd",
                                    )}
                                </span>
                                {isModified && (
                                    <span className="text-xs text-gray-500">
                                        (수정됨)
                                    </span>
                                )}
                            </div>

                            {/* 카테고리 */}
                            {post.category && (
                                <div className="flex items-center gap-1">
                                    <Folder size={14} />
                                    <span>{post.category}</span>
                                </div>
                            )}

                            {/* 태그 */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Tag size={14} />
                                    <span className="line-clamp-1">
                                        {post.tags.slice(0, 3).join(", ")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 썸네일 이미지 - 16:9 비율 (썸네일이 있을 때만 표시) */}
                    {post.thumbnail && (
                        <div className="relative w-full sm:w-64 aspect-video sm:aspect-video shrink-0 overflow-hidden order-1 sm:order-2">
                            <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 100vw, 256px"
                            />
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
