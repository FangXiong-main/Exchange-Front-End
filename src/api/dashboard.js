import RequestApi  from '@/utils/request.js';
export const getDashboardDataApi = (loginForm)=> RequestApi.get('/admin/dashboard/data',loginForm);
export const getRecentGoodsApi = (loginForm)=> RequestApi.get('/admin/dashboard/recent-goods',loginForm);
export const getTodoListApi = (loginForm)=> RequestApi.get('/admin/dashboard/todo',loginForm);