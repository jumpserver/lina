<template>
  <AttrInput
    :form-config="formConfig"
    :table-config="tableConfig"
    class="attr-input"
    @submit="onSubmit"
  />
</template>

<script>
import { createVNode as createVNodeCompat, resolveComponent as resolveComponentCompat } from 'vue'
import { attrMatchOptions, strMatchValues } from '@/components/const'
import { Required } from '@/components/Form/DataForm/rules'
import { AttrInput, Select2 } from '@/components/Form/FormFields'
import { instanceAttrOptions, tableFormatter } from './const'
export default {
  name: 'RuleInput',
  components: {
    AttrInput
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formConfig: {
        initial: {
          attr: '',
          match: '',
          value: ''
        },
        inline: true,
        hasSaveContinue: false,
        submitBtnSize: 'small',
        submitBtnText: this.$t('Add'),
        hasReset: false,
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
          {
            prop: 'attr',
            label: this.$t('AttrName'),
            formatter: tableFormatter('attr')
          },
          {
            prop: 'match',
            label: this.$t('Match'),
            formatter: tableFormatter('match')
          },
          {
            prop: 'value',
            label: this.$t('AttrValue'),
            formatter: tableFormatter('value')
          },
          {
            prop: 'action',
            label: this.$t('Action'),
            align: 'center',
            width: '100px',
            formatter: (row, col, cellValue, index) => {
              return createVNodeCompat(
                'div',
                {
                  class: 'input-button'
                },
                [
                  createVNodeCompat(
                    resolveComponentCompat('el-button'),
                    {
                      icon: 'Minus',
                      size: 'small',
                      style: {
                        flexShrink: 0
                      },
                      type: 'danger',
                      onClick: this.handleDelete(index)
                    },
                    null
                  )
                ]
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
.attr-input {
  :deep(.form-fields.el-form) {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto !important;
    column-gap: 12px;
    row-gap: 8px;
    align-items: start;
    padding: 0 !important;
  }

  :deep(.form-fields > .el-form-item) {
    min-width: 0;
    margin: 0 !important;
  }
}

@media (max-width: 1200px) {
  .attr-input {
    :deep(.form-fields.el-form) {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
}

@media (max-width: 768px) {
  .attr-input {
    :deep(.form-fields.el-form) {
      grid-template-columns: minmax(0, 1fr) !important;
    }
  }
}
</style>
