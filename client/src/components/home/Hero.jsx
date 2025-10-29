import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Hero = () => {

    const {user} = useSelector(state => state.auth)

    const [menuOpen, setMenuOpen] = React.useState(false);

    const logos = [
        'https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/framer.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/huawei.svg',
        'https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg',
    ]

  return (
    <>
    <div className="min-h-screen pb-20">
        {/* Navbar */}
        <nav className="z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-40 text-sm">
            <a href="/" className="flex items-center gap-2">
                <span className="text-2xl">🌻</span>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Flower Resume</span>
            </a>

            <div className="hidden md:flex items-center gap-8 transition duration-500 text-slate-800">
                <a href="#" className="hover:text-yellow-600 transition">Home</a>
                <a href="#features" className="hover:text-yellow-600 transition">Features</a>
                <a href="#cta" className="hover:text-yellow-600 transition">Contact</a>
            </div>

            <div className="flex gap-2">
                <Link to='/app?state=register' className="hidden md:block px-6 py-2 bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-all rounded-full text-white" hidden={user}>
                    Get started
                </Link>
                <Link to='/app?state=login' className="hidden md:block px-6 py-2 border active:scale-95 hover:bg-yellow-50 transition-all rounded-full text-slate-700 hover:text-slate-900" hidden={user}>
                    Login
                </Link>
                <Link to='/app/profile' className='hidden md:block px-6 py-2 border active:scale-95 hover:bg-yellow-50 transition-all rounded-full text-slate-700 hover:text-slate-900' hidden={!user}>
                    Profile
                </Link>
                <Link to='/app' className='hidden md:block px-8 py-2 bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-all rounded-full text-white' hidden={!user}>
                    Dashboard
                </Link>
            </div>

            <button onClick={() => setMenuOpen(true)} className="md:hidden active:scale-90 transition" >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" className="lucide lucide-menu" >
                    <path d="M4 5h16M4 12h16M4 19h16" />
                </svg>
            </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-[100] bg-black/40 text-black backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`} >
            <a href="#" className="text-white">Home</a>
            <a href="#features" className="text-white">Features</a>
            <a href="#contact" className="text-white">Contact</a>
            {user && <Link to="/app/profile" className="text-white">Profile</Link>}
            {user && <Link to="/app" className="text-white">Dashboard</Link>}
            {!user && <Link to="/app?state=login" className="text-white">Login</Link>}
            {!user && <Link to="/app?state=register" className="text-white">Get Started</Link>}
            <button onClick={() => setMenuOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-yellow-600 hover:bg-yellow-700 transition text-white rounded-md flex" >
                X
            </button>
        </div>

        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-sm px-4 md:px-16 lg:px-24 xl:px-40 text-black" aria-label="Hero section">
            <div className="absolute top-28 xl:top-10 -z-10 left-1/4 size-72 sm:size-96 xl:size-120 2xl:size-132 bg-yellow-300 blur-[100px] opacity-30" aria-hidden="true"></div>

            {/* Avatars + Stars */}
            <div className="flex items-center mt-24" role="presentation">
                <div className="flex -space-x-3 pr-3">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="Happy Flower Resume user - testimonial" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-[1]" loading="lazy" />
                    <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="Professional using Flower Resume" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-2" loading="lazy" />
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="Satisfied resume builder customer" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-[3]" loading="lazy" />
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200" alt="Resume builder success story" className="size-8 object-cover rounded-full border-2 border-white hover:-translate-y-0.5 transition z-[4]" loading="lazy" />
                    <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Flower Resume user testimonial" className="size-8 rounded-full border-2 border-white hover:-translate-y-0.5 transition z-[5]" loading="lazy" />
                </div>

                <div>
                    <div className="flex " role="img" aria-label="5 star rating">
                        {Array(5).fill(0).map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-transparent fill-yellow-500" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                        ))}
                    </div>
                    <p className="text-sm text-gray-700">
                        Used by 10,000+ users
                    </p>
                </div>
            </div>

            {/* Headline + CTA */}
            <h1 className="text-5xl md:text-6xl font-semibold max-w-5xl text-center mt-4 md:leading-[70px]">
                Your details. Their requirements. <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent text-nowrap">Perfect resume. </span>
            </h1>

            <p className="max-w-2xl text-center text-base my-7">Just provide your detailed professional information and paste any job description. Our AI crafts a tailored resume that matches exactly what employers are looking for.</p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 ">
                <Link to='/app' className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-9 h-12 m-1 ring-offset-2 ring-1 ring-yellow-400 flex items-center transition-colors" aria-label="Get started with Flower Resume">
                    Get started
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-1 size-4" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
                {/* <button className="flex items-center gap-2 border border-slate-400 hover:bg-yellow-50 transition rounded-full px-7 h-12 text-slate-700" aria-label="Watch demo video">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video size-5" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg>
                    <span>Try demo</span>
                </button> */}
            </div>

        </section>
    </div>
    <style>
        {`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

            * {
                font-family: 'Poppins', sans-serif;
            }
        `}
    </style>
    </>
  )
}

export default Hero
