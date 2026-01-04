import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
}

const BASE_URL = 'https://newoak4.netlify.app';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=1200';
const DEFAULT_DESCRIPTION = "NewOak Company Limited is Ghana's premier luxury real estate developer. Explore premium properties, penthouses, villas and residential estates in Haatso, Ashongman Estate, and Accra.";
const DEFAULT_KEYWORDS = 'luxury real estate Ghana, Accra properties, NewOak, Haatso real estate, Ashongman Estate, Ghana property investment, diaspora investment Ghana, premium homes Accra';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
  author = 'NewOak Company Limited',
  publishedTime,
  modifiedTime,
  structuredData,
}) => {
  const fullTitle = title
    ? `${title} | NewOak Company Limited`
    : 'NewOak Company Limited | Luxury Real Estate in Accra, Ghana';

  const currentUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NewOak Company Limited" />
      <meta property="og:locale" content="en_GH" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific meta (for blog posts) */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Pre-defined SEO configurations for pages
export const pageSEO = {
  home: {
    title: undefined, // Uses default
    description: "NewOak Company Limited is Ghana's premier luxury real estate developer. Explore premium properties, penthouses, villas and residential estates in Haatso, Ashongman Estate, and Accra. Investment opportunities for diaspora and high-net-worth individuals.",
    url: '/',
  },
  gallery: {
    title: 'Property Portfolio & Gallery',
    description: 'Browse our exclusive collection of luxury properties in Accra, Ghana. Penthouses, villas, residential estates, and commercial properties in Haatso, Ashongman Estate, and surrounding areas.',
    url: '/#/gallery',
    keywords: 'Ghana property gallery, Accra luxury homes, NewOak properties, Haatso penthouses, Ashongman villas, Ghana real estate portfolio',
  },
  upcomingProjects: {
    title: 'Upcoming Projects & Developments',
    description: 'Discover upcoming luxury real estate developments by NewOak Company Limited in Accra, Ghana. Pre-launch investment opportunities in premium properties.',
    url: '/#/upcoming-projects',
    keywords: 'upcoming Ghana real estate, new developments Accra, NewOak projects, Ghana property investment, pre-launch properties Ghana',
  },
  blog: {
    title: 'Real Estate Insights & News',
    description: 'Stay informed with the latest real estate news, market insights, investment tips, and expert advice from NewOak Company Limited in Ghana.',
    url: '/#/blog',
    keywords: 'Ghana real estate news, Accra property market, real estate investment tips, NewOak blog, Ghana housing market',
  },
};

// Helper for property pages
export const getPropertySEO = (property: {
  title: string;
  description: string;
  location: string;
  category: string;
  images: string[];
  id: string;
}) => ({
  title: `${property.title} - ${property.category} in ${property.location}`,
  description: property.description.substring(0, 160),
  image: property.images[0],
  url: `/#/property/${property.id}`,
  keywords: `${property.title}, ${property.location} property, ${property.category} Ghana, luxury ${property.category.toLowerCase()} Accra, NewOak ${property.title}`,
  type: 'product' as const,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.title,
    description: property.description,
    image: property.images,
    brand: {
      '@type': 'Organization',
      name: 'NewOak Company Limited',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      seller: {
        '@type': 'Organization',
        name: 'NewOak Company Limited',
      },
    },
  },
});

// Helper for blog posts
export const getBlogPostSEO = (post: {
  title: string;
  excerpt: string;
  coverImage?: string;
  slug: string;
  author: string;
  publishedAt: string;
  category: string;
  tags?: string[];
}) => ({
  title: post.title,
  description: post.excerpt.substring(0, 160),
  image: post.coverImage || DEFAULT_IMAGE,
  url: `/#/blog/${post.slug}`,
  type: 'article' as const,
  author: post.author,
  publishedTime: post.publishedAt,
  keywords: `${post.category}, ${post.tags?.join(', ') || ''}, Ghana real estate, NewOak blog`,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || DEFAULT_IMAGE,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NewOak Company Limited',
      logo: {
        '@type': 'ImageObject',
        url: 'https://newoak4.netlify.app/logo.png',
      },
    },
    datePublished: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://newoak4.netlify.app/#/blog/${post.slug}`,
    },
  },
});

export default SEO;
