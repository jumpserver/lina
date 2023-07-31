<template>
  <div>
    <el-radio-group v-model="iValue.type" @input="handleTypeChange">
      <el-radio v-for="tp of types" :key="tp.name" :label="tp.name">
        {{ tp.label }}
      </el-radio>
    </el-radio-group>
    <Select2 v-if="iValue.type === 'ids'" v-model="ids" v-bind="select2" @change="onChangeEmit" />
    <div v-if="iValue.type === 'attrs'">
      <DataTable :config="tableConfig" class="attr-list" />
      <div class="actions">
        <el-button size="mini" type="primary" @click="handleAttrAdd">
          {{ $t('common.Add') }}
        </el-button>
        <span style="padding-left: 10px; font-size: 13px">
          <span class="help-tips; ">{{ $t('common.MatchedCount') }}:</span>
          <a class="text-link" style="padding: 0 5px;" @click="showAttrMatchTable">{{ attrMatchCount }}</a>
        </span>
      </div>
    </div>

    <AttrFormDialog
      v-if="attrFormVisible"
      :attrs="attrs"
      :attrs-added="attrsAdded"
      :form="attrForm"
      :visible.sync="attrFormVisible"
      @confirm="handleAttrDialogConfirm"
    />
    <AttrMatchResultDialog
      v-if="attrMatchTableVisible"
      :attrs="attrs"
      :url="attrMatchTableUrl"
      :visible.sync="attrMatchTableVisible"
    />
  </div>
</template>

<script>
import Select2 from '../Select2.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import ValueFormatter from './ValueFormatter.vue'
import AttrFormDialog from './AttrFormDialog.vue'
import AttrMatchResultDialog from './AttrMatchResultDialog.vue'
import { setUrlParam } from '@/utils/common'
import { attrMatchOptions } from '@/components/const'
import { toM2MJsonParams } from '@/utils/jms'

export default {
  name: 'JSONManyToManySelect',
  components: { AttrFormDialog, DataTable, Select2, AttrMatchResultDialog },
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          type: 'all'
        }
      }
    },
    select2: {
      type: Object,
      required: true
    },
    attrs: {
      type: Array,
      default: () => ([])
    },
    resource: {
      type: String,
      default: ''
    },
    attrTableColumns: {
      type: Array,
      default: () => (['name'])
    }
  },
  data() {
    const tableFormatter = (colName) => {
      return (row, col, cellValue) => {
        const value = cellValue
        switch (colName) {
          case 'name':
            return this.attrs.find(attr => attr.name === value)?.label || value
          case 'match':
            return attrMatchOptions.find(opt => opt.value === value).label || value
          case 'value':
            return Array.isArray(value) ? value.join(', ') : value
          default:
            return value
        }
      }
    }
    return {
      iValue: Object.assign({ type: 'all' }, this.value),
      attrFormVisible: false,
      attrForm: {},
      attrMatchCount: 0,
      attrMatchTableVisible: false,
      attrMatchTableUrl: '',
      ids: this.value.ids || [],
      editIndex: -1,
      types: [
        { name: 'all', label: this.$t('common.All') + this.resource },
        { name: 'ids', label: this.$t('common.Spec') + this.resource },
        { name: 'attrs', label: this.$t('common.SelectByAttr') }
      ],
      tableConfig: {
        columns: [
          { prop: 'name', label: this.$t('common.AttrName'), formatter: tableFormatter('name') },
          { prop: 'match', label: this.$t('common.Match'), formatter: tableFormatter('match') },
          { prop: 'value', label: this.$t('common.AttrValue'), formatter: ValueFormatter, formatterArgs: { attrs: this.attrs }},
          { prop: 'action', label: this.$t('common.Action'), align: 'center', width: '120px', formatter: (row, col, cellValue, index) => {
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
        totalData: this.value.attrs || [],
        hasPagination: false
      }
    }
  },
  computed: {
    attrsAdded() {
      return this.tableConfig.totalData.map(item => item.name)
    }
  },
  watch: {
    attrFormVisible(val) {
      if (!val) {
        this.getAttrsCount()
      }
    }
  },
  mounted() {
    if (this.value.type === 'attrs') {
      this.getAttrsCount()
    }
    this.$emit('input', this.iValue)
  },
  methods: {
    showAttrMatchTable() {
      const [key, value] = this.getAttrFilterKey()
      this.attrMatchTableUrl = setUrlParam(this.select2.url, key, value)
      this.attrMatchTableVisible = true
    },
    getAttrFilterKey() {
      if (this.tableConfig.totalData.length === 0) return ''
      let attrFilter = { type: 'attrs', attrs: this.tableConfig.totalData }
      attrFilter = toM2MJsonParams(attrFilter)
      return attrFilter
    },
    getAttrsCount() {
      const attrFilter = this.getAttrFilterKey()
      if (!attrFilter) {
        this.attrMatchCount = 0
        return
      }
      const [key, value] = attrFilter
      let url = setUrlParam(this.select2.url, key, value)
      url = setUrlParam(url, 'limit', 1)
      return this.$axios.get(url).then(res => {
        this.attrMatchCount = res.count
      })
    },
    handleAttrEdit({ row, index }) {
      return () => {
        this.attrForm = Object.assign({ index }, row)
        this.editIndex = index
        this.attrFormVisible = true
      }
    },
    handleAttrDelete({ index }) {
      return () => {
        this.tableConfig.totalData.splice(index, 1)
        this.getAttrsCount()
      }
    },
    handleAttrAdd() {
      this.attrForm = {}
      this.editIndex = -1
      this.attrFormVisible = true
    },
    onChangeEmit() {
      const tp = this.iValue.type
      this.handleTypeChange(tp)
    },
    handleTypeChange(val) {
      switch (val) {
        case 'ids':
          this.$emit('input', { type: 'ids', ids: this.ids })
          break
        case 'attrs':
          this.$emit('input', { type: 'attrs', attrs: this.tableConfig.totalData })
          break
        default:
          this.$emit('input', { type: 'all' })
          break
      }
    },
    handleAttrDialogConfirm(form) {
      if (this.editIndex > -1) {
        this.tableConfig.totalData.splice(this.editIndex, 1)
      }
      const allAttrs = this.tableConfig.totalData
      // 因为可能 attr 的 name 会重复，所以需要先删除再添加
      const setIndex = allAttrs.findIndex(attr => attr.name === form.name)
      if (setIndex === -1) {
        allAttrs.push(Object.assign({}, form))
      } else {
        allAttrs.splice(setIndex, 1, Object.assign({}, form))
      }
      this.attrFormVisible = false
      this.onChangeEmit()
    }
  }
}
</script>

<style lang="scss" scoped>
.attr-list {
  width: 99%;
}
</style>
