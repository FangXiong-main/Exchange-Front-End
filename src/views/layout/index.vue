<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, EditPen, SwitchButton, Promotion, Histogram } from '@element-plus/icons-vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logoutApi } from '@/api/login.js';
import { loginApi } from '@/api/login.js';

const router = useRouter();
const userName = ref('');

onMounted(() => {
  const userStr = localStorage.getItem('loginForm');
  if (userStr) {
    const user = JSON.parse(userStr);
    userName.value = user.username || '用户';
  } else {
    userName.value = '未登录';
  }
});

const loginForm = ref({ username: '', password: '' });
const passwordForm = ref({ fPassword: '', sPassword: '' });
const userNew = ref({ password: '', type: 2 });
const ruleFormRef = ref(null);

const rules = {
  fPassword: [{ required: true, message: '请输入新密码', trigger: 'blur', min: 6 }],
  sPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }]
};

const confirmDialogFormVisible = ref(false);
const newDialogFormVisible = ref(false);

const modifyButton = () => {
  const userStr = localStorage.getItem('loginForm');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  loginForm.value.username = user.username;
  userNew.value.id = user.id;
  confirmDialogFormVisible.value = true;
};

const onConfirm = async () => {
  const res = await loginApi(loginForm.value);
  if (res.code === 200) {
    confirmDialogFormVisible.value = false;
    newDialogFormVisible.value = true;
  } else {
    ElMessage.error('原密码错误');
  }
};

const onCancel = () => {
  confirmDialogFormVisible.value = false;
  newDialogFormVisible.value = false;
};

const modifyPassword = async () => {
  if (!ruleFormRef.value) return;
  const valid = await ruleFormRef.value.validate();
  if (!valid) return;

  if (passwordForm.value.fPassword !== passwordForm.value.sPassword) {
    ElMessage.error('两次密码不一致');
    return;
  }

  userNew.value.password = passwordForm.value.fPassword;
  const res = await updateApi(userNew.value);
  if (res.code === 200) {
    const res = await logoutApi(JSON.parse(localStorage.getItem('loginForm')));
    if (res.code === 200) {
      localStorage.removeItem('loginForm');
      router.push('/login');
      ElMessage.success('退出成功');
    }
    ElMessage.success('密码修改成功，请重新登录');
  } else {
    ElMessage.error('修改失败');
  }
};

const logOut = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出确认',
    {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'liquid-msg-box'
    }
  ).then(async () => {
    const res = await logoutApi(JSON.parse(localStorage.getItem('loginForm')));
    if (res.code === 200) {
      localStorage.removeItem('loginForm');
      router.push('/login');
      ElMessage.success('退出成功');
    }
  }).catch(() => {
    ElMessage.info('已取消退出');
  });
};
</script>

<template>
  <div class="layout-container">
    <el-container>
      <!-- 顶部固定 -->
      <el-header class="glass-header">
        <div class="header-left">
          <img class="logo" src="../../assets/Logo.png" alt="Logo" />
          <span class="title">Exchange!后台管理系统</span>
        </div>

        <div class="header-right">
          <div class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ userName }}</span>
          </div>

          <el-button round class="liquid-btn blue" @click="modifyButton">
            <el-icon><EditPen /></el-icon>修改密码
          </el-button>

          <el-button round class="liquid-btn pink" @click="logOut">
            <el-icon><SwitchButton /></el-icon>退出登录
          </el-button>
        </div>
      </el-header>

      <el-container>
        <!-- 左侧固定 -->
        <el-aside class="glass-aside">
          <el-menu router active-menu="/index" class="glass-menu">
            <el-menu-item index="/index">
              <el-icon><Promotion /></el-icon>首页
            </el-menu-item>
            <el-menu-item index="/dashboard">
              <el-icon><Histogram /></el-icon>数据看板
            </el-menu-item>
            <el-menu-item index="/goods">
              <el-icon><Histogram /></el-icon>处理待审核商品
            </el-menu-item>
            <el-menu-item index="/user">
              <el-icon><Histogram /></el-icon>用户账号管理
            </el-menu-item>
            <el-menu-item index="/auditUserInfo">
              <el-icon><Histogram /></el-icon>用户修改信息审核
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 右侧内容（正常滚动，不重叠） -->
        <el-main class="glass-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <footer class="glass-footer">
      <span>Copyright © FangXiong Technology 2026-2027</span>
      <br />
      <span>All Rights Reserved</span>
    </footer>

    <el-dialog v-model="confirmDialogFormVisible" width="420px" title="验证身份" class="liquid-dialog">
      <el-form :model="loginForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="loginForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="onCancel">取消</el-button>
        <el-button round type="primary" @click="onConfirm">下一步</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="newDialogFormVisible" width="420px" title="设置新密码" class="liquid-dialog">
      <el-form :model="passwordForm" ref="ruleFormRef" :rules="rules" label-width="100px">
        <el-form-item label="新密码" prop="fPassword">
          <el-input v-model="passwordForm.fPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="sPassword">
          <el-input v-model="passwordForm.sPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button round @click="onCancel">取消</el-button>
        <el-button round type="primary" @click="modifyPassword">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
* {
  font-family: "PingFang SC", "苹方-简", sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout-container {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(-45deg, #f0f8ff, #e6f4ff, #fde2ff, #fef0ff);
  background-size: 400% 400%;
  animation: flowGradient 16s ease infinite;
}

/* ========== 头部固定 ========== */
.glass-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

/* ========== 左侧菜单固定 ========== */
.glass-aside {
  width: 230px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(25px);
  border-right: 1px solid rgba(255, 255, 255, 0.5);
  position: fixed;
  top: 70px;
  left: 0;
  bottom: 0;
  z-index: 998;
}

/* ========== 右侧内容（自动避开菜单，不重叠） ========== */
.glass-main {
  margin-left: 230px;
  padding-top: 70px;
  background: transparent;
  width: 100%;
}

/* ========== 其他样式不变 ========== */
.el-container > .el-container {
  display: flex;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.liquid-btn {
  border: none;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #222;
  font-weight: 500;
  padding: 7px 18px;
  transition: all 0.3s;
}

.liquid-btn.blue:hover {
  background: rgba(100, 150, 255, 0.15);
  color: #3366ff;
}

.liquid-btn.pink:hover {
  background: rgba(255, 120, 180, 0.15);
  color: #ff5799;
}

.glass-menu {
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  border-radius: 12px;
  margin: 6px 12px;
}

:deep(.el-menu-item.is-active) {
  background: rgba(100, 150, 255, 0.15) !important;
  color: #3366ff !important;
  font-weight: 500;
}

.glass-footer {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(18px);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  color: #555;
  font-size: 13px;
}

:deep(.liquid-dialog .el-dialog) {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

:deep(.liquid-msg-box) {
  background: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(30px) !important;
  border-radius: 18px !important;
  border: 1px solid rgba(255,255,255,0.6) !important;
}

@keyframes flowGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>