// src/lib/seo/MetaTags.tsx
import Head from "next/head";

interface MetaTagsProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string; // e.g., "website" or "article"
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  url = "",
  image = "",
  type = "website",
}) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    {url && <meta property="og:url" content={url} />}
    {image && <meta property="og:image" content={image} />}
    <meta name="twitter:card" content="summary_large_image" />
    {url && <meta name="twitter:url" content={url} />}
    {title && <meta name="twitter:title" content={title} />}
    {description && <meta name="twitter:description" content={description} />}
    {image && <meta name="twitter:image" content={image} />}
  </Head>
);

export default MetaTags;
