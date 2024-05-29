<template>
  <div class="panel-item">
    <span>{{ title }}: </span>
    <el-link :underline="false" type="primary">
      <span class="content">{{ content }}</span>
    </el-link>
  </div>
</template>

<script>

export default {
  name: 'InfoPanel',
  components: {
  },
  props: {
    title: {
      type: String,
      default: () => ''
    },
    content: {
      type: [String, Number],
      default: () => ''
    }
  },
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>

<style lang='scss' scoped>
.content {
  font-weight: bold;
  margin-left: 2px;
}
.panel-item {
  margin: 6px 0;
  text-align: left;
}
</style>
