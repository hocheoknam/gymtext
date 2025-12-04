<template>
  <div style="padding: 2rem">
    <h2>Nuxt3 全栈 Demo</h2>
    <input v-model="name" placeholder="输入姓名" />
    <button @click="callApi">发送</button>
    <p>{{ msg }}</p>

    <hr style="margin: 2rem 0" />

    <h3>用户注册表单</h3>
    <form @submit.prevent="handleRegister" style="max-width: 400px">
      <div style="margin-bottom: 1rem">
        <label for="username">用户名：</label><br />
        <input
          id="username"
          v-model="registerForm.username"
          placeholder="输入用户名"
          required
          style="width: 100%; padding: 0.5rem"
        />
      </div>

      <div style="margin-bottom: 1rem">
        <label for="email">邮箱地址：</label><br />
        <div style="display: flex; gap: 0.5rem">
          <input
            id="email"
            v-model="registerForm.email"
            type="email"
            placeholder="输入邮箱地址"
            required
            style="flex: 1; padding: 0.5rem"
          />
          <button
            type="button"
            @click="sendVerificationCode"
            style="
              padding: 0.5rem 1rem;
              background: #28a745;
              color: white;
              border: none;
              cursor: pointer;
              white-space: nowrap;
            "
          >
            发送验证码
          </button>
        </div>
      </div>

      <div style="margin-bottom: 1rem">
        <label for="code">验证码：</label><br />
        <input
          id="code"
          v-model="registerForm.code"
          placeholder="输入6位验证码"
          maxlength="6"
          required
          style="width: 100%; padding: 0.5rem"
        />
      </div>

      <div style="margin-bottom: 1rem">
        <label for="password">密码：</label><br />
        <input
          id="password"
          v-model="registerForm.password"
          type="password"
          placeholder="输入密码"
          required
          style="width: 100%; padding: 0.5rem"
        />
      </div>

      <button
        type="submit"
        style="
          padding: 0.5rem 1rem;
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
        "
      >
        注册
      </button>
    </form>

    <p>{{ registerResult }}</p>
    <p>{{ sendCodeResult }}</p>
  </div>
</template>

<script setup>
const name = ref("");
const msg = ref("");
const registerResult = ref("");
const sendCodeResult = ref("");

const registerForm = ref({
  username: "",
  email: "",
  code: "",
  password: "",
});

async function callApi() {
  const { data } = await $fetch("/api/hello", {
    method: "POST",
    body: { name: name.value },
  });
  msg.value = data.message;
}

async function sendVerificationCode() {
  if (!registerForm.value.email) {
    sendCodeResult.value = "请先输入邮箱地址";
    return;
  }

  try {
    const response = await $fetch("/api/sendCode", {
      method: "POST",
      body: { email: registerForm.value.email },
    });
    sendCodeResult.value = `验证码发送成功: ${JSON.stringify(response)}`;
  } catch (error) {
    sendCodeResult.value = `验证码发送失败: ${error.message}`;
  }
}

async function handleRegister() {
  try {
    const response = await $fetch("/api/register", {
      method: "POST",
      body: registerForm.value,
    });
    registerResult.value = `注册成功: ${JSON.stringify(response)}`;
  } catch (error) {
    registerResult.value = `注册失败: ${error.message}`;
  }
}
</script>
