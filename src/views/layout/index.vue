<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
// 引入全部需要的侧边栏图标
import {
  User,
  SwitchButton,
  House,
  Histogram,
  Box,
  UserFilled,
  DocumentChecked,
  Document,
  Tickets
} from '@element-plus/icons-vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logoutApi } from '@/api/login.js';

const router = useRouter();
const userName = ref('');

onMounted(() => {
  const userStr = localStorage.getItem('loginForm');
  const schoolStr = localStorage.getItem('schoolList');

  if (userStr) {
    const user = JSON.parse(userStr);
    const userId = user.school; // 学校ID
    let schoolName = '';

    // 匹配学校名称
    if (schoolStr) {
      const schoolMap = JSON.parse(schoolStr);
      // 结构：{ 1: { "1": "青海民族大学" } }
      const target = schoolMap[userId];
      if (target) {
        // 取内层第一个值作为学校名
        schoolName = Object.values(target)[0] || '';
      }
    }

    // 拼接：用户名（学校名）
    if (schoolName) {
      userName.value = `${user.username || '用户'}（${schoolName}）`;
    } else {
      userName.value = user.username || '用户';
    }
  } else {
    userName.value = '未登录';
  }
});

// 退出登录
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
    const userInfo = JSON.parse(localStorage.getItem('loginForm') || '{}');
    const res = await logoutApi(userInfo);
    if (res.code === 200) {
      localStorage.removeItem('loginForm');
      localStorage.removeItem('schoolList');
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
          <img class="logo" src="@/assets/exchange-logo.png" alt="Logo" />
          <span class="title">Exchange!后台管理系统</span>
        </div>

        <div class="header-right">
          <div class="user-info">
            <el-icon><User /></el-icon>
            <span>{{ userName }}</span>
          </div>

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
              <el-icon><House /></el-icon>首页
            </el-menu-item>
            <el-menu-item index="/dashboard">
              <el-icon><Histogram /></el-icon>数据看板
            </el-menu-item>
            <el-menu-item index="/goods">
              <el-icon><Box /></el-icon>处理待审核商品
            </el-menu-item>
            <el-menu-item index="/user">
              <el-icon><UserFilled /></el-icon>用户账号管理
            </el-menu-item>
            <el-menu-item index="/auditUserInfo">
              <el-icon><DocumentChecked /></el-icon>用户修改信息审核
            </el-menu-item>
            <el-menu-item index="/post">
              <el-icon><Document /></el-icon>平台帖子管理
            </el-menu-item>
            <el-menu-item index="/orderOperate">
              <el-icon><Tickets /></el-icon>订单管理
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 右侧内容 -->
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
  background: linear-gradient(-45deg, hsl(190, 100%, 86%), #e6f4ff, #b7f2ff, #b7e8ff);
  background-size: 400% 400%;
  animation: flowGradient 16s ease infinite;
}

/* 头部 */
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

/* 左侧菜单 */
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

/* 主内容区 */
.glass-main {
  margin-left: 230px;
  padding-top: 70px;
  background: transparent;
  width: 100%;
}

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

.liquid-btn.pink:hover {
  background: rgba(120, 215, 255, 0.15);
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