import RequestApi  from '@/utils/request.js';

//登录
export const loginApi = (loginForm)=> RequestApi.post('/adminLogin',loginForm);

//检测是否已经登录
export const detLoginApi = (loginForm)=> RequestApi.post('/detLogin',loginForm);

//退出登录
export const logoutApi = (loginForm)=> RequestApi.post('/logout',loginForm);