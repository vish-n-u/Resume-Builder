import { Lock, Mail, User2Icon } from 'lucide-react'
import React from 'react'
import api from '../configs/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import toast from 'react-hot-toast'

const Login = () => {

    const dispatch = useDispatch()
  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')
  const [state, setState] = React.useState(urlState || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await api.post(`/api/users/${state}`, formData)
            dispatch(login(data))
            localStorage.setItem('token', data.token)
            toast.success(data.message)
        } catch (error) {
            toast(error?.response?.data?.message || error.message)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8'>
      <form onSubmit={handleSubmit} className="w-full max-w-[350px] text-center border border-gray-300/60 rounded-2xl px-6 sm:px-8 bg-white">
                <h1 className="text-gray-900 text-2xl sm:text-3xl mt-8 sm:mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">Please {state} to continue</p>
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2">
                        <User2Icon size={16} color='#6B7280'/>
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0 text-sm sm:text-base w-full" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2">
                    <Mail size={13} color="#6B7280" />
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0 text-sm sm:text-base w-full" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-11 sm:h-12 rounded-full overflow-hidden pl-4 sm:pl-6 gap-2">
                    <Lock size={13} color="#6B7280"/>
                    <input type="password" name="password" placeholder="Password" className="border-none outline-none ring-0 text-sm sm:text-base w-full" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="mt-4 text-left text-yellow-600">
                    <button className="text-xs sm:text-sm" type="reset">Forget password?</button>
                </div>
                <button type="submit" className="mt-2 w-full h-10 sm:h-11 rounded-full text-white bg-yellow-500 hover:bg-yellow-600 transition-colors text-sm sm:text-base active:scale-95">
                    {state === "login" ? "Login" : "Sign up"}
                </button>
                <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-xs sm:text-sm mt-3 mb-8 sm:mb-11 cursor-pointer">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-yellow-600 hover:underline">click here</a></p>
            </form>
    </div>
  )
}

export default Login
