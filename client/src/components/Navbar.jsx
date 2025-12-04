import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { UserCircleIcon, FileTextIcon } from 'lucide-react'

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
