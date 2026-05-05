import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://thg-seven.vercel.app/api/'
})

