<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { detLoginApi, loginApi } from '@/api/login.js';
// 导入院校列表接口
import { getSchoolListApi } from '@/api/user.js';
import { useRouter } from 'vue-router';

const type = 2;
const loginForm = ref({ username: '', password: '' , role:2 });
const router = useRouter();
const loading = ref(false);

const detectIsLogin = async () => {
    const result = await detLoginApi();
    if (result.code) {
      router.push('/');
      ElMessage.warning('您已登录');
    }
};

const resetForm = () => {
  loginForm.value.username = '';
  loginForm.value.password = '';
};


const onLogin = async () => {
  loading.value = true;
  const result = await loginApi(loginForm.value);
  if (result.code) {
    ElMessage.success('登录成功');
    localStorage.setItem('loginForm', JSON.stringify(result.data));

    // 登录成功后 请求院校列表 无参
    try {
      const schoolRes = await getSchoolListApi();
      // 直接将返回的 Map 结构数据存入本地 schoolList
      localStorage.setItem('schoolList', JSON.stringify(schoolRes.data));
    } catch (err) {
      ElMessage.warning('院校列表加载失败');
    }

    router.push('/index');
  } else {
    loading.value = false;
    ElMessage.error(result.msg);
  }
};

onMounted(() => {
  detectIsLogin();
});
</script>

<template>
  <div id="container">
    <div class="login-form" v-if="!loading">
      <img src="@/assets/exchange-logo.png" alt="" style="width: 100px; margin: 0 auto; display: block;">
      <p class="title">Exchange!后台管理系统</p>

      <el-form label-width="90px"> 
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>

        <el-form-item>
          <el-button class="glass-btn" type="primary" @click="onLogin">登 录</el-button>
          <el-button class="glass-btn" type="info" @click="resetForm">清 空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="loading-glass" v-else>
      <div class="loading-box">
        <div class="loading-spin"></div>
        <span>登录中...</span>
      </div>
    </div>
  </div>
</template>

<style>
/* 全局高级字体 */
* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif !important;
  --blur: blur(12px);
  --alpha-bg: rgba(255, 255, 255, 0.35);
  --alpha-border: rgba(255, 255, 255, 0.45);
}

/* 输入框样式 */
.el-input__wrapper {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}
.el-input__inner {
  height: 46px !important;
  line-height: 46px !important;
  padding: 0 18px !important;
  background: var(--alpha-bg) !important;
  border: 1px solid var(--alpha-border) !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  backdrop-filter: var(--blur) !important;
  -webkit-backdrop-filter: var(--blur) !important;
  /* 输入框文字变大 */
  font-size: 16px !important;
}
.el-input__inner::placeholder {
  color: rgba(255,255,255,0.8) !important;
  font-size: 15px !important;
}

/* 用户名、密码标签字体放大 */
.el-form-item__label {
  color: #fff !important;
  font-weight: 500 !important;
  /* 标签文字变大 */
  font-size: 16px !important;
}

/* 按钮 */
.glass-btn {
  width: 130px !important;
  height: 46px !important;
  margin-top: 25px !important;
  background: var(--alpha-bg) !important;
  border: 1px solid var(--alpha-border) !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  font-size: 16px !important;
  border-radius: 12px !important;
  backdrop-filter: var(--blur) !important;
  transition: all 0.3s;
}
.glass-btn:hover {
  transform: scale(1.05);
  background: rgba(255,255,255,0.45) !important;
}
</style>

<style scoped>
#container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(120deg, #71d0ff, #46c4ff, #00d5ff, #0163a9);
  background-size: 400% 400%;
  animation: bgGradient 12s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 100%;
  max-width: 480px;
  padding: 50px 40px;
  border-radius: 20px;
  background: var(--alpha-bg);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border: 1px solid var(--alpha-border);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  animation: formSlide 0.8s ease-out forwards;
}

.title {
  font-size: 32px;
  text-align: center;
  margin: 15px 0 40px 0;
  font-weight: bold;
  background: linear-gradient(to right, #ffffff, #e0eaff);
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: 1px;
}

.loading-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.loading-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 25px 40px;
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

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes bgGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes formSlide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>