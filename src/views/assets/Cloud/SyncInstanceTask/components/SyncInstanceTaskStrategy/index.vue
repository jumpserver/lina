<template>
  <div>
    <Select2 v-bind="select2" @change="handleInput" />
    <DataTable :config="tableConfig" />
    <AttrDialog
      v-if="visible"
      :table-config="tableConfig"
      :value="attrValue"
      :visible.sync="visible"
      @confirm="onAttrDialogConfirm"
    />
    <el-button size="mini" type="primary" @click="handleCreate">
      {{ this.$t('common.New') }}
    </el-button>
  </div>
</template>

<script>
import DataTable from '@/components/Table/DataTable/index.vue'
import Select2 from '@/components/Form/FormFields/Select2.vue'
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
      attrValue: { name: '', priority: 50, strategy_rules: [], strategy_actions: [] },
      strategy: {},
      visible: false,
      tableConfig: {
        columns: [
          { prop: 'name', label: this.$t('common.PolicyName') },
          { prop: 'priority', label: this.$t('acl.priority') },
          { prop: 'strategy_rules', label: this.$t('common.RuleCount'), formatter: tableFormatter('count') },
          { prop: 'strategy_actions', label: this.$t('common.ActionCount'), formatter: tableFormatter('count') },
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
      },
      select2: {
        url: '/api/v1/xpack/cloud/strategies/',
        multiple: false,
        ajax: {
          transformOption: (item) => {
            this.strategy[item.id] = {
              name: item.name,
              priority: item.priority,
              strategy_rules: item.strategy_rules,
              strategy_actions: item.strategy_actions
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
        this.$emit('change', this.tableConfig.totalData)
      }
    },
    handleCreate() {
      this.attrValue = { name: '', priority: 50, strategy_rules: [], strategy_actions: [] }
      this.visible = true
    },
    onAttrDialogConfirm() {
      this.$emit('input', this.tableConfig.totalData)
    },
    handleAttrDelete({ index }) {
      return () => {
        this.tableConfig.totalData.splice(index, 1)
      }
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
