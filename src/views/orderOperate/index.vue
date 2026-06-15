<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 导入订单接口
import { getOrderByIdApi, operateDrawbackApi } from '@/api/order.js';

// 图片基础地址
const baseURL = '/api';

// 搜索订单号
const orderNo = ref('');
// 加载状态
const loading = ref(false);
// 订单数据
const orderInfo = ref(null);
// 是否展示查询结果
const showResult = ref(false);

// 支付类型映射
const payTypeMap = {
  1: 'EXC-Wallet'
};

// 订单状态映射
const statusMap = {
  1: '等待双方面交',
  2: '卖家已确认面交',
  3: '已取消',
  4: '已完成'
};

// 时间格式化
const formatTime = (time) => {
  if (!time) return '暂无';
  return time;
};

// 根据订单号查询订单
const searchOrder = async () => {
  const val = orderNo.value.trim();
  if (!val) {
    ElMessage.warning('请输入订单号');
    return;
  }
  loading.value = true;
  showResult.value = false;
  orderInfo.value = null;

  try {
    const res = await getOrderByIdApi(val);
    if (res.code === 200) {
      // 处理图片路径
      const data = { ...res.data };
      if (data.goodsImage && !data.goodsImage.startsWith('http')) {
        data.goodsImage = baseURL + data.goodsImage;
      }
      orderInfo.value = data;
      showResult.value = true;
    } else {
      ElMessage.error(res.msg || '查询订单失败');
    }
  } catch (err) {
    ElMessage.error('网络请求异常');
  } finally {
    loading.value = false;
  }
};

// 申请退款
const handleRefund = async () => {
  if (!orderInfo.value?.id) return;
  try {
    await ElMessageBox.confirm(
      '确定要对该订单发起退款吗？',
      '退款确认',
      { type: 'warning' }
    );
    const res = await operateDrawbackApi(orderInfo.value.id);
    if (res.code === 200) {
      ElMessage.success('退款操作成功');
      // 退款成功：清空输入框、订单数据、隐藏结果
      orderNo.value = '';
      orderInfo.value = null;
      showResult.value = false;
    } else {
      ElMessage.error(res.msg || '退款失败');
    }
  } catch (err) {
    ElMessage.info('已取消退款');
  }
};
</script>

<template>
  <div class="dashboard-wrap">
    <div class="dashboard-container">
      <div class="dashboard-title">
        <h2>订单管理</h2>
        <p>Exchange! 二手交易平台</p>
      </div>

      <div class="glass-panel" style="padding:26px; position:relative;">
        <div class="panel-loading" v-if="loading">
          <div class="loading-box">
            <div class="loading-spin"></div>
            <span>查询中...</span>
          </div>
        </div>

        <!-- 搜索区域 -->
        <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:30px;">
          <span style="font-size:15px; color:#333;">订单号查询：</span>
          <el-input
            v-model="orderNo"
            placeholder="请填写订单编号"
            style="width: 320px"
            clearable
            @keyup.enter.native="searchOrder"
          />
          <el-button type="primary" @click="searchOrder">查询</el-button>
        </div>

        <!-- 查询结果区域 -->
        <div v-if="showResult && orderInfo" class="order-result">
          <div class="result-title">订单详情信息</div>

          <div class="order-row">
            <div class="order-item">
              <span class="label">订单编号：</span>
              <span class="value">{{ orderInfo.id }}</span>
            </div>
            <div class="order-item">
              <span class="label">订单状态：</span>
              <span class="value">{{ statusMap[orderInfo.status] || '未知状态' }}</span>
            </div>
            <div class="order-item">
              <span class="label">支付方式：</span>
              <span class="value">{{ payTypeMap[orderInfo.payType] || '未知' }}</span>
            </div>
          </div>

          <div class="order-row">
            <div class="order-item">
              <span class="label">商品名称：</span>
              <span class="value">{{ orderInfo.goodsName || '暂无' }}</span>
            </div>
            <div class="order-item">
              <span class="label">商品价格：</span>
              <span class="value">¥{{ orderInfo.goodsPrice }}</span>
            </div>
          </div>

          <div class="order-row">
            <div class="order-item">
              <span class="label">卖家名称：</span>
              <span class="value">{{ orderInfo.sellerName || '暂无' }}</span>
            </div>
          </div>

          <div class="order-row">
            <div class="order-item full">
              <span class="label">商品描述：</span>
              <span class="value">{{ orderInfo.goodsDetail || '暂无描述' }}</span>
            </div>
          </div>

          <div class="order-row">
            <div class="order-item">
              <span class="label">商品图片：</span>
              <el-image
                v-if="orderInfo.goodsImage"
                :src="orderInfo.goodsImage"
                :preview-src-list="[orderInfo.goodsImage]"
                class="order-img"
                fit="cover"
              />
              <span v-else class="value">无图片</span>
            </div>
          </div>

          <div class="order-row">
            <div class="order-item">
              <span class="label">下单时间：</span>
              <span class="value">{{ formatTime(orderInfo.createTime) }}</span>
            </div>
            <div class="order-item">
              <span class="label">支付时间：</span>
              <span class="value">{{ formatTime(orderInfo.payTime) }}</span>
            </div>
            <div class="order-item">
              <span class="label">完成时间：</span>
              <span class="value">{{ formatTime(orderInfo.finishTime) }}</span>
            </div>
          </div>

          <!-- 退款按钮 -->
          <div class="refund-btn-wrap" style="margin-top:24px;">
            <el-button type="danger" @click="handleRefund">操作退款</el-button>
          </div>
        </div>

        <!-- 暂无结果提示 -->
        <div v-if="!showResult && !loading" style="text-align:center; color:#999; padding:40px 0;">
          输入订单号后查询订单信息
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --blur: blur(12px);
  --alpha-bg: rgba(255, 255, 255, 0.35);
  --alpha-border: rgba(255, 255, 255, 0.45);
}

/* 加载样式 */
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

* {
  font-family: "PingFang SC", "苹方-简", sans-serif !important;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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

/* 玻璃面板 */
.glass-panel {
  background: rgba(255, 255, 255, 0.32);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

/* 输入框文字、占位符改为黑色 */
:deep(.el-input__inner) {
  color: #000 !important;
}
:deep(.el-input__inner::placeholder) {
  color: #000 !important;
  opacity: 0.7;
}

/* 订单结果样式 */
.order-result {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 24px;
}
.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 20px;
}
.order-row {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 16px;
  align-items: flex-start;
}
.order-item {
  display: flex;
  align-items: center;
  min-width: 280px;
}
.order-item.full {
  width: 100%;
  flex-wrap: wrap;
}
.label {
  font-weight: 600;
  color: #333;
  width: 100px;
  flex-shrink: 0;
}
.value {
  color: #555;
}
.order-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  margin-left: 8px;
}

@keyframes spin { 
  from { transform: rotate(0deg); } 
  to { transform: rotate(360deg); } 
}
</style>