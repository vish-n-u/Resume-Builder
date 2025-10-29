import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_PROD
})

export default api