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
    <Dialog v-if="visible" :show-buttons="false" :visible.sync="visible" title="选择属性">
      <DataForm class="attr-form" v-bind="formConfig" @submit="onAttrDialogConfirm" />
    </Dialog>
  </div>
</template>

<script>
import Select2 from '../Select2.vue'
import DataTable from '@/components/DataTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import DataForm from '@/components/DataForm/index.vue'
import ValueFormatter from './ValueFormatter.vue'
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
      { label: this.$t('common.Equal'), value: 'exact' },
      { label: this.$t('common.NotEqual'), value: 'not' },
      { label: this.$t('common.MatchIn'), value: 'in' },
      { label: this.$t('common.Contains'), value: 'contains' },
      { label: this.$t('common.Startswith'), value: 'startswith' },
      { label: this.$t('common.Endswith'), value: 'endswith' },
      { label: this.$t('common.Regex'), value: 'regex' },
      { label: this.$t('common.BelongTo'), value: 'm2m' },
      { label: this.$t('common.IPMatch'), value: 'ip_in' },
      { label: this.$t('common.GreatEqualThan'), value: 'gte' },
      { label: this.$t('common.LessEqualThan'), value: 'lte' }
    ]

    const strMatchValues = ['exact', 'not', 'in', 'contains', 'startswith', 'endswith', 'regex']
    const typeMatchMapper = {
      str: strMatchValues,
      bool: ['exact', 'not'],
      m2m: ['m2m'],
      ip: strMatchValues + ['ip_in'],
      int: strMatchValues + ['gte', 'lte'],
      select: ['in']
    }
    attrMatchOptions.forEach((option) => {
      option.hidden = !typeMatchMapper[this.attrs[0].type || 'str'].includes(option.value)
    })
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
      ids: this.value.ids || [],
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
          { prop: 'action', label: this.$t('common.Action'), formatter: (row, col, cellValue, index) => {
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
        hasSaveContinue: false,
        editRowIndex: -1,
        form: {},
        fields: [
          {
            id: 'name',
            label: this.$t('common.AttrName'),
            type: 'select',
            options: this.attrs.map(attr => ({ label: attr.label, value: attr.name })),
            on: {
              change: ([val], updateForm) => {
                const attr = this.attrs.find(attr => attr.name === val)
                if (!attr) return
                this.formConfig.fields[2].el.attr = attr
                const attrType = attr.type || 'str'
                const matchSupports = typeMatchMapper[attrType]
                attrMatchOptions.forEach((option) => {
                  option.hidden = !matchSupports.includes(option.value)
                })
                setTimeout(() => updateForm({ match: matchSupports[0] }), 0.1)
              }
            }
          },
          {
            id: 'match',
            label: this.$t('common.Match'),
            type: 'select',
            options: attrMatchOptions,
            on: {
              change: ([value], updateForm) => {
                this.formConfig.fields[2].el.match = value
              }
            }
          },
          {
            id: 'value',
            label: this.$t('common.AttrValue'),
            component: ValueField,
            el: {
              match: attrMatchOptions[0].value,
              attr: this.attrs[0]
            }
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
      const options = this.formConfig.fields[0].options
      const used = this.tableConfig.totalData.map(attr => attr.name)
      options.forEach(opt => {
        if (used.includes(opt.value)) {
          opt.disabled = true
        } else {
          delete opt.disabled
        }
      })
    },
    handleAttrEdit({ row, index }) {
      return () => {
        this.formConfig.editRowIndex = index
        this.formConfig.fields[2].el.attr = this.attrs.find(attr => attr.name === row.name)
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
      this.formConfig.fields[2].el.attr = this.attrs.find(attr => attr.name === this.formConfig.form.name)
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
