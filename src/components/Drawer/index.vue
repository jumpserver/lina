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
      type: [String, Function, Object],
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

  .el-card__body {
    padding-top: 10px;
    padding-bottom: 20px;
  }

  .el-form {
    margin-right: 30px;
    height: 100%;

    // Detail 中
    &.content {
      margin-right: 0;
    }

    &.el-form--label-top {
      .el-radio-group {
        .el-radio {
          display: block;
          padding-bottom: 3px;
        }
      }

      .el-checkbox-group {
        .el-checkbox {
          display: block;
          padding-bottom: 3px;
        }
      }

      .el-form-item__content:has(.el-checkbox):not(:has(.el-checkbox-group)) {
        display: inline-block; /* 更改为 inline-block */
        width: unset;
        vertical-align: bottom;
      }

      .el-form-item__content {
        form {
          .el-form-item {
            padding-left: 0;
          }
        }
      }
    }

    .form-group-header {
      margin-left: 10px;
    }

    .el-form-item {
      //padding-left: 2px;
      padding-left: 12px;

      // Top 上面时
      &.label-top {
        .el-form-item__label {
          padding: 0 30px 0 0;
          line-height: 30px;
        }

        .sub-form {
          margin-left: -12px;
        }

      }
    }
  }

  .el-drawer__header {
    border-bottom: 1px solid #EBEEF5;
    margin-bottom: 0;
    padding: 15px 20px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .sql.container {
    display: none;
  }

  .page {
    overflow-y: auto;

    &.tab-page {
      .page-content {
        padding-right: 0;
      }
    }

    .page-content {
      height: unset;
      padding-right: 20px;

      & > div {
        margin-bottom: 1px;
      }
    }

    .ibox {
      margin-bottom: 10px;
      border: none;
    }
  }

  .drawer__content, .tab-page-content {
    background: #f3f3f3;
  }

  //.el-drawer__header {
  //  margin-bottom: 20px;
  //
  //  span {
  //    font-size: 16px;
  //    font-weight: 800;
  //    color: var(--color-text-primary);
  //  }
  //}

  .el-drawer__body {
    overflow: auto;
  }
}
</style>
