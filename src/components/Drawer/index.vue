<template>
  <el-drawer
    ref="drawer"
    size="61.8%"
    direction="rtl"
    custom-class="drawer"
    :title="title"
    :before-close="handleClose"
    :visible.sync="dialog"
    :wrapper-closable="true"
  >
    <div class="drawer__content">
      <slot name="default" />
    </div>
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
    }
  },
  data() {
    return {
      dialog: true,
      loading: false,
      formLabelWidth: '80px'
    }
  },
  methods: {
    handleClose(done) {
      this.$emit('close-drawer')
      done()
    },
    cancelForm() {
      this.loading = false
      this.dialog = false
    }
  }
}
</script>

<style scoped lang='scss'>
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

    .drawer__content {
      height: 100%;

      .el-form {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        justify-content: flex-start;
        margin: unset !important;
        padding-right: 50px;
        height: 100%;

        .el-form-item {
          margin: 5px 0 5px 0;
        }

        .form-buttons {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          display: flex;
          flex-wrap: nowrap;
          padding: 0 10px 0 10px;

          .el-form-item__content {
            width: 100%;
            display: flex;
            margin: unset !important;
            justify-content: center;

            .el-button {
              width: 50%;
              border-radius: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
