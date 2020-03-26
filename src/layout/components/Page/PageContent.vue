<template>
  <div class="wrapper-content">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'PageContent'
}
</script>

<style scoped>
  .wrapper-content {
    padding: 20px 25px 40px;
  }
</style>
