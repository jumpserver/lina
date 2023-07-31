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
      default: (val) => { return true }
    }
  },
  data() {
    return {}
  },
  methods: {
    onSubmit(value) {
      if (this.beforeSubmit(value)) {
        const clonedValue = JSON.parse(JSON.stringify(value))
        this.tableConfig.totalData.push(clonedValue)
        this.$emit('submit', this.tableConfig.totalData)
      }
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

