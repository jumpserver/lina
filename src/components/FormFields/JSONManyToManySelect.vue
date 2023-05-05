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
        <el-button size="mini" type="primary" @click="visible=true">
          {{ $t('common.Add') }}
        </el-button>
      </div>
    </div>
    <Dialog :show-cancel="false" :show-confirm="false" :visible.sync="visible" title="选择属性">
      <DataForm class="attr-form" v-bind="formConfig" @submit="onConfirm" />
    </Dialog>
  </div>
</template>

<script>
import Select2 from './Select2.vue'
import DataTable from '@/components/DataTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import DataForm from '@/components/DataForm/index.vue'

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
      default: () => {
        return []
      }
    }
  },
  data() {
    const matchOptions = [
      { label: '等于', value: 'exact' },
      { label: '不等于', value: 'not' },
      { label: '在...中', value: 'in' },
      { label: '包含', value: 'contains' },
      { label: '开头是', value: 'startswith' },
      { label: '结尾是', value: 'endswith' },
      { label: '正则', value: 'regex' },
      { label: 'IP 匹配', value: 'ip_in' }
    ]
    const relOptions = [
      { label: '与', value: 'and' },
      { label: '或', value: 'or' },
      { label: '非', value: 'not' }
    ]
    const tableFormatter = (colName) => {
      return (row, col, cellValue) => {
        console.log('colName: ', colName, 'row: ', row, 'cellValue: ', cellValue)
        const value = cellValue
        switch (colName) {
          case 'name':
            return this.attrs.find(attr => attr.name === value)?.label || value
          case 'match':
            return matchOptions.find(opt => opt.value === value).label || value
          case 'rel':
            return relOptions.find(opt => opt.value === value)?.label || value
          default:
            return value
        }
      }
    }
    return {
      iValue: Object.assign({ type: 'all' }, this.value),
      ids: [],
      types: [
        { name: 'all', label: '全部' },
        { name: 'ids', label: '指定' },
        { name: 'attrs', label: '属性选择' }
      ],
      tableConfig: {
        columns: [
          { prop: 'name', label: '属性名', formatter: tableFormatter('name') },
          { prop: 'match', label: '匹配', formatter: tableFormatter('match') },
          { prop: 'value', label: '属性值', formatter: tableFormatter('value') },
          { prop: 'rel', label: '关系', formatter: tableFormatter('rel') },
          { prop: 'action', label: '操作', formatter: (row, col, cellValue, index) => {
            console.log('row: ', row, 'col: ', col, 'cellValue: ', cellValue, 'index: ', index)
            return (
              <div className='input-button'>
                <el-button
                  icon='el-icon-minus'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='danger'
                  onClick={this.handleDelete({ row, col, cellValue, index })}
                />
                <el-button
                  icon='el-icon-edit'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='primary'
                  onClick={this.handleEdit({ row, col, cellValue, index })}
                />
              </div>
            )
          } }
        ],
        totalData: [{
          match: 'exact',
          name: 'name',
          rel: 'and',
          value: 'test'
        }],
        hasPagination: false
      },
      formConfig: {
        hasSaveContinue: false,
        hasReset: false,
        form: {
          name: this.attrs[0].name,
          match: 'exact',
          value: '',
          rel: 'and'
        },
        fields: [
          {
            id: 'name',
            label: '属性',
            type: 'select',
            options: this.attrs.map(attr => {
              return {
                label: attr.label,
                value: attr.name
              }
            })
          },
          {
            id: 'match',
            label: '匹配方式',
            type: 'select',
            options: matchOptions
          },
          {
            id: 'value',
            label: '值',
            type: 'input'
          },
          {
            id: 'rel',
            label: '关系',
            type: 'radio-group',
            options: relOptions
          }
        ]
      },
      visible: false
    }
  },
  mounted() {
    this.formConfig.form = this.getDefaultAttrForm()
  },
  methods: {
    onConfirm(form) {
      console.log('this.formConfig.form: ', form)
      this.tableConfig.totalData.push(Object.assign({}, form))
      this.visible = false
    },
    getDefaultAttrForm() {
      return {
        name: this.attrs[0].name,
        match: 'exact',
        value: '',
        rel: 'and'
      }
    },
    handleEdit() {
      return () => {

      }
    },
    handleDelete({ index }) {
      return () => {
        this.tableConfig.totalData.splice(index, 1)
      }
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
