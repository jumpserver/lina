<template>
  <el-link :disabled="disabled" @click="onClick">
    {{ title }}
  </el-link>
</template>

<script>
export default {
  name: 'Link',
  props: {
    href: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick() {
      window.open(this.href)
    }
  }
}
</script>

<style scoped>

</style>
