import Service from '../http'

const service = new Service()

const AUTHOR_LOGIN = '/api/author/login'
const AUTHOR_LOGOUT = '/api/author/logout'
const AUTHOR_CHECK = '/api/author/check'
const BING_IMAGE = '/api/author/bing'

export const login = (data: { user_name: string; password: string }) =>
  service.postData(AUTHOR_LOGIN, data)
export const logout = () => service.getData(AUTHOR_LOGOUT)
export const loggedCheck = () => service.getData(AUTHOR_CHECK)
export const fetchBingImg = () => service.getData(BING_IMAGE)
