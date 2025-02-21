<template>
  <span v-if="loading" v-loading="loading" class="loading" />
</template>

<script>
export default {
  name: 'Index',
  props: {
    loading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  margin-top: 20px;
  display: block;
}
</style>
