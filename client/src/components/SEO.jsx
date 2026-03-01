import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({
  title = 'Flower Resume - Free Unlimited AI Resume Builder | Paste Job Description & Create Tailored Resumes',
  description = 'Create unlimited resumes for free with AI. Paste any job description and get a perfectly tailored resume in seconds. Free resume downloads as PDF — no watermarks, no limits, no credit card required.',
  keywords = 'free resume builder, free unlimited resume creator, AI resume builder, paste job description resume, free resume download PDF, no watermark resume builder, create resume from job description, free CV maker, unlimited resume downloads, AI resume generator, JD to resume, tailored resume builder, free online resume maker',
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
