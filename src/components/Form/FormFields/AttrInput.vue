<template>
  <div class="attr-input">
    <GenericCreateUpdateForm ref="formRef" v-bind="mergedFormConfig" class="attr-input__form" />
    <div class="attr-input__actions">
      <el-button size="small" type="primary" @click="submitForm">
        {{ submitBtnText }}
      </el-button>
    </div>
    <DataTable :config="tableConfig" class="attr-list" />
  </div>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import DataTable from '@/components/Table/DataTable/index.vue'

export default {
  name: 'AttrInput',
  components: { DataTable, GenericCreateUpdateForm },
  props: {
    formConfig: {
      type: Object,
      default: () => ({})
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    beforeSubmit: {
      type: Function,
      default: (val) => {
        return true
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    mergedFormConfig() {
      return {
        ...this.formConfig,
        hasButtons: false,
        labelWidth: '0px',
        onSubmit: this.handleSubmit
      }
    },
    submitBtnText() {
      return this.formConfig?.submitBtnText || this.$t('Add')
    }
  },
  methods: {
    handleSubmit(value) {
      if (this.beforeSubmit(value)) {
        const clonedValue = JSON.parse(JSON.stringify(value))
        this.tableConfig.totalData.push(clonedValue)
        this.$emit('submit', this.tableConfig.totalData)
      }
    },
    submitForm() {
      this.$refs?.formRef?.$refs?.form?.$refs?.dataForm?.submitForm('form')
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-select) {
  width: 100%;
}

:deep(.attr-input__form .form-fields.el-form) {
  --label-width: 0px;
}

:deep(.attr-input__form .form-fields .el-form-item) {
  gap: 0 !important;
}

:deep(.attr-input__form .form-fields .el-form-item__label-wrap) {
  display: none !important;
  width: 0 !important;
  flex: 0 0 0 !important;
}

:deep(.attr-input__form .form-group-header) {
  display: none !important;
}

:deep(.el-form-item__content) {
  width: 100% !important;
  flex: 1 1 auto !important;
}

.attr-input {
  &__actions {
    margin-top: 8px;
  }

  :deep(.attr-input__actions .el-button) {
    padding: 12px 15px;
    border-color: var(--color-border);
  }
}
</style>
