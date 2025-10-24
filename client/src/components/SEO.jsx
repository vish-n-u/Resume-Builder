import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({
  title = 'Flower Resume - AI-Powered Resume Builder | Create Professional Resumes',
  description = 'Build stunning professional resumes with AI assistance. Choose from modern templates, get AI-powered suggestions, and export to PDF. Free resume builder with smart features.',
  keywords = 'resume builder, CV maker, professional resume, AI resume builder, free resume templates, job application, career tools',
  ogImage = '/logo.svg',
  ogUrl = 'https://flowerresume.com/',
  article = false
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Canonical */}
      <link rel="canonical" href={ogUrl} />
    </Helmet>
  )
}

export default SEO
