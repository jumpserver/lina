<template>
  <div>
    <GenericCreateUpdateForm
      class="attr-form"
      v-bind="formConfig"
      @submit="onSubmit"
    />
    <DataTable :config="tableConfig" class="attr-list" />
  </div>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import DataTable from '@/components/DataTable/index.vue'

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
    }
  },
  data() {
    return {}
  },
  methods: {
    onSubmit(form) {
      const clonedForm = JSON.parse(JSON.stringify(form))
      this.tableConfig.totalData.push(clonedForm)
      this.$emit('input', this.tableConfig.totalData)
    }
  }
}
</script>

<style lang="scss" scoped>

.attr-form {
  >>> .el-select {
    width: 100%;
  }
  >>> .el-form-item__content {
    width: 100%;
  }
  >>> .form-buttons {
    margin: auto;
  }
}
</style>

