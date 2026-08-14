<template>
  <div style="display: block">
    <el-button size="small" type="primary" @click="visible = true">
      {{ $t('Setting') }}
    </el-button>
    <Dialog
      v-model:visible="iVisible"
      :destroy-on-close="true"
      :title="$tc('PasswordRule')"
      class="account-push-password-rule-dialog"
      width="520px"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      @open="handleOpen"
    >
      <AutoDataForm v-bind="form" ref="dataform" label-position="right" label-width="96px" />
    </Dialog>
  </div>
</template>

<script>
import PasswordRule from '@/components/Form/FormFields/PasswordRule.vue'

export default {
  name: 'AccountPushPasswordRule',
  extends: PasswordRule
}
</script>

<style lang="scss">
.account-push-password-rule-dialog {
  .el-dialog__body {
    padding: 24px;
  }

  .form-fields.el-form.dialog-mode {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 24px;
    margin-right: 0;

    .el-form-item {
      flex-direction: row;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .el-form-item .el-form-item__label-wrap {
      flex: 0 0 var(--label-width) !important;
      width: var(--label-width) !important;
    }

    .el-form-item > .el-form-item__label {
      flex: 0 0 var(--label-width);
      width: var(--label-width) !important;
    }

    .el-form-item .el-form-item__label-wrap .el-form-item__label {
      width: 100% !important;
    }

    .el-form-item .el-form-item__label {
      justify-content: flex-end;
      text-align: right;
    }

    .el-form-item .el-form-item__content {
      flex: 1 1 auto;
      width: auto;
      min-width: 0;
    }

    .el-form-item:first-child,
    .el-form-item:last-child {
      grid-column: 1 / -1;
    }
  }
}

@media (max-width: 600px) {
  .account-push-password-rule-dialog {
    .el-dialog__body {
      padding: 20px;
    }

    .form-fields.el-form.dialog-mode {
      grid-template-columns: minmax(0, 1fr);

      .el-form-item:first-child,
      .el-form-item:last-child {
        grid-column: auto;
      }
    }
  }
}
</style>
