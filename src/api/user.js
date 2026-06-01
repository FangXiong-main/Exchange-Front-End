import RequestApi from '@/utils/request.js'

// 全部用户分页查询（含邮箱搜索）
export const getAllUserPageApi = (params) => RequestApi.get('/user/page', { params })

// 已封禁用户分页查询（含邮箱搜索）
export const getBannedUserPageApi = (params) => RequestApi.get('/user/banned', { params })

// 封禁用户
export const banUserApi = (data) => RequestApi.post('/user/ban', data)

// 解除封禁
export const unBanUserApi = (data) => RequestApi.post('/user/unban', data)

// ======================
// 用户信息修改审核接口
// ======================
// 获取待审核分页列表
export const getUserInfoChangePageApi = (params) => RequestApi.get('/user/info-change/page', { params })

// 审核用户信息修改（通过/驳回）
export const auditUserInfoChangeApi = (data) => RequestApi.post('/user/info-change/audit', data)

//获取学校列表
export const getSchoolListApi = ()=> RequestApi.get('/user/schoolList')