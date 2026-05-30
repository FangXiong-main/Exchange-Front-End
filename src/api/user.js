import RequestApi from '@/utils/request.js'

// 全部用户分页查询（含邮箱搜索）
export const getAllUserPageApi = (params) => RequestApi.get('/user/page', { params })

// 已封禁用户分页查询（含邮箱搜索）
export const getBannedUserPageApi = (params) => RequestApi.get('/user/banned', { params })

// 封禁用户
export const banUserApi = (data) => RequestApi.post('/user/ban', data)

// 解除封禁
export const unBanUserApi = (data) => RequestApi.post('/user/unban', data)