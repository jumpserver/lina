<template>
  <div>
    <Select2 v-bind="select2" @change="handleInput" />
    <DataTable :config="tableConfig" />
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
import Select2 from '@/components/FormFields/Select2.vue'
import { tableFormatter } from '@/views/assets/Cloud/Strategy/components/const'
import AttrDialog from './AttrDialog.vue'

export default {
  name: 'SyncInstanceTaskStrategy',
  components: { DataTable, AttrDialog, Select2 },
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
      attrValue: { name: '', task_rules: [], task_actions: [] },
      strategy: {},
      visible: false,
      tableConfig: {
        columns: [
          { prop: 'name', label: this.$t('common.PolicyName') },
          { prop: 'task_rules', label: this.$t('common.RuleCount'), formatter: tableFormatter('count') },
          { prop: 'task_actions', label: this.$t('common.ActionCount'), formatter: tableFormatter('count') },
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
                  onClick={(index) => this.tableConfig.totalData.splice(index, 1)}
                />
              </div>
            )
          } }
        ],
        totalData: this.value,
        hasPagination: false
      },
      select2: {
        url: '/api/v1/xpack/cloud/strategies/',
        multiple: false,
        ajax: {
          transformOption: (item) => {
            this.strategy[item.id] = {
              name: item.name, task_rules: item.task_rules, task_actions: item.task_actions
            }
            return { label: item.name, value: item.id }
          }
        }
      }
    }
  },
  methods: {
    handleInput(value) {
      let status = true
      const totalData = this.tableConfig.totalData
      const data = this.strategy[value]
      for (let i = 0; i < totalData.length; i++) {
        if (totalData[i].id === value) {
          status = false
          this.$message.error(`${this.$tc('xpack.Cloud.ExistError')}`)
          break
        }
      }
      if (status) {
        data['id'] = value
        this.tableConfig.totalData.push(data)
        console.log('hello: ', this.tableConfig.totalData)
      }
    },
    handleCreate() {
      this.attrValue = { name: '', task_rules: [], task_actions: [] }
      this.visible = true
    },
    onAttrDialogConfirm() {
      this.$emit('input', this.tableConfig.totalData)
    },
    handleAttrEdit({ row, index }) {
      return () => {
        this.$axios.get(`/api/v1/xpack/cloud/strategies/${row?.id}/`).then((data) => {
          this.attrValue = data
          this.visible = true
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
