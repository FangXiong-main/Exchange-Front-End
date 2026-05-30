<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

import {
  View
} from '@element-plus/icons-vue';

// 接口
import {
  getAuditGoodsPageApi,
  getRejectedGoodsPageApi,
  getGoodsDetailApi,
  passGoodsApi,
  rejectGoodsApi,
  deleteGoodsApi
} from '@/api/goods.js';

const router = useRouter();
const loading = ref(false);
const rejectedLoading = ref(false);

// ================== 待审核商品 ==================
const goodsList = ref([]);
const pageNum = ref(1);
const pageSize = ref(8);
const total = ref(0);

// ================== 已驳回商品 ==================
const rejectedGoodsList = ref([]);
const rejectedPageNum = ref(1);
const rejectedPageSize = ref(8);
const rejectedTotal = ref(0);

// ================== 详情弹窗 ==================
const detailDialog = ref(false);
const currentGoods = ref({});
const rejectReason = ref('');

// 类型映射
const typeMap = {
  1: '书籍',
  2: '电子',
  3: '服饰',
  4: '生活',
  5: '其他'
};

// ================== 加载数据 ==================
onMounted(() => {
  getList();
  getRejectedList();
});

// 待审核列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await getAuditGoodsPageApi({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    if (res.code === 200) {
      goodsList.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (e) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
};

// 已驳回列表
const getRejectedList = async () => {
  rejectedLoading.value = true;
  try {
    const res = await getRejectedGoodsPageApi({
      pageNum: rejectedPageNum.value,
      pageSize: rejectedPageSize.value
    });
    if (res.code === 200) {
      rejectedGoodsList.value = res.data.list;
      rejectedTotal.value = res.data.total;
    }
  } catch (e) {
    ElMessage.error('加载失败');
  } finally {
    rejectedLoading.value = false;
  }
};

// ================== 分页 ==================
const handlePageChange = (val) => {
  pageNum.value = val;
  getList();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  pageNum.value = 1;
  getList();
};

const handleRejectedPageChange = (val) => {
  rejectedPageNum.value = val;
  getRejectedList();
};

const handleRejectedSizeChange = (val) => {
  rejectedPageSize.value = val;
  rejectedPageNum.value = 1;
  getRejectedList();
};

// ================== 打开详情 ==================
const openDetail = async (id) => {
  const res = await getGoodsDetailApi(id);
  if (res.code === 200) {
    currentGoods.value = res.data;
    rejectReason.value = currentGoods.value.rejectReason || '';
    detailDialog.value = true;
  }
};

// ================== 审核通过 ==================
const passHandle = async () => {
  const res = await passGoodsApi({ id: currentGoods.value.id });
  if (res.code === 200) {
    ElMessage.success('操作成功');
    detailDialog.value = false;
    getList();
    getRejectedList();
  }
};

// ================== 审核驳回 ==================
const rejectHandle = async () => {
  if (!rejectReason.value) {
    ElMessage.warning('请输入驳回原因');
    return;
  }
  const res = await rejectGoodsApi({
    id: currentGoods.value.id,
    rejectReason: rejectReason.value
  });
  if (res.code === 200) {
    ElMessage.success('操作成功');
    detailDialog.value = false;
    getList();
    getRejectedList();
  }
};

// ================== 删除商品 ==================
const deleteHandle = async () => {
  await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  const res = await deleteGoodsApi(currentGoods.value.id);
  if (res.code === 200) {
    ElMessage.success('删除成功');
    detailDialog.value = false;
    getRejectedList();
  }
};
const closeDialog = () => {
  detailDialog.value = false;
};
</script>

