export interface PostData {
    slug: string;
    title: string;
    createdDate: string;
    modifiedDate?: string;
    category?: string;
    tags?: string[];
    series?: string;
    seriesOrder?: number;
    description?: string;
    thumbnail?: string;
    content?: string;
    readingTime?: string;
    readingMinutes?: number;
}
