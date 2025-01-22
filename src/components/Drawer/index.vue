<template>
  <el-drawer
    ref="drawer"
    v-el-drawer-drag-width
    :append-to-body="true"
    :before-close="handleClose"
    :class="['drawer', { 'drawer__no-footer': !hasFooter }]"
    :modal="modal"
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
        <component
          :is="component"
          v-if="component"
          ref="dynamicComponent"
          v-bind="componentProps"
          v-on="componentListeners"
        />
      </slot>
    </div>
    <div v-if="hasFooter" ref="drawerFooter" class="drawer__footer" />
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
    },
    modal: {
      type: Boolean,
      default: true
    },
    hasFooter: {
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
  mounted() {
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
.drawer__no-footer {
  ::v-deep {
    .drawer {
      .page {
        height: calc(100vh - 55px);
      }
    }
  }
}

.drawer {
  ::v-deep {
    min-width: 565px;

    .el-card__body {
      padding-top: 10px;
      padding-bottom: 20px;
    }

    .page-submenu {
      .el-tabs__item.is-top {
        padding: 0 10px;
      }
    }

    .form-buttons {
      margin-left: 13px;
    }

    .el-form {
      margin-right: 1px;
      padding-right: 15px;
      height: 100%;

      // Detail 中
      &.content {
        margin-right: 0;
      }

      .form-buttons {
        //position: absolute;
        // bottom: 13px;
        // margin-left: 20%;
        // margin-top: 0;
      }

      // Form 中的子 form
      .el-form {
        margin-left: 0;
        margin-top: 0;
        margin-bottom: 0;
      }

      .el-form-item {
        .el-form-item__label {
          padding-right: 20px;
        }

        .el-radio {
          line-height: 25px;
          margin-right: 13px;

          .el-radio__label {
            padding-left: 5px;
          }
        }
      }

      &.el-form--label-top {
        .el-radio-group {
          .el-radio {
            display: block;
            padding-bottom: 3px;
          }
        }

        .el-form-item {
          padding-left: 12px;

          .el-form-item__label {
            padding: 0 20px 0 0;
            line-height: 30px;
          }

          .sub-form {
            margin-left: -1px;

            .form-fields {
              max-height: unset;
            }
          }
        }

        &.form-fields {
          //overflow: auto;
          //max-height: calc(100vh - 180px);
        }

        .el-checkbox-group {
          .el-checkbox {
            display: block;
            padding-bottom: 3px;
          }
        }

        .el-form-item__content:has(.el-checkbox):not(:has(.el-checkbox-group)) {
          display: inline-block; /* 更改为 inline-block */
          //width: unset; /* 这个设置上去后，平台详情中， Automations 会有问题 */
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
        margin-left: 20px;
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

      height: calc(100vh - 110px);

      &.tab-page {
        .page-content {
          padding-right: 0;
          padding-left: 0;
        }
      }

      .page-content {
        height: unset;
        padding-right: 10px;
        padding-left: 20px;

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

    .drawer__footer {
      border-top: solid 1px #f3f3f3;
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
  }
}
</style>