<template>
  <div class="dashboard-wrap">
    <div class="dashboard-container">
      
      <div class="dashboard-title">
        <h2>商品审核</h2>
        <p>Exchange!二手交易平台</p>
      </div>

      <!-- ================== 待审核商品 ================== -->
      <div class="glass-panel" style="padding:26px; margin-bottom:30px; position:relative;">
        
        <!-- 面板内 loading（和登录一样样式） -->
        <div class="panel-loading" v-if="loading">
          <div class="loading-box">
            <div class="loading-spin"></div>
            <span>加载中...</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h3>待审核商品列表</h3>
          <span class="tips">共 {{ total }} 条</span>
        </div>

        <el-table :data="goodsList" border style="width:100%" class="glass-table">
          <el-table-column label="商品名称" prop="name" align="center" />
          <el-table-column label="价格" prop="price" align="center" />
          <el-table-column label="发布人" prop="username" align="center" />
          <el-table-column label="类型" align="center">
            <template #default="scope">{{ typeMap[scope.row.type] }}</template>
          </el-table-column>
          <el-table-column label="发布时间" prop="createTime" align="center" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" icon="View" size="small" round @click="openDetail(scope.row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="goodsList.length === 0" description="暂无待审核商品" style="margin-top:30px" />

        <div style="text-align:center; margin-top:20px; display:flex; align-items:center; justify-content:center; gap:10px;">
          <span style="color:#333; font-size:14px;">每页展示：</span>
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

      <!-- ================== 已驳回商品 ================== -->
      <div class="glass-panel" style="padding:26px; position:relative;">
        
        <!-- 已驳回面板内 loading -->
        <div class="panel-loading" v-if="rejectedLoading">
          <div class="loading-box">
            <div class="loading-spin"></div>
            <span>加载中...</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <h3>已驳回商品列表</h3>
          <span class="tips">共 {{ rejectedTotal }} 条</span>
        </div>

        <el-table :data="rejectedGoodsList" border style="width:100%" class="glass-table">
          <el-table-column label="商品名称" prop="name" align="center" />
          <el-table-column label="价格" prop="price" align="center" />
          <el-table-column label="发布人" prop="username" align="center" />
          <el-table-column label="驳回原因" prop="rejectReason" align="center" />
          <el-table-column label="类型" align="center">
            <template #default="scope">{{ typeMap[scope.row.type] }}</template>
          </el-table-column>
          <el-table-column label="发布时间" prop="createTime" align="center" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="warning" icon="View" size="small" round @click="openDetail(scope.row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="rejectedGoodsList.length === 0" description="暂无已驳回商品" style="margin-top:30px" />

        <div style="text-align:center; margin-top:20px; display:flex; align-items:center; justify-content:center; gap:10px;">
          <span style="color:#333; font-size:14px;">每页展示：</span>
          <el-pagination
            v-model:current-page="rejectedPageNum"
            v-model:page-size="rejectedPageSize"
            :total="rejectedTotal"
            layout="sizes, total, prev, pager, next, jumper"
            @size-change="handleRejectedSizeChange"
            @current-change="handleRejectedPageChange"
          />
        </div>
      </div>

      <!-- ================== 详情弹窗 ================== -->
      <el-dialog v-model="detailDialog" title="商品详情审核" width="700px" center>
        <div class="detail-box">
          <p><label>商品名称：</label>{{ currentGoods.name }}</p>
          <p><label>价格：</label>¥ {{ currentGoods.price }}</p>
          <p><label>类型：</label>{{ typeMap[currentGoods.type] }}</p>
          <p><label>发布人：</label>{{ currentGoods.username ?? '未知' }}</p>
          <p><label>发布时间：</label>{{ currentGoods.createTime }}</p>
          
          <div v-if="currentGoods.images" style="margin:12px 0;">
            <label style="font-weight:600;">商品图片：</label>
            <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;">
              <img 
                v-for="(img, idx) in currentGoods.images.split(',')" 
                :key="idx"
                :src="img" 
                style="width:100px; height:100px; object-fit:cover; border-radius:8px;"
              >
            </div>
          </div>
          <div v-else style="color:#999; margin:12px 0;">
            暂无商品图片
          </div>

          <div class="detail-info">
            <label>商品详情：</label><br>
            {{ currentGoods.detailInfo || '暂无详情' }}
          </div>

          <el-input
            v-model="rejectReason"
            type="textarea"
            rows="3"
            placeholder="请输入驳回原因"
            style="margin-top:18px"
          />
        </div>

        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="danger" @click="deleteHandle">删除商品</el-button>
          <el-button type="warning" @click="rejectHandle">驳回</el-button>
          <el-button type="success" @click="passHandle">通过</el-button>
        </template>
      </el-dialog>

    </div>
  </div>
</template>

<style scoped>
/* 变量 */
:root {
  --blur: blur(12px);
  --alpha-bg: rgba(255, 255, 255, 0.35);
  --alpha-border: rgba(255, 255, 255, 0.45);
}

/* --------- 面板内 loading（和登录同款但非全屏） --------- */
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

/* --------- 原有样式 --------- */
* {
  font-family: "PingFang SC", "苹方-简", sans-serif !important;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.detail-box {
  padding: 10px 20px;
  line-height: 1.8;
  font-size: 14px;
}
.detail-box label {
  font-weight: 600;
  margin-right: 6px;
}
.detail-info {
  margin-top: 10px;
  padding: 12px;
  background: rgba(0,0,0,0.03);
  border-radius: 8px;
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
  height: 100%;
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

@keyframes spin { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}
</style>