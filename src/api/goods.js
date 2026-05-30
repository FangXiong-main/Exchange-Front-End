import RequestApi from '@/utils/request.js'

// 分页查询待审核商品
export const getAuditGoodsPageApi = (params) => RequestApi.get('/goods/auditPage', { params })

// 获取商品详情
export const getGoodsDetailApi = (id) => RequestApi.get(`/goods/detail/${id}`)

// 审核通过
export const passGoodsApi = (data) => RequestApi.post('/goods/pass', data)

// 审核驳回（带理由）
export const rejectGoodsApi = (data) => RequestApi.post('/goods/reject', data)

// 已驳回商品分页
export const getRejectedGoodsPageApi = (params) => RequestApi.get('/goods/rejectedPage', { params })

// 删除商品
export const deleteGoodsApi = (id) => RequestApi.delete(`/goods/delete/${id}`)