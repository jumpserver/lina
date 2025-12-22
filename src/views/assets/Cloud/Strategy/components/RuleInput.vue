<template>
  <AttrInput
    :form-config="formConfig"
    :table-config="tableConfig"
    class="attr-input"
    @submit="onSubmit"
  />
</template>

<script lang="jsx">
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
        submitBtnText: this.$t('Add'),
        hasReset: false,
        onSubmit: () => {
        },
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
          { prop: 'attr', label: this.$t('AttrName'), formatter: tableFormatter('attr') },
          { prop: 'match', label: this.$t('Match'), formatter: tableFormatter('match') },
          { prop: 'value', label: this.$t('AttrValue'), formatter: tableFormatter('value') },
          {
            prop: 'action',
            label: this.$t('Action'),
            align: 'center',
            width: '100px',
            formatter: (row, col, cellValue, index) => {
              return (
                <div class='input-button'>
                  <el-button
                    icon='el-icon-minus'
                    size='mini'
                    style={{ 'flexShrink': 0 }}
                    type='danger'
                    onClick={this.handleDelete(index)}
                  />
                </div>
              )
            }
          }
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
        this.$message.success(this.$tc('DeleteSuccessMsg'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-form-item) {
  &:nth-child(-n+4) {
    width: 29%;
  }
  &:last-child {
    width: 6%;
  }
}
</style>
