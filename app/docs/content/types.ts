export type DocsArticle = {
  id: string;
  title: string;
  content: string;
};

export type DocsSection = {
  id: string;
  title: string;
  icon: string;
  description: string;
  articles: DocsArticle[];
};
