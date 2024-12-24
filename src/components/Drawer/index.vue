<template>
  <el-drawer
    ref="drawer"
    v-el-drawer-drag-width
    :append-to-body="true"
    :before-close="handleClose"
    :size="size"
    :title="title"
    :visible.sync="iVisible"
    custom-class="drawer"
    destroy-on-close
    direction="rtl"
    v-on="$listeners"
  >
    <div class="drawer__content">
      <slot name="default">
        <component :is="component" v-if="component" v-bind="componentProps" v-on="componentListeners" />
      </slot>
    </div>
    <div slot="drawer-footer" class="drawer__footer" />
  </el-drawer>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: function() {
        return this.$t('AddAccount')
      }
    },
    size: {
      type: String,
      default: '768px'
    },
    component: {
      type: [String, Function],
      default: ''
    },
    componentProps: {
      type: Object,
      default: () => ({})
    },
    componentListeners: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formLabelWidth: '80px'
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
  methods: {
    handleClose(done) {
      this.$emit('close-drawer')
      done()
    }
  }
}
</script>

<style lang='scss' scoped>
::v-deep .drawer {
  min-width: 565px;

  .el-drawer__header {
    margin-bottom: 20px;

    span {
      font-size: 16px;
      font-weight: 800;
      color: var(--color-text-primary);
    }
  }

  .el-drawer__body {
    overflow: auto;

    .drawer__content {
      .el-form {
        //position: relative;
        //display: flex;
        //flex-wrap: nowrap;
        //flex-direction: column;
        //justify-content: flex-start;
        //margin-left: 20px;
        height: 100%;
        //margin-right: 10px;

        .el-form-item {
          //margin: 5px 0 5px 0;
          padding-left: 2px;

          &:last-child {
            //margin-bottom: 10px;
            //padding-bottom: 10px;
          }
        }
      }
    }
  }
}
</style>
