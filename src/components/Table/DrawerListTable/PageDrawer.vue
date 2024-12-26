<template>
  <Drawer
    :component="component"
    :component-listeners="listener"
    :size="drawerSize"
    :title="title"
    :visible.sync="iVisible"
    append-to-body
    class="form-drawer"
    destroy-on-close
    v-bind="props"
    @close="closeDrawer"
    v-on="$listeners"
  />
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'

export default {
  components: { Drawer },
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
  data() {
    return {
      listener: {
        ...this.$listeners
      }
    }
  },
  computed: {
    drawerSize() {
      const width = window.innerWidth
      if (width >= 800) return '767px'
      return '90%'
    },
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
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
      .el-card__body {
        padding-top: 10px;
        padding-bottom: 20px;
      }

      .el-form {
        margin-right: 10px;
      }
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
