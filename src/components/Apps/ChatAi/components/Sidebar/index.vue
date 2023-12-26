<template>
  <div class="container">
    <div class="close-sidebar">
      <i v-if="hasClose" class="el-icon-close" @click="onClose" />
    </div>
    <el-tabs v-model="active" :tab-position="'right'" @tab-click="handleClick">
      <el-tab-pane v-for="(item) in submenu" :key="item.name" :name="item.name">
        <span slot="label">
          <el-tooltip effect="dark" placement="left" :content="item.label">
            <svg-icon :icon-class="item.icon" />
          </el-tooltip>
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
    hasClose: {
      type: Boolean,
      default: true
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
  .close-sidebar {
    height: 48px;
    padding: 12px 0;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
    i {
      font-size: 16px;
      font-weight: 600;
      padding: 4px;
      border-radius: 2px;
      &:hover {
        color: var(--color-primary);
        background: var(--menu-hover);
      }
    }
  }
}
>>> .el-tabs {
  .el-tabs__item {
    padding: 0 13px;
    font-size: 15px;
    :hover {
      color: #7b8085;
    }
  }
}
</style>
