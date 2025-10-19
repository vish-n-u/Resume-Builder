import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { UserCircleIcon } from 'lucide-react'

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
        <Link to='/'>
            <img src="/logo.svg" alt="logo" className="h-11 w-auto" />
        </Link>
        <div className='flex items-center gap-4 text-sm'>
            <p className='max-sm:hidden'>Hi, {user?.name}</p>
            <Link to='/app/profile' className='flex items-center gap-2 bg-white hover:bg-slate-50 border border-gray-300 px-5 py-1.5 rounded-full active:scale-95 transition-all'>
              <UserCircleIcon className='size-5' />
              <span className='max-sm:hidden'>Profile</span>
            </Link>
            <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-7 py-1.5 rounded-full active:scale-95 transition-all'>Logout</button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
