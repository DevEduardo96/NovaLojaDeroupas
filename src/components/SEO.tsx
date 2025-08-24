import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Nectix Store - Loja de Roupas Premium",
  description = "Loja online de roupas premium: hoodies, camisetas, moda streetwear e acessórios. Qualidade superior, estilo único e entrega rápida.",
  keywords = "loja de roupas online, hoodies premium, camisetas, moda streetwear, roupas femininas, moda jovem",
  image = "/ntix.webp",
  url = "https://nectixstore.com",
  type = "website"
}) => {
  const siteTitle = title.includes('Nectix Store') ? title : `${title} | Nectix Store`;

  return (
    <Helmet>
      {/* Título principal */}
      <title>{siteTitle}</title>
      
      {/* Meta tags básicas */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Nectix Store" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
