import {
    getAllPosts,
    getAllCategories,
    getAllTags,
    getAllSeries,
} from "@/lib/posts";
import BlogClient from "./BlogClient";
import { Suspense } from "react";

function BlogContent() {
    const allPosts = getAllPosts();
    const categories = getAllCategories();
    const tags = getAllTags();
    const series = getAllSeries();

    return (
        <BlogClient
            initialPosts={allPosts}
            initialCategories={categories}
            initialTags={tags}
            initialSeries={series}
        />
    );
}

export default function BlogPage() {
    return (
        <Suspense
            fallback={<div className="text-center py-12">Loading...</div>}
        >
            <BlogContent />
        </Suspense>
    );
}
