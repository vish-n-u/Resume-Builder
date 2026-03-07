import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { UserCircleIcon, FileTextIcon, ShieldIcon, BriefcaseIcon, HeartIcon } from 'lucide-react'

const Navbar = () => {

   const {user} = useSelector(state => state.auth)
   const dispatch = useDispatch()

    const navigate = useNavigate()

    const logoutUser = ()=>{
        navigate('/')
        dispatch(logout())
    }

  return (
    <div className='shadow bg-white'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <Link to='/' className="flex items-center gap-2">
            <span className="text-2xl">🌻</span>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Flower Resume</span>
        </Link>
        <div className='flex items-center gap-3 text-sm'>
            <p className='max-sm:hidden text-slate-700 font-medium'>Hi, {user?.name}</p>
            {user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
              <Link to='/app/admin' className='flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-2 border-slate-300 hover:border-slate-400 px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm hover:shadow group'>
                <ShieldIcon className='size-4 text-slate-600 group-hover:scale-110 transition-transform duration-300' />
                <span className='max-sm:hidden font-medium text-slate-700'>Admin</span>
              </Link>
            )}
            <Link to='/app/jobs' className='flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-300 hover:border-green-400 px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm hover:shadow group'>
              <BriefcaseIcon className='size-4 text-green-600 group-hover:scale-110 transition-transform duration-300' />
              <span className='max-sm:hidden font-medium text-slate-700'>Job Swipe</span>
            </Link>
            <Link to='/app/applied' className='flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-300 hover:border-purple-400 px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm hover:shadow group'>
              <HeartIcon className='size-4 text-purple-600 group-hover:scale-110 transition-transform duration-300' />
              <span className='max-sm:hidden font-medium text-slate-700'>Applied</span>
            </Link>
            <Link to='/app/profile' className='flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-2 border-yellow-300 hover:border-yellow-400 px-5 py-1.5 rounded-full active:scale-95 transition-all shadow-sm hover:shadow group'>
              <FileTextIcon className='size-5 text-yellow-600 group-hover:scale-110 transition-transform duration-300' />
              <span className='max-sm:hidden font-medium text-slate-700'>Your Resume Data</span>
            </Link>
            <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all'>Logout</button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
