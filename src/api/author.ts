// import axios from 'axios'
import Service from '../http'

const service = new Service()

const AUTHOR_LOGIN = '/api/author/login'
const AUTHOR_LOGOUT = '/api/author/logout'
const AUTHOR_CHECK = '/api/author/check'
const BING_IMAGE = '/bing/HPImageArchive.aspx?format=js&idx=0&n=1'

export const login = (data: { user_name: string; password: string }) =>
  service.postData(AUTHOR_LOGIN, data)
export const logout = () => service.getData(AUTHOR_LOGOUT)
export const loggedCheck = () => service.getData(AUTHOR_CHECK)
export const fetchBingImg = () => service.getData(BING_IMAGE)
// export const fetchBingImg = () => axios(BING_IMAGE)
