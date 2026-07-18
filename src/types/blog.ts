export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  imageGradient: string;
  category: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  tags: string[];
}
