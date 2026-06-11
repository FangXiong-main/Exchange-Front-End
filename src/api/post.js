import RequestApi from '@/utils/request.js'

export const getPublishedPostListApi = (params) => RequestApi.get('/post/pages',{params})

export const getCommentListApi = (params) => RequestApi.get('/post/commentList',{params})

export const deleteCommentApi = (id) => RequestApi.post('/post/adminDeleteComment',{id:id})

export const deletePostApi = (id) => RequestApi.post('/post/adminDeletePost',{id:id})