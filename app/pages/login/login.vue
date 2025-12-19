<template>
  <div class="login-container min-w-1200px">
    <div class="w-50%">
      <el-image src="/svg/login.svg" alt="登录图标" />
    </div>

    <div class="w-50%">
      <div>
        <!-- 模式切换标签 -->
        <div class="flex justify-center mb-6">
          <el-radio-group v-model="activeMode" size="large">
            <el-radio-button label="login">登录</el-radio-button>
            <el-radio-button label="register">注册</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 登录表单 -->
        <div v-if="activeMode === 'login'">
          <h1 class="text-center mb-6">欢迎登录</h1>
          <el-form
            @submit.prevent="handleLogin"
            style="max-width: 80%"
            label-width="180px"
            class="flex flex-col gap-20px"
          >
            <el-form-item label="邮箱地址">
              <el-input
                v-model="loginForm.email"
                type="email"
                placeholder="请输入邮箱地址"
                required
              />
            </el-form-item>

            <el-form-item label="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                required
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                size="large"
                style="width: 100%"
                :loading="loginLoading"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <p>{{ loginResult }}</p>
        </div>

        <!-- 注册表单 -->
        <div v-if="activeMode === 'register'">
          <h1 class="text-center mb-6">用户注册</h1>
          <el-form
            @submit.prevent="handleRegister"
            style="max-width: 80%"
            label-width="180px"
            class="flex flex-col gap-20px"
          >
            <el-form-item label="用户名">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                required
              />
            </el-form-item>

            <el-form-item label="邮箱地址">
              <el-input
                v-model="registerForm.email"
                type="email"
                placeholder="请输入邮箱地址"
                required
              >
                <template #append>
                  <el-button
                    type="success"
                    @click="sendVerificationCode"
                    :disabled="!registerForm.email || sendCodeLoading"
                    :loading="sendCodeLoading"
                  >
                    发送验证码
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="验证码">
              <el-input
                v-model="registerForm.code"
                placeholder="请输入6位验证码"
                maxlength="6"
                required
              />
            </el-form-item>

            <el-form-item label="密码">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                required
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                size="large"
                style="width: 100%"
                :loading="registerLoading"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>

          <p>{{ registerResult }}</p>
          <p>{{ sendCodeResult }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const name = ref("");
const msg = ref("");
const activeMode = ref("login"); // 当前模式：login 或 register

// 登录相关状态
const loginForm = ref({
  email: "",
  password: "",
});
const loginResult = ref("");
const loginLoading = ref(false);

// 注册相关状态
const registerForm = ref({
  username: "",
  email: "",
  code: "",
  password: "",
});
const registerResult = ref("");
const sendCodeResult = ref("");
const sendCodeLoading = ref(false);
const registerLoading = ref(false);

async function callApi() {
  const { data } = await $fetch("/api/hello", {
    method: "POST",
    body: { name: name.value },
  });
  msg.value = data.message;
}

// 登录处理函数
async function handleLogin() {
  if (!loginForm.value.email || !loginForm.value.password) {
    ElMessage.warning("请填写完整的登录信息");
    return;
  }

  loginLoading.value = true;
  try {
    const response = await $fetch("/api/login", {
      method: "POST",
      body: {
        email: loginForm.value.email,
        password: loginForm.value.password,
      },
    });

    if (response.success) {
      ElMessage.success("登录成功");
      loginResult.value = `登录成功: ${JSON.stringify(response)}`;
      // 这里可以添加登录成功后的跳转逻辑
       await navigateTo('/home');

    } else {
      ElMessage.error(response.message || "登录失败");
      loginResult.value = `登录失败: ${response.message}`;
    }
  } catch (error) {
    ElMessage.error("登录失败");
    loginResult.value = `登录失败: ${error.message}`;
  } finally {
    loginLoading.value = false;
  }
}

// 发送验证码
async function sendVerificationCode() {
  if (!registerForm.value.email) {
    ElMessage.warning("请先输入邮箱地址");
    return;
  }

  sendCodeLoading.value = true;
  try {
    const response = await $fetch("/api/sendCode", {
      method: "POST",
      body: {
        email: registerForm.value.email,
      },
    });

    if (response.success) {
      ElMessage.success("验证码发送成功");
      sendCodeResult.value = `验证码发送成功: ${JSON.stringify(response)}`;
    } else {
      ElMessage.error(response.message || "验证码发送失败");
      sendCodeResult.value = `验证码发送失败: ${response.message}`;
    }
  } catch (error) {
    ElMessage.error("验证码发送失败");
    sendCodeResult.value = `验证码发送失败: ${error.message}`;
  } finally {
    sendCodeLoading.value = false;
  }
}

// 注册处理函数
async function handleRegister() {
  if (
    !registerForm.value.username ||
    !registerForm.value.email ||
    !registerForm.value.code ||
    !registerForm.value.password
  ) {
    ElMessage.warning("请填写完整的注册信息");
    return;
  }

  registerLoading.value = true;
  try {
    const response = await $fetch("/api/register", {
      method: "POST",
      body: {
        username: registerForm.value.username,
        email: registerForm.value.email,
        code: registerForm.value.code,
        password: registerForm.value.password,
      },
    });

    if (response.success) {
      ElMessage.success("注册成功");
      registerResult.value = `注册成功: ${JSON.stringify(response)}`;
      // 注册成功后可以切换到登录模式
       activeMode.value = 'login';
    } else {
      ElMessage.error(response.message || "注册失败");
      registerResult.value = `注册失败: ${response.message}`;
    }
  } catch (error) {
    ElMessage.error("注册失败");
    registerResult.value = `注册失败: ${error.message}`;
  } finally {
    registerLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 8rem;
  height: 800px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-image:
    /* 底层：蓝→紫渐变（主色调） */ linear-gradient(
    75deg,
    #ff5500 50%,
    #eee6e6 50%
  );
  background-blend-mode: overlay; /* 混合模式，让叠加更自然 */
}
</style>
