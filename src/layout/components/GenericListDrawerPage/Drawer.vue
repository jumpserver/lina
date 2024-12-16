<template>
  <el-drawer
    :size="drawerSize"
    :title="title"
    :visible.sync="iVisible"
    append-to-body
    class="form-drawer"
    destroy-on-close
  >
    <component
      :is="component"
      v-bind="props"
      @close="closeDrawer"
      v-on="$listeners"
      @close-drawer="iVisible=false"
    />
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
    },
    action: {
      type: String,
      default: ''
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
    },
    drawerSize() {
      const width = window.innerWidth
      if (width >= 768) return '800px'
      return '90%'
    }
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
    .el-card.ibox {
      //border: none;
    }

    .el-drawer__header {
      //border-bottom: 1px solid #EBEEF5;
      margin-bottom: 10px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
  }
}
</style>
