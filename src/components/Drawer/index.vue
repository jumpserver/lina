<template>
  <el-drawer
    v-bind="$attrs"
    ref="drawer"
    :model-value="visible"
    :append-to-body="true"
    :before-close="handleClose"
    :class="['drawer', { 'drawer__no-footer': !hasFooter }]"
    :modal="modal"
    :resizable="resizable"
    :size="drawerSize"
    :title="title"
    custom-class="drawer"
    destroy-on-close
    direction="rtl"
    @resize-end="handleResizeEnd"
    @update:model-value="handleUpdateModelValue"
  >
    <div class="drawer__content">
      <slot name="default">
        <component
          v-bind="componentProps"
          :is="resolvedComponent"
          v-if="resolvedComponent"
          ref="dynamicComponent"
          v-on="componentListeners"
        />
      </slot>
    </div>
    <div v-if="hasFooter" ref="drawerFooter" class="drawer__footer" />
  </el-drawer>
</template>

<script>
import { getStoredDrawerWidth, useDrawerResize } from '@/composables/useDrawerResize'
import { resolveAsyncComponentCompat } from '@/utils/vue'

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    size: {
      type: [String, Number],
      default: () => {
        return getStoredDrawerWidth()
      }
    },
    resizable: {
      type: Boolean,
      default: true
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
      drawerSize: this.size,
      drawerResize: useDrawerResize(),
      loading: false,
      formLabelWidth: '80px'
    }
  },
  computed: {
    resolvedComponent() {
      if (!this.component) return null
      return resolveAsyncComponentCompat(this.component)
    }
  },
  watch: {
    size(val) {
      this.drawerSize = val
    }
  },
  methods: {
    handleUpdateModelValue(val) {
      this.$emit('update:visible', val)
    },
    handleResizeEnd(_event, size) {
      this.drawerSize = this.drawerResize.persistDrawerWidth(size)
    },
    handleClose(done) {
      this.$emit('close-drawer')
      done()
    }
  }
}
</script>

<style lang="scss">
.el-drawer.drawer.ltr,
.el-drawer.drawer.rtl {
  min-width: max(100px, 20vw);
  max-width: min(2000px, 80vw);
}
</style>

<style lang="scss" scoped>
.drawer__no-footer {
  :deep(.drawer) {
    .page {
      height: calc(100vh - 55px);
    }
  }
}

@media (max-width: 992px) {
  .drawer :deep(.el-form-item) {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
}

.drawer {
  .drawer__content {
    height: 100%;
    background: rgb(243, 243, 243);
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
  }

  :deep(.el-drawer__header) {
    min-height: 56px;
    margin-bottom: 0 !important;
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  :deep(.el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }

  :deep(.page.tab-page) {
    height: auto;
    min-height: calc(100vh - 110px);
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  :deep(.page.tab-page .page-content) {
    padding: 0 !important;
    overflow: visible !important;
  }

  :deep(.page.tab-page .tab-page-wrapper) {
    height: auto;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  :deep(.page.tab-page .page-submenu) {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    background: #fff;
  }

  :deep(.page.tab-page .page-submenu .el-tabs__header) {
    display: flex;
    align-items: stretch;
    min-height: 40px;
    margin: 0;
    padding: 0 30px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.page.tab-page .page-submenu .el-tabs__nav-wrap),
  :deep(.page.tab-page .page-submenu .el-tabs__nav-scroll),
  :deep(.page.tab-page .page-submenu .el-tabs__nav) {
    display: flex;
    align-items: stretch;
  }

  :deep(.page.tab-page .page-submenu .el-tabs__nav-wrap) {
    position: static;
    flex: 1 1 auto;
    margin: 0;

    &::after {
      display: none;
    }
  }

  :deep(.page.tab-page .page-submenu .el-tabs__active-bar) {
    height: 2px;
  }

  :deep(.page.tab-page .page-submenu .el-tabs__item),
  :deep(.page.tab-page .page-submenu .el-tabs__item.is-top) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    line-height: 40px;
    padding: 0 18px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  :deep(.page.tab-page .tab-page-content) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding: 10px 30px 22px;
    box-sizing: border-box;
    overflow: visible;
    background: #f3f3f3;
  }

  :deep(.page.tab-page .tab-page-content .el-form),
  :deep(.page.tab-page .tab-page-content .form-fields),
  :deep(.page.tab-page .tab-page-content .el-card__body),
  :deep(.page.tab-page .tab-page-content .ibox),
  :deep(.page.tab-page .tab-page-content .page-content) {
    overflow: visible !important;
    max-height: none !important;
  }

  :deep(.page.tab-page .tab-page-content .tab-page-alert) {
    margin: 0;
  }

  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__icon),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__icon .el-icon),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__icon .el-icon svg) {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__title),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__description),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__content),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__description p),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__content p),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__content span),
  :deep(.page.tab-page .tab-page-content .tab-page-alert .announcement-main) {
    font-size: 12px !important;
    line-height: 1.5;
  }

  :deep(.page.tab-page .tab-page-content .tab-page-alert .el-alert__closebtn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  :deep(.el-form-item) {
    min-width: 565px;

    .el-card__body {
      padding-top: 10px;
      padding-bottom: 20px;
    }

    .form-buttons {
      margin-left: 13px;
    }

    .el-form {
      margin-right: 1px;
      padding-right: 15px;
      height: 100%;

      &.detail-card {
        padding-right: 0;
        margin-top: unset;
      }

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

    .sql.container {
      display: none;
    }

    .page {
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

    .drawer__content,
    .tab-page-content {
      height: 100%;
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
