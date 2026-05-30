<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Unlock, Search } from '@element-plus/icons-vue'
import {
  getAllUserPageApi,
  banUserApi,
  unBanUserApi
} from '@/api/user.js'

// 表格数据
const loading = ref(false)
const userList = ref([])
const page = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 搜索条件
const email = ref('')
// 状态筛选：''全部 / 0正常 / -1已封禁
const status = ref('')

// 封禁弹窗
const banDialogVisible = ref(false)
const banReason = ref('')
const currentRow = ref(null)

// 获取用户列表（统一接口）
const getUserList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: page.value.pageNum,
      pageSize: page.value.pageSize,
      email: email.value.trim(),
      status: status.value // 状态筛选
    }
    const res = await getAllUserPageApi(params)
    if (res.code === 200) {
      userList.value = res.data.rows
      page.value.total = res.data.total
    }
  } catch (e) {
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  page.value.pageNum = 1
  getUserList()
}

// 重置
const handleReset = () => {
  email.value = ''
  status.value = ''
  getUserList()
}

// 分页切换
const handlePageChange = () => {
  getUserList()
}

// 打开封禁弹窗
const openBanDialog = (row) => {
  currentRow.value = row
  banReason.value = ''
  banDialogVisible.value = true
}

// 确认封禁
const confirmBan = async () => {
  if (!banReason.value.trim()) {
    ElMessage.warning('请输入封禁原因')
    return
  }
  try {
    const res = await banUserApi({
      id: currentRow.value.id,
      banReason: banReason.value
    })
    if (res.code === 200) {
      ElMessage.success('封禁成功')
      banDialogVisible.value = false
      getUserList()
    } else {
      ElMessage.error('封禁失败')
    }
  } catch (e) {
    ElMessage.error('请求失败')
  }
}

// 解除封禁
const unBanUser = async (row) => {
  try {
    await ElMessageBox.confirm('确定要解除该用户封禁吗？', '提示', { type: 'warning' })
    const res = await unBanUserApi({ id: row.id })
    if (res.code === 200) {
      ElMessage.success('解除封禁成功')
      getUserList()
    } else {
      ElMessage.error('操作失败')
    }
  } catch {
    ElMessage.info('已取消操作')
  }
}

onMounted(() => {
  getUserList()
})
</script>

<template>
  <!-- 封禁弹窗 -->
  <el-dialog
    v-model="banDialogVisible"
    title="封禁用户"
    width="450px"
    :close-on-click-modal="false"
    z-index="999999"
  >
    <div style="margin-bottom:15px;">请输入封禁原因：</div>
    <el-input
      v-model="banReason"
      type="textarea"
      rows="3"
      placeholder="请输入封禁原因（不能为空）"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBan">确认封禁</el-button>
      </span>
    </template>
  </el-dialog>

  <div class="dashboard-wrap">
    <div class="dashboard-container">
      <div class="dashboard-title">
        <h2>用户管理</h2>
        <p>Exchange! 后台管理系统</p>
      </div>

      <!-- 统一用户面板 -->
      <div class="glass-panel" style="padding:26px; position:relative;">
        <div class="panel-loading" v-if="loading">
          <div class="loading-box">
            <div class="loading-spin"></div>
            <span>加载中...</span>
          </div>
        </div>

        <!-- 标题 + 总数 -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>用户列表</h3>
          <span class="tips">共 {{ page.total }} 条</span>
        </div>

        <!-- 搜索 + 筛选 -->
        <div style="display: flex; gap: 10px; margin: 12px 0 20px; align-items:center;flex-wrap:wrap;">
          <!-- 邮箱搜索 -->
          <el-input
            v-model="email"
            placeholder="搜索邮箱"
            style="width: 300px;"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <!-- 状态筛选 -->
          <el-select v-model="status" placeholder="账号状态" style="width:160px;">
            <el-option label="全部" value="" />
            <el-option label="正常" value="1" />
            <el-option label="已封禁" value="-1" />
          </el-select>

          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 表格 -->
        <el-table
          v-if="userList.length > 0"
          :data="userList"
          border
          style="width:100%"
          class="glass-table"
        >
          <el-table-column label="用户名" prop="username" align="center" />
          <el-table-column label="注册邮箱" prop="email" align="center" />
          <el-table-column label="账号状态" align="center">
            <template #default="{ row }">
              <span class="status-dot" :class="row.role === -1 ? 'dot-red' : 'dot-green'"></span>
              <span>{{ row.role === -1 ? '已封禁' : '正常' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="封禁原因" prop="banReason" align="center">
            <template #default="{ row }">
              <span style="color:#666;">{{ row.banReason || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <!-- 自动切换按钮：正常=封禁 / 已封禁=解除 -->
              <el-button
                v-if="row.role !== -1"
                type="danger"
                size="small"
                round
                @click="openBanDialog(row)"
              >
                <el-icon><Lock /></el-icon> 封禁
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                round
                @click="unBanUser(row)"
              >
                <el-icon><Unlock /></el-icon> 解除封禁
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无用户数据" style="margin-top:30px" />

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="page.pageNum"
          v-model:page-size="page.pageSize"
          :total="page.total"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end;"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}
.glass-panel h3 {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}
.tips {
  font-size: 12px;
  color: #888;
  background: rgba(255,255,255,0.4);
  padding: 2px 8px;
  border-radius: 10px;
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.dot-green { background-color: #67c23a; }
.dot-red { background-color: #f56c6c; }
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
:deep(.el-pagination__jump input) {
  color: #000 !important;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>