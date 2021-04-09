<template>
  <el-row :gutter="20">
    <h1>hello</h1>
  </el-row>
</template>

<script>

export default {
  name: 'Detail',
  components: {
    // RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
    }
  },
  computed: {
  }
}
</script>

<style lang='less' scoped>

</style>
