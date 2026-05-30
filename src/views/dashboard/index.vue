<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// 图标完整导入
import {
  UserFilled,
  GoodsFilled,
  ShoppingCart,
  Calendar
} from '@element-plus/icons-vue';

import {
  getDashboardDataApi,
  getRecentGoodsApi,
  getTodoListApi
} from '@/api/dashboard.js';

const router = useRouter();
const loading = ref(false);

const dashboardData = ref({
  userCount: 0,
  goodsCount: 0,
  orderCount: 0,
  todayOrderCount: 0
});

const recentGoods = ref([]);
const todoList = ref([]);

onMounted(() => {
  getDashboardData();
  getRecentGoods();
  getTodoList();
});

const getDashboardData = async () => {
  loading.value = true;
  try {
    const res = await getDashboardDataApi();
    if (res.code === 200) {
      dashboardData.value = res.data;
    }
  } catch (e) {
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

const getRecentGoods = async () => {
  try {
    const res = await getRecentGoodsApi();
    if (res.code === 200) recentGoods.value = res.data;
  } catch (e) {}
};

const getTodoList = async () => {
  try {
    const res = await getTodoListApi();
    if (res.code === 200) todoList.value = res.data;
  } catch (e) {}
};

const goPage = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="dashboard-wrap">
    <div class="dashboard-container" style="position:relative;">
      
      <!-- 统一面板内加载效果 和商品审核一致 -->
      <div class="panel-loading" v-if="loading">
        <div class="loading-box">
          <div class="loading-spin"></div>
          <span>加载中...</span>
        </div>
      </div>

      <div class="dashboard-title">
        <h2>仪表盘</h2>
        <p>Exchange!二手交易平台</p>
      </div>

      <div class="card-grid">
        <div class="glass-card">
          <div class="card-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="card-info">
            <p class="card-label">总用户数</p>
            <p class="card-number">{{ dashboardData.userCount }}</p>
          </div>
        </div>

        <div class="glass-card">
          <div class="card-icon purple">
            <el-icon><GoodsFilled /></el-icon>
          </div>
          <div class="card-info">
            <p class="card-label">商品总数</p>
            <p class="card-number">{{ dashboardData.goodsCount }}</p>
          </div>
        </div>

        <div class="glass-card">
          <div class="card-icon blue">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="card-info">
            <p class="card-label">订单总数</p>
            <p class="card-number">{{ dashboardData.orderCount }}</p>
          </div>
        </div>

        <div class="glass-card">
          <div class="card-icon green">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="card-info">
            <p class="card-label">今日订单</p>
            <p class="card-number">{{ dashboardData.todayOrderCount }}</p>
          </div>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="glass-panel long-panel">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>最近发布商品</h3>
            <span class="tips">仅展示部分数据</span>
          </div>

          <!-- 🔥 有数据才显示表格 -->
          <el-table 
            v-if="recentGoods.length > 0" 
            :data="recentGoods" 
            border 
            style="width:100%" 
            class="glass-table"
          >
            <el-table-column label="商品名称" prop="name" align="center" />
            <el-table-column label="发布人" prop="username" align="center" />
            <el-table-column label="价格" prop="price" align="center" />
            <el-table-column label="发布时间" prop="time" align="center" />
          </el-table>

          <!-- 🔥 无数据 → 只显示美观空状态 -->
          <el-empty 
            v-else 
            description="暂无最近发布商品" 
            style="margin-top:30px" 
          />
        </div>

        <div class="glass-panel long-panel">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>待审核事项</h3>
            <span class="tips">仅展示部分数据</span>
          </div>
          <el-empty v-if="todoList.length === 0" description="暂无待办" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="item in todoList"
              :key="item.id"
              :color="item.status === 1 ? '#00dfa2' : '#ff8800'"
            >
              {{ item.content }}
              <span style="font-size:12px;opacity:0.8">{{ item.time }}</span>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局统一变量 */
:root {
  --blur: blur(12px);
  --alpha-bg: rgba(255, 255, 255, 0.35);
  --alpha-border: rgba(255, 255, 255, 0.45);
}

/* --------- 统一面板内加载样式 --------- */
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

.tips {
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.4);
  padding: 2px 8px;
  border-radius: 10px;
}

.dashboard-wrap {
  width: 100%;
  min-height: calc(100vh - 80px);
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 22px;
  display: flex;
  align-items: center;
  cursor: default;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.45);
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(64, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #2277ff;
  margin-right: 16px;
  backdrop-filter: blur(10px);
}

.card-icon.purple {
  background: rgba(168, 85, 247, 0.25);
  color: #a855f7;
}

.card-icon.blue {
  background: rgba(6, 182, 212, 0.25);
  color: #06b6d4;
}

.card-icon.green {
  background: rgba(16, 185, 129, 0.25);
  color: #10b981;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #444;
}

.card-number {
  font-size: 26px;
  font-weight: 700;
  color: #111;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.long-panel {
  min-height: 420px;
}

.glass-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
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

@keyframes spin { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}
</style>