import RequestApi from '@/utils/request.js'

export const getOrderByIdApi = (id) => RequestApi.get('/order/getOrderDetailById',{params:{id}})

export const operateDrawbackApi = (id) => RequestApi.post('/order/operateDrawback',{id:id})