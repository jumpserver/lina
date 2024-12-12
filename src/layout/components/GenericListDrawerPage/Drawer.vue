<template>
  <el-drawer
    :title="title"
    :visible.sync="iVisible"
    class="form-drawer"
    size="800px"
  >
    <component :is="component" v-bind="props" @close="closeDrawer" />
  </el-drawer>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    component: {
      type: [String, Function],
      required: true
    },
    props: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  mounted() {
    console.log('Mounted: ',)
  },
  methods: {
    closeDrawer() {
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.form-drawer {
  /* 可自定义样式 */

  ::v-deep {
    .el-drawer__header {
      margin-bottom: 10px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
  }
}
</style>
