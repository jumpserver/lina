<template>
  <div class="container">
    <div class="top">
      <svg-icon icon-class="collapse" @click="onClose" />
    </div>
    <el-tabs v-model="active" :tab-position="'right'" @tab-click="handleClick">
      <el-tab-pane v-for="(item) in submenu" :key="item.name" :label="item.label" :name="item.name">
        <span slot="label">
          <svg-icon :icon-class="item.icon" />
        </span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      type: String,
      default: 'chat'
    },
    submenu: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    }
  },
  methods: {
    handleClick(tab, event) {
      this.$emit('tab-click', tab)
    },
    onClose() {
      this.$parent.onClose()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #f0f1f5;
  .top {
    text-align: center;
    font-size: 14px;
    padding: 14px 0;
    cursor: pointer;
  }
}
>>> .el-tabs {
  .el-tabs__item {
    padding: 0 13px;
    font-size: 15px;
  }
}
</style>
