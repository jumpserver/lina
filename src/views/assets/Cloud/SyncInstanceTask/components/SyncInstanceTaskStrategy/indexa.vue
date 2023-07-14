<template>
  <div>
    <DataTable :config="tableConfig" class="attr-list" />
    <AttrDialog
      v-if="visible"
      :value="attrValue"
      :visible.sync="visible"
      :table-config="tableConfig"
      @confirm="onAttrDialogConfirm"
    />
    <el-button type="primary" size="mini" @click="handleCreate">{{ this.$t('common.New') }}</el-button>
  </div>
</template>

<script>
import DataTable from '@/components/DataTable/index.vue'
import AttrDialog from './AttrDialog.vue'

export default {
  name: 'SyncInstanceTaskStrategy',
  components: { DataTable, AttrDialog },
  props: {
    totalData: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      attrValue: { name: '', rules: [], actions: [] },
      visible: false,
      tableConfig: {
        columns: [
          { prop: 'name', label: this.$t('common.PolicyName') },
          { prop: 'action', label: this.$t('common.Action'), align: 'center', width: '100px', formatter: (row, col, cellValue, index) => {
            return (
              <div className='input-button'>
                <el-button
                  icon='el-icon-edit'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='primary'
                  onClick={this.handleAttrEdit({ row, col, cellValue, index })}
                />
                <el-button
                  icon='el-icon-minus'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='danger'
                  onClick={this.handleAttrDelete({ row, col, cellValue, index })}
                />
              </div>
            )
          } }
        ],
        totalData: this.value,
        hasPagination: false
      }
    }
  },
  methods: {
    handleCreate() {
      this.attrValue = { name: '', rules: [], actions: [] }
      this.visible = true
    },
    onAttrDialogConfirm() {
      this.$emit('input', this.tableConfig.totalData)
    },
    handleAttrEdit({ row, index }) {
      return () => {
        this.$axios.get(`/api/v1/xpack/cloud/rules-actions/${row?.id}/`).then((data) => {
          this.attrValue = data
          this.visible = true
        })
      }
    },
    handleAttrDelete({ index }) {
      return () => {
        const item = this.tableConfig.totalData.splice(index, 1)
        this.$axios.delete(`/api/v1/xpack/cloud/rules-actions/${item[0]?.id}/`).then(() => {
          this.$message.success(this.$tc('common.deleteSuccessMsg'))
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.attr-list {
  width: 99%;
}
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
