<template>
  <div class="wrapper-content">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'WrapperContent'
}
</script>

<style scoped>
  .wrapper-content {
    padding: 10px 20px 10px;
  }
</style>
