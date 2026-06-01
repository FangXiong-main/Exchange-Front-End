<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import {
  getUserInfoChangePageApi,
  auditUserInfoChangeApi,
  getSchoolListApi
} from '@/api/user.js'

const loading = ref(false)
const auditList = ref([])
const page = ref({ pageNum: 1, pageSize: 10, total: 0 })
const timeSort = ref('desc')
const schoolMap = ref({})

const detailDialog = ref(false)
const currentRow = ref(null)
const rejectReason = ref('')

let timer = null

const loadSchoolList = async () => {
  try {
    const res = await getSchoolListApi()
    if (res.code === 200) {
      const raw = res.data
      const map = {}
      Object.values(raw).forEach(item => {
        map[item.id] = item.school_name
      })
      schoolMap.value = map
    }
  } catch (e) {
    ElMessage.error('学校列表加载失败')
  }
}

const getAuditList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: page.value.pageNum,
      pageSize: page.value.pageSize,
      auditStatus: 0
    }
    const res = await getUserInfoChangePageApi(params)
    if (res.code === 200) {
      let list = res.data.rows || []
      list.sort((a, b) => {
        const t1 = new Date(a.requestTime).getTime()
        const t2 = new Date(b.requestTime).getTime()
        return timeSort.value === 'desc' ? t2 - t1 : t1 - t2
      })
      list.forEach(item => {
        item.remainTimeText = formatRemainTime(item)
      })
      auditList.value = list
      page.value.total = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const formatRemainTime = (row) => {
  const req = new Date(row.requestTime).getTime()
  const now = Date.now()
  const expire = req + 24 * 60 * 60 * 1000
  const remain = expire - now

  if (remain <= 0) return '<span style="color:#f56c6c;">已超时</span>'
  const h = Math.floor(remain / 3600000)
  const m = Math.floor((remain % 3600000) / 60000)

  let text = `${h}小时${m}分`
  if (remain < 3600000) text += ' <span style="color:#e6a700;">（即将超时，请尽快处理）</span>'
  return text
}

const updateRemainTime = () => {
  auditList.value.forEach(item => {
    item.remainTimeText = formatRemainTime(item)
  })
}

const openDetail = (row) => {
  currentRow.value = row
  rejectReason.value = row.rejectReason || ''
  detailDialog.value = true
}

// ======================
// 审核通过（已修改响应逻辑）
// ======================
const passAudit = async () => {
  try {
    await ElMessageBox.confirm('确认通过该用户信息修改？')
    let data = {
      id: currentRow.value.id,
      username: currentRow.value.username,
      avatarUrl: currentRow.value.avatarUrl,
      school: currentRow.value.school,
      originalUsername: currentRow.value.originalUsername,
      email: currentRow.value.email,
      auditStatus: 1,
      requestTime: currentRow.value.requestTime,
      serverTime: currentRow.value.serverTime,
      rejectReason: ''
    }
    const res = await auditUserInfoChangeApi(data)
    
    if (res.code === 200) {
      ElMessage.success('审核成功')
      detailDialog.value = false
      getAuditList()
    } else if (res.code === 0) {
      ElMessage.error(res.msg || '审核失败')
    }
  } catch (err) {
    ElMessage.error('操作异常：' + err.message)
  }
}

// ======================
// 审核驳回（已修改响应逻辑）
// ======================
const rejectAudit = async () => {
  if (!rejectReason.value.trim()) {
    return ElMessage.warning('请输入驳回原因')
  }
  let data = {
    id: currentRow.value.id,
    username: currentRow.value.username,
    avatarUrl: currentRow.value.avatarUrl,
    school: currentRow.value.school,
    originalUsername: currentRow.value.originalUsername,
    email: currentRow.value.email,
    auditStatus: 2,
    requestTime: currentRow.value.requestTime,
    serverTime: currentRow.value.serverTime,
    rejectReason: rejectReason.value.trim()
  }

  try {
    const res = await auditUserInfoChangeApi(data)
    
    if (res.code === 200) {
      ElMessage.success('已驳回')
      detailDialog.value = false
      getAuditList()
    } else if (res.code === 0) {
      ElMessage.error(res.msg || '驳回失败')
    }
  } catch (err) {
    ElMessage.error('操作异常：' + err.message)
  }
}

const handleSearch = () => { page.value.pageNum = 1; getAuditList() }
const handleReset = () => { timeSort.value = 'desc'; getAuditList() }
const handlePageChange = () => { getAuditList() }

onMounted(async () => {
  await loadSchoolList()
  getAuditList()
  timer = setInterval(updateRemainTime, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <!-- 🔥 美化后的审核弹窗 -->
  <el-dialog v-model="detailDialog" title="用户信息修改审核" width="580px" :close-on-click-modal="false">
    <div v-if="currentRow" class="audit-detail-card">
      <div class="info-item">
        <span class="label">修改前用户名：</span>
        <span class="value">{{ currentRow.originalUsername }}</span>
      </div>

      <div class="info-item">
        <span class="label">修改后用户名：</span>
        <span class="value">{{ currentRow.username }}</span>
      </div>

      <div class="info-item">
        <span class="label">修改后学校：</span>
        <span class="value">{{ schoolMap[currentRow.school] || '未知学校' }}</span>
      </div>

      <!-- 🔥 头像区域独立排版，彻底解决错乱 -->
      <div class="avatar-section">
        <span class="label">修改后头像：</span>
        <el-image 
          :src="currentRow.avatarUrl" 
          class="avatar-preview"
          fit="cover"
          lazy
        />
      </div>

      <!-- 驳回原因 -->
      <div class="reject-section">
        <span class="label">驳回原因：</span>
        <el-input 
          v-model="rejectReason" 
          type="textarea" 
          rows="4"
          placeholder="请输入驳回原因"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="detailDialog = false">取消</el-button>
        <el-button type="danger" @click="rejectAudit">驳回</el-button>
        <el-button type="primary" @click="passAudit">通过</el-button>
      </div>
    </template>
  </el-dialog>

  <div class="dashboard-wrap">
    <div class="dashboard-container">
      <div class="dashboard-title">
        <h2>用户信息修改审核</h2>
        <p>Exchange! 后台管理系统</p>
      </div>

      <div class="glass-panel" style="padding:26px; position:relative;">
        <div class="panel-loading" v-if="loading">
          <div class="loading-box">
            <div class="loading-spin"></div>
            <span>加载中...</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>审核列表</h3>
          <span class="tips">共 {{ page.total }} 条</span>
        </div>

        <div style="display:flex; gap:10px; margin:20px 0; align-items:center;flex-wrap:wrap;">
          <el-select v-model="timeSort" style="width:160px;">
            <el-option label="最新申请优先" value="desc" />
            <el-option label="最早申请优先" value="asc" />
          </el-select>

          <el-button type="primary" @click="handleSearch">刷新</el-button>
          <el-button @click="handleReset">重置排序</el-button>
        </div>

        <el-table
          v-if="auditList.length > 0"
          :data="auditList"
          border
          style="width:100%"
          class="glass-table"
        >
          <el-table-column label="原用户名" prop="originalUsername" align="center" />
          <el-table-column label="剩余处理时间" align="center">
            <template #default="{ row }">
              <span v-html="row.remainTimeText"></span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" round @click="openDetail(row)">
                <el-icon><View /></el-icon> 查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无待审核数据" style="margin-top:30px" />

        <el-pagination
          v-model:current-page="page.pageNum"
          v-model:page-size="page.pageSize"
          :total="page.total"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top:20px; justify-content:flex-end;"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
:root { --blur: blur(12px); --alpha-bg: rgba(255,255,255,0.35); --alpha-border: rgba(255,255,255,0.45); }

/* 🔥 审核弹窗美化样式 */
.audit-detail-card {
  padding: 12px 8px;
}
.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 15px;
}
.label {
  font-weight: 600;
  width: 130px;
  color: #333;
}
.value {
  color: #555;
  flex: 1;
}

/* 头像区域独立布局，不再错乱 */
.avatar-section {
  margin: 20px 0;
}
.avatar-section .label {
  display: block;
  margin-bottom: 10px;
}
.avatar-preview {
  width: 110px;
  height: 110px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* 驳回原因 */
.reject-section {
  margin-top: 20px;
}
.reject-section .label {
  display: block;
  margin-bottom: 10px;
}

/* 底部按钮居中对齐 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 原有样式保留 */
.panel-loading { position: absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.15); backdrop-filter:blur(6px); border-radius:20px; display:flex; align-items:center; justify-content:center; z-index:10; }
.loading-box { display:flex; align-items:center; gap:12px; padding:20px 32px; border-radius:16px; background:var(--alpha-bg); backdrop-filter:var(--blur); border:1px solid var(--alpha-border); color:#fff; font-size:16px; font-weight:500; }
.loading-spin { width:20px; height:20px; border:2px solid rgba(255,255,255,0.3); border-top:2px solid #fff; border-radius:50%; animation:spin 0.8s linear infinite; }
* { font-family: "PingFang SC", "苹方-简", sans-serif !important; margin:0; padding:0; box-sizing:border-box; }
.dashboard-wrap { width:100%; min-height:100vh; background:transparent !important; }
.dashboard-container { width:100%; height:100%; padding:24px; }
.dashboard-title { margin-bottom:24px; }
.dashboard-title h2 { font-size:26px; font-weight:600; color:#222; }
.dashboard-title p { color:#666; margin-top:6px; font-size:15px; }
.glass-panel { background:rgba(255,255,255,0.32); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.4); border-radius:20px; box-shadow:0 8px 24px rgba(0,0,0,0.05); }
.glass-panel h3 { font-size:16px; font-weight:600; color:#222; }
.tips { font-size:12px; color:#888; background:rgba(255,255,255,0.4); padding:2px 8px; border-radius:10px; }
:deep(.el-table) { background:transparent !important; border-radius:20px !important; overflow:hidden; }
:deep(.el-table__row) { background:rgba(255,255,255,0.25) !important; }
:deep(.el-table th) { background:rgba(255,255,255,0.4) !important; }
:deep(.el-input__inner) { color:#000 !important; }
:deep(.el-textarea__inner) { color:#000 !important; }
@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
</style>