import { getAllPosts, getAllCategories } from "@/lib/posts";
import BlogClient from "./BlogClient";

export default function BlogPage() {
    const allPosts = getAllPosts();
    const categories = getAllCategories();

    return (
        <BlogClient initialPosts={allPosts} initialCategories={categories} />
    );
}
