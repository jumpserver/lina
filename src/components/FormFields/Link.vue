<template>
  <el-link @click="onClick">
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
