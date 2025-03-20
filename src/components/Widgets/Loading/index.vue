<template>
  <span v-if="loading" v-loading="loading" :style="{ height: loadingHeight + 'px'}" class="loading" />
</template>

<script>
export default {
  name: 'Index',
  props: {
    loading: {
      type: Boolean,
      default: true
    },
    loadingHeight: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.loading {
  margin-top: 20px;
  display: block;
}
</style>
