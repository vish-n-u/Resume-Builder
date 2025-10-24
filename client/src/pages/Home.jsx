import React from 'react'
import Banner from '../components/home/Banner'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Testimonial from '../components/home/Testimonial'
import CallToAction from '../components/home/CallToAction'
import Footer from '../components/home/Footer'
import SEO from '../components/SEO'

const Home = () => {
  return (
    <>
      <SEO
        title="Flower Resume - AI-Powered Resume Builder | Create Professional Resumes"
        description="Build stunning professional resumes with AI assistance. Choose from modern templates, get AI-powered suggestions, and export to PDF. Free resume builder with smart features."
        keywords="resume builder, CV maker, professional resume, AI resume builder, free resume templates, job application, career tools"
        ogUrl="https://flowerresume.com/"
      />
      <main>
        <Banner />
        <Hero />
        <Features />
        <Testimonial />
        <CallToAction />
        <Footer />
      </main>
    </>
  )
}

export default Home
