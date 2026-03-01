import React from 'react'
import Banner from '../components/home/Banner'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import CallToAction from '../components/home/CallToAction'
import Footer from '../components/home/Footer'
import SEO from '../components/SEO'

const Home = () => {
  return (
    <>
      <SEO
        title="Flower Resume - Free Unlimited AI Resume Builder | Paste Job Description & Download PDF"
        description="Create unlimited resumes for free with AI. Paste any job description and get a perfectly tailored resume in seconds. Free PDF downloads — no watermarks, no limits, no credit card required."
        keywords="free resume builder, free unlimited resume creator, AI resume builder, paste job description resume, free resume download PDF, no watermark resume builder, create resume from JD, free CV maker, unlimited resume downloads, AI resume generator, tailored resume builder, free online resume maker, job description to resume"
        ogUrl="https://flowerresume.com/"
      />
      <main>
        <Banner />
        <Hero />
        <Features />
        <CallToAction />
        <Footer />
      </main>
    </>
  )
}

export default Home
