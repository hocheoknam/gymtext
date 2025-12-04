<template>
  <div style="padding:2rem">
    <h2>Nuxt3 全栈 Demo</h2>
    <input v-model="name" placeholder="输入姓名" />
    <button @click="callApi">发送</button>
    <p>{{ msg }}</p >
  </div>
</template>

<script setup>
const name = ref('')
const msg = ref('')

async function callApi() {
  const { data } = await $fetch('/api/hello', {
    method: 'POST',
    body: { name: name.value }
  })
  msg.value = data.message
}
</script>