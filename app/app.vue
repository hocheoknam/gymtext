<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
/* 页面切换动画 */
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}
</style>
