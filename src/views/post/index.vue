<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { View } from '@element-plus/icons-vue';

// 导入接口
import {
  getPublishedPostListApi,
  getCommentListApi,
  deleteCommentApi,
  deletePostApi
} from '@/api/post.js';

// 与 request 一致的 baseURL
const baseURL = '/api';

// ================== 帖子列表 ==================
const loading = ref(false);
const postList = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// ================== 详情弹窗 + 评论列表 ==================
const detailDialog = ref(false);
const currentPost = ref({});

// 评论
const commentLoading = ref(false);
const commentList = ref([]);
const commentPageNum = ref(1);
const commentPageSize = ref(5);
const commentTotal = ref(0);

// 长评论弹窗
const commentDialog = ref(false);
const currentComment = ref({});

// 帖子类型映射
const typeMap = {
  1: '最新发布',
  2: '热门推荐',
  3: '校园闲聊',
  4: '生活闲聊'
};

// 查询接口专用处理函数（成功不提示，失败提示）
const handleQueryRes = (res) => {
  if (res.code === 200) {
    return true;
  }
  if (res.code === 0) {
    ElMessage.error(res.msg || '查询失败');
    return false;
  }
  ElMessage.error(res.msg || '请求异常');
  return false;
};

// 操作接口专用处理函数（删除类，成功/失败都提示）
const handleOperateRes = (res) => {
  if (res.code === 200) {
    ElMessage.success('操作成功');
    return true;
  }
  if (res.code === 0) {
    ElMessage.error(res.msg || '操作失败');
    return false;
  }
  ElMessage.error(res.msg || '请求异常');
  return false;
};

// ================== 加载帖子列表 ==================
const getPostList = async () => {
  loading.value = true;
  try {
    const res = await getPublishedPostListApi({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      type: 0
    });
    if (handleQueryRes(res)) {
      postList.value = res.data.rows || [];
      total.value = res.data.total;
    }
  } catch (e) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
};

// ================== 打开帖子详情 ==================
const openDetail = async (row) => {
  currentPost.value = { ...row };
  detailDialog.value = true;

  // 拼接图片完整地址
  if (currentPost.value.images) {
    let img = currentPost.value.images.split(',')[0] || '';
    if (img && !img.startsWith('http')) {
      img = baseURL + img;
    }
    currentPost.value.showImg = img;
  } else {
    currentPost.value.showImg = '';
  }

  // 重置页码并加载评论
  commentPageNum.value = 1;
  getCommentList();
};

// ================== 加载评论列表 ==================
const getCommentList = async () => {
  if (!currentPost.value.id) return;
  commentLoading.value = true;
  try {
    const res = await getCommentListApi({
      postId: currentPost.value.id,
      pageNum: commentPageNum.value,
      pageSize: commentPageSize.value
    });
    if (handleQueryRes(res)) {
      commentList.value = res.data.rows || [];
      commentTotal.value = res.data.total;
    }
  } catch (e) {
    ElMessage.error('评论加载失败');
  } finally {
    commentLoading.value = false;
  }
};

// ================== 查看完整评论 ==================
const openFullComment = (comment) => {
  currentComment.value = comment;
  commentDialog.value = true;
};

// ================== 删除评论 ==================
const deleteComment = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该评论？', '提示', { type: 'warning' });
    const res = await deleteCommentApi(id);
    if (handleOperateRes(res)) {
      getCommentList();
    }
  } catch (e) {
    ElMessage.info('已取消删除');
  }
};

// ================== 删除帖子 ==================
const deletePost = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该帖子吗？删除后无法恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    });
    const res = await deletePostApi(currentPost.value.id);
    if (handleOperateRes(res)) {
      detailDialog.value = false;
      getPostList();
    }
  } catch (e) {
    ElMessage.info('已取消删除');
  }
};

// ================== 帖子列表分页 ==================
const handlePageChange = (val) => {
  pageNum.value = val;
  getPostList();
};
const handleSizeChange = (val) => {
  pageSize.value = val;
  pageNum.value = 1;
  getPostList();
};

// ================== 评论列表分页 ==================
const handleCommentPageChange = (val) => {
  commentPageNum.value = val;
  getCommentList();
};
const handleCommentSizeChange = (val) => {
  commentPageSize.value = val;
  commentPageNum.value = 1;
  getCommentList();
};

// 关闭详情弹窗
const closeDialog = () => {
  detailDialog.value = false;
};

onMounted(() => {
  getPostList();
});
</script>

<template>
  <div class="dashboard-wrap">
    <div class="dashboard-container">
      <div class="dashboard-title">
        <h2>平台帖子列表</h2>
        <p>Exchange! 二手交易平台</p>
      </div>

      <!-- 帖子列表面板 -->
      <div class="glass-panel" style="padding:26px; position:relative;">
        <div class="panel-loading" v-if="loading">
          <div class="loading-box">
            <div class="loading-spin"></div>
            <span>加载中...</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h3>全部帖子</h3>
          <span class="tips">共 {{ total }} 条</span>
        </div>

        <el-table :data="postList" border style="width:100%" class="glass-table">
          <el-table-column label="发布用户" prop="username" align="center" />
          <el-table-column label="帖子内容" align="center" min-width="220">
            <template #default="scope">
              <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                {{ scope.row.content }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="浏览量" prop="viewCount" align="center" />
          <el-table-column label="评论数" prop="commentCount" align="center" />
          <el-table-column label="帖子类型" align="center">
            <template #default="scope">{{ typeMap[scope.row.type] }}</template>
          </el-table-column>
          <el-table-column label="发布时间" prop="updateTime" align="center" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" icon="View" size="small" round @click="openDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="postList.length === 0" description="暂无帖子" style="margin-top:30px" />

        <div style="text-align:center; margin-top:20px; display:flex; align-items:center; justify-content:center; gap:10px;">
          <span>每页：</span>
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            layout="sizes, total, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 帖子详情弹窗 -->
      <el-dialog v-model="detailDialog" title="帖子详情" width="800px" center>
        <div class="detail-box" style="line-height:2;">
          <p><label>发布用户：</label>{{ currentPost.username }}</p>
          <p><label>帖子类型：</label>{{ typeMap[currentPost.type] }}</p>
          <p><label>发布时间：</label>{{ currentPost.updateTime }}</p>
          <p><label>浏览量：</label>{{ currentPost.viewCount }}  |  评论：{{ currentPost.commentCount }}</p>

          <div style="margin:10px 0;">
            <label style="font-weight:600;">帖子内容：</label><br>
            <div style="padding:12px; background:#f5f5f5; border-radius:8px; margin-top:6px;">
              {{ currentPost.content || '无内容' }}
            </div>
          </div>

          <div style="margin:12px 0;">
            <label style="font-weight:600;">帖子图片：</label>
            <div v-if="currentPost.showImg" style="margin-top:8px;">
              <el-image
                :src="currentPost.showImg"
                :preview-src-list="[currentPost.showImg]"
                style="width:180px; height:180px; object-fit:cover; border-radius:8px; cursor:pointer;"
                fit="cover"
              />
            </div>
            <div v-else style="color:#999; margin-top:8px;">该帖子未上传图片</div>
          </div>

          <div style="margin-top:20px;">
            <label style="font-weight:600; font-size:16px;">评论列表</label>

            <div style="position:relative; margin-top:10px; min-height:100px;">
              <div class="panel-loading" v-if="commentLoading" style="border-radius:8px;">
                <div class="loading-box">
                  <div class="loading-spin"></div>
                  <span>加载评论...</span>
                </div>
              </div>

              <el-table :data="commentList" border size="small" style="width:100%">
                <el-table-column label="用户" prop="username" align="center" />
                <el-table-column label="评论内容" align="center" min-width="220">
                  <template #default="scope">
                    <div style="display: flex; align-items: center; justify-content: center;gap:8px;">
                      <span 
                        style="
                          display: -webkit-box; 
                          -webkit-line-clamp: 2; 
                          -webkit-box-orient: vertical; 
                          overflow: hidden;
                          text-align: left;
                        "
                      >
                        {{ scope.row.content }}
                      </span>
                      <span 
                        v-if="scope.row.content.length > 30" 
                        style="color:#409eff;cursor:pointer;white-space: nowrap;" 
                        @click="openFullComment(scope.row)"
                      >
                        查看全部
                      </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="时间" prop="createTime" align="center" />
                <el-table-column label="操作" align="center">
                  <template #default="scope">
                    <el-button type="danger" size="small" text @click="deleteComment(scope.row.id)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <el-empty v-if="commentList.length === 0 && !commentLoading" description="暂无评论" style="margin:10px 0" />

              <div style="text-align:center; margin-top:10px; display:flex; align-items:center; justify-content:center; gap:10px;">
                <span>每页：</span>
                <el-pagination
                  v-model:current-page="commentPageNum"
                  v-model:page-size="commentPageSize"
                  :total="commentTotal"
                  layout="sizes, prev, pager, next, jumper"
                  @size-change="handleCommentSizeChange"
                  @current-change="handleCommentPageChange"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部按钮：关闭 + 删除帖子 -->
        <template #footer>
          <el-button @click="closeDialog">关闭</el-button>
          <el-button type="danger" @click="deletePost">删除帖子</el-button>
        </template>
      </el-dialog>

      <!-- 完整评论弹窗 -->
      <el-dialog v-model="commentDialog" title="完整评论内容" width="500px" center>
        <div style="padding:10px; line-height:1.8;">
          {{ currentComment.content }}
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
:root {
  --blur: blur(12px);
  --alpha-bg: rgba(255, 255, 255, 0.35);
  --alpha-border: rgba(255, 255, 255, 0.45);
}

/* 面板加载样式 */
.panel-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(6px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.loading-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 32px;
  border-radius: 16px;
  background: var(--alpha-bg);
  backdrop-filter: var(--blur);
  border: 1px solid var(--alpha-border);
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}
.loading-spin {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 全局基础样式 */
* {
  font-family: "PingFang SC", "苹方-简", sans-serif !important;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.detail-box label {
  font-weight: 600;
  margin-right: 6px;
}
.tips {
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.4);
  padding: 2px 8px;
  border-radius: 10px;
}
.dashboard-wrap {
  width: 100%;
  min-height: 100vh;
  background: transparent !important;
}
.dashboard-container {
  width: 100%;
  padding: 24px;
}
.dashboard-title {
  margin-bottom: 24px;
}
.dashboard-title h2 {
  font-size: 26px;
  font-weight: 600;
  color: #222;
}
.dashboard-title p {
  color: #666;
  margin-top: 6px;
  font-size: 15px;
}

/* 液态玻璃面板 */
.glass-panel {
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}
.glass-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

/* 深度修改element-plus样式 */
:deep(.el-table) {
  background: transparent !important;
  border-radius: 20px !important;
  overflow: hidden;
}
:deep(.el-table__row) {
  background: rgba(255, 255, 255, 0.25) !important;
}
:deep(.el-table th) {
  background: rgba(255, 255, 255, 0.4) !important;
}
:deep(.el-pagination__editor .el-input__inner) {
  color: #000 !important;
  font-weight: 500;
}

/* 旋转动画 */
@keyframes spin { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}
</style>