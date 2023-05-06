<template>
  <div>
    <el-radio-group v-model="iValue.type" @input="handleTypeChange">
      <el-radio v-for="tp of types" :key="tp.name" :label="tp.name">
        {{ tp.label }}
      </el-radio>
    </el-radio-group>
    <Select2 v-if="iValue.type === 'ids'" v-model="ids" v-bind="select2" />
    <div v-if="iValue.type === 'attrs'">
      <DataTable :config="tableConfig" class="attr-list" />
      <div class="actions">
        <el-button size="mini" type="primary" @click="handleAttrAdd">
          {{ $t('common.Add') }}
        </el-button>
      </div>
    </div>
    <Dialog v-if="visible" :show-cancel="false" :show-confirm="false" :visible.sync="visible" title="选择属性">
      <DataForm class="attr-form" v-bind="formConfig" @submit="onAttrDialogConfirm" />
    </Dialog>
  </div>
</template>

<script>
import Select2 from '../Select2.vue'
import DataTable from '@/components/DataTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import DataForm from '@/components/DataForm/index.vue'
import ValueField from './ValueField.vue'

export default {
  name: 'JSONManyToManySelect',
  components: { DataTable, Select2, Dialog, DataForm },
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
    }
  },
  data() {
    const attrMatchOptions = [
      { label: '等于', value: 'exact' },
      { label: '不等于', value: 'not' },
      { label: '在...中', value: 'in' },
      { label: '包含', value: 'contains' },
      { label: '开头是', value: 'startswith' },
      { label: '结尾是', value: 'endswith' },
      { label: '正则', value: 'regex' },
      { label: 'IP 匹配', value: 'ip_in' }
    ]
    const attrRelOptions = [
      { label: '与', value: 'and' },
      { label: '或', value: 'or' },
      { label: '非', value: 'not' }
    ]
    const attrNameOptions = this.attrs.map(attr => ({ label: attr.label, value: attr.name }))
    const tableFormatter = (colName) => {
      return (row, col, cellValue) => {
        const value = cellValue
        switch (colName) {
          case 'name':
            return this.attrs.find(attr => attr.name === value)?.label || value
          case 'match':
            return attrMatchOptions.find(opt => opt.value === value).label || value
          case 'rel':
            return attrRelOptions.find(opt => opt.value === value)?.label || value
          case 'value':
            return Array.isArray(value) ? value.join(', ') : value
          default:
            return value
        }
      }
    }
    return {
      iValue: Object.assign({ type: 'all' }, this.value),
      ids: this.value.ids || [],
      types: [
        { name: 'all', label: '全部' + this.resource },
        { name: 'ids', label: '指定' + this.resource },
        { name: 'attrs', label: '属性选择' }
      ],
      tableConfig: {
        columns: [
          { prop: 'name', label: '属性名', formatter: tableFormatter('name') },
          { prop: 'match', label: '匹配', formatter: tableFormatter('match') },
          { prop: 'value', label: '属性值', formatter: tableFormatter('value') },
          { prop: 'rel', label: '关系', formatter: tableFormatter('rel') },
          { prop: 'action', label: '操作', formatter: (row, col, cellValue, index) => {
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
      },
      formConfig: {
        // 为了方便更新，避免去取 fields 的索引
        attrNameOptions: attrNameOptions,
        hasSaveContinue: false,
        editRowIndex: -1,
        form: {},
        fields: [
          {
            id: 'name',
            label: '属性',
            type: 'select',
            options: attrNameOptions
          },
          {
            id: 'match',
            label: '匹配方式',
            type: 'select',
            options: attrMatchOptions,
            on: {
              change: ([value], updateForm) => {
                this.formConfig.fields[2].el.match = value
                if (['in', 'ip_in'].includes(value)) {
                  updateForm({ value: [] })
                } else {
                  updateForm({ value: '' })
                }
              }
            }
          },
          {
            id: 'value',
            label: '值',
            component: ValueField,
            el: {
              match: 'exact'
            }
          },
          {
            id: 'rel',
            label: '关系',
            type: 'radio-group',
            options: attrRelOptions
          }
        ]
      },
      visible: false
    }
  },
  mounted() {
    this.formConfig.form = this.getDefaultAttrForm()
    this.$emit('input', this.iValue)
  },
  methods: {
    onAttrDialogConfirm(form) {
      const allAttrs = this.tableConfig.totalData
      if (this.formConfig.editRowIndex !== -1) {
        allAttrs.splice(this.formConfig.editRowIndex, 1)
        this.formConfig.editRowIndex = -1
      }
      // 因为可能 attr 的 name 会重复，所以需要先删除再添加
      const setIndex = allAttrs.findIndex(attr => attr.name === form.name)
      if (setIndex === -1) {
        allAttrs.push(Object.assign({}, form))
      } else {
        allAttrs.splice(setIndex, 1, Object.assign({}, form))
      }
      form = this.getDefaultAttrForm()
      this.visible = false
    },
    getDefaultAttrForm() {
      const attrKeys = this.attrs.map(attr => attr.name)
      const attrSet = this.tableConfig.totalData.map(attr => attr.name)
      const diff = attrKeys.filter(attr => !attrSet.includes(attr))
      let name = this.attrs[0].name
      if (diff.length > 0) {
        name = diff[0]
      }
      return {
        name: name,
        match: 'exact',
        value: '',
        rel: 'and'
      }
    },
    setAttrNameOptionUsed() {
      const options = this.formConfig.attrNameOptions
      const used = this.tableConfig.totalData.map(attr => attr.name)
      console.log('Used: ', used)
      options.forEach(opt => {
        if (used.includes(opt.value)) {
          opt.disabled = true
        } else {
          delete opt.disabled
        }
      })
      console.log('Options: ', options)
    },
    handleAttrEdit({ row, index }) {
      return () => {
        this.formConfig.editRowIndex = index
        this.formConfig.form = Object.assign({ index }, row)
        this.setAttrNameOptionUsed()
        this.visible = true
      }
    },
    handleAttrDelete({ index }) {
      return () => {
        this.tableConfig.totalData.splice(index, 1)
      }
    },
    handleAttrAdd() {
      this.formConfig.form = this.getDefaultAttrForm()
      this.setAttrNameOptionUsed()
      this.visible = true
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
}
</style>
