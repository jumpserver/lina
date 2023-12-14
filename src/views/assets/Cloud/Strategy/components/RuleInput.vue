<template>
  <AttrInput
    :form-config="formConfig"
    :table-config="tableConfig"
    class="attr-input"
    @submit="onSubmit"
  />
</template>

<script>
import { AttrInput, Select2 } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'
import { instanceAttrOptions, tableFormatter } from './const'
import { attrMatchOptions, strMatchValues } from '@/components/const'

export default {
  name: 'RuleInput',
  components: { AttrInput },
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      formConfig: {
        initial: { attr: '', match: '', value: '' },
        inline: true,
        hasSaveContinue: false,
        submitBtnSize: 'mini',
        submitBtnText: this.$t('common.Add'),
        hasReset: false,
        onSubmit: () => {},
        submitMethod: () => 'post',
        getUrl: () => '',
        fields: [['', ['attr', 'match', 'value']]],
        fieldsMeta: {
          attr: {
            label: '',
            component: Select2,
            rules: [Required],
            el: {
              value: [],
              multiple: false,
              clearable: false,
              options: instanceAttrOptions
            }
          },
          match: {
            label: '',
            component: Select2,
            rules: [Required],
            el: {
              value: [],
              multiple: false,
              clearable: false,
              options: attrMatchOptions.filter((option) => {
                const matchValues = strMatchValues.concat('exclude')
                if (matchValues.indexOf(option.value) !== -1 && option.value !== 'in') {
                  return option
                }
              })
            }
          },
          value: {
            component: 'el-input',
            rules: [Required]
          }
        }
      },
      tableConfig: {
        columns: [
          { prop: 'attr', label: this.$t('common.AttrName'), formatter: tableFormatter('attr') },
          { prop: 'match', label: this.$t('common.Match'), formatter: tableFormatter('match') },
          { prop: 'value', label: this.$t('common.AttrValue'), formatter: tableFormatter('value') },
          { prop: 'action', label: this.$t('common.Action'), align: 'center', width: '100px', formatter: (row, col, cellValue, index) => {
            return (
              <div className='input-button'>
                <el-button
                  icon='el-icon-minus'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='danger'
                  onClick={ this.handleDelete(index) }
                />
              </div>
            )
          } }
        ],
        totalData: this.value || [],
        hasPagination: false
      }
    }
  },
  methods: {
    onSubmit() {
      this.$emit('input', this.tableConfig.totalData)
    },
    handleDelete(index) {
      return () => {
        const item = this.tableConfig.totalData.splice(index, 1)
        if (item[0]?.id) {
          this.$axios.delete(`/api/v1/xpack/cloud/strategy-rules/${item[0].id}/`)
        }
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-form-item:nth-child(-n+4) {
  width: 29%;
}
>>> .el-form-item:last-child {
  width: 6%;
}
</style>

