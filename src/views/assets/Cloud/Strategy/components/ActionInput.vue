<template>
  <AttrInput
    :before-submit="beforeSubmit"
    :form-config="formConfig"
    :table-config="tableConfig"
    class="action-input"
    @submit="onSubmit"
  />
</template>

<script>
import { AttrInput, Select2 } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import { resourceTypeOptions, tableFormatter } from './const'

export default {
  name: 'ActionInput',
  components: { AttrInput },
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      resourceType: '',
      globalResource: {},
      globalProtocols: {},
      nameOptions: [
        { label: this.$t('InstanceName'), value: 'full_name' },
        { label: this.$t('InstanceNamePartIp'), value: 'part_name' }
      ],
      formConfig: {
        initial: { attr: '', value: '' },
        inline: true,
        hasSaveContinue: false,
        submitBtnSize: 'mini',
        submitBtnText: this.$t('Add'),
        hasReset: false,
        onSubmit: () => {
        },
        submitMethod: () => 'post',
        getUrl: () => '',
        cleanFormValue(data) {
          if (data?.attr !== 'platform') {
            delete data.protocols
          }
          return data
        },
        fields: [['', ['attr', 'value', 'protocols']]],
        fieldsMeta: {
          attr: {
            label: '',
            component: Select2,
            rules: [Required],
            el: {
              url: '',
              clearable: false,
              multiple: false,
              options: resourceTypeOptions
            },
            on: {
              change: ([val], updateForm) => {
                updateForm({ value: '' })
                let url = ''
                let options = []
                switch (val) {
                  case 'platform':
                    url = '/api/v1/assets/platforms/?category=host'
                    break
                  case 'node':
                    url = '/api/v1/assets/nodes/'
                    break
                  case 'domain':
                    url = '/api/v1/assets/domains/'
                    break
                  case 'account_template':
                    url = '/api/v1/accounts/account-templates/'
                    break
                  case 'label':
                    url = '/api/v1/labels/labels/'
                    break
                  case 'name_strategy':
                    options = this.nameOptions
                    break
                }
                if (val !== 'platform') {
                  this.formConfig.fieldsMeta.protocols.el.hidden = true
                }
                this.resourceType = val
                if (url) {
                  this.formConfig.fieldsMeta.value.el.ajax.url = url
                } else {
                  this.formConfig.fieldsMeta.attr.el.remote = false
                }
                this.formConfig.fieldsMeta.value.el.options = options
              }
            }
          },
          value: {
            label: '',
            component: Select2,
            rules: [Required],
            el: {
              options: [],
              value: [],
              ajax: {
                url: '',
                clearable: false,
                transformOption: (item) => {
                  let label
                  switch (this.resourceType) {
                    case 'platform':
                      label = item?.name
                      this.globalProtocols[item.id] = item.protocols
                      this.globalResource[item.id] = label
                      break
                    case 'account_template':
                      label = `${item.name}(${item.username})`
                      this.globalResource[item.id] = label
                      break
                    case 'node':
                      label = item?.full_value
                      this.globalResource[item.id] = label
                      break
                    default:
                      label = item?.name
                      this.globalResource[item.id] = label
                  }
                  return { label: label, value: item.id }
                }
              },
              multiple: false
            },
            on: {
              change: ([val], updateForm) => {
                if (this.resourceType === 'platform') {
                  this.formConfig.fieldsMeta.protocols.el.choices = this.globalProtocols[val] || []
                  this.formConfig.fieldsMeta.protocols.el.hidden = false
                } else {
                  this.formConfig.fieldsMeta.protocols.el.hidden = true
                }
              }
            }
          },
          protocols: {
            label: '',
            component: ProtocolSelector,
            el: {
              hidden: true,
              settingReadonly: true,
              choices: []
            }
          }
        }
      },
      tableConfig: {
        columns: [
          { prop: 'attr', label: this.$t('ResourceType'), formatter: tableFormatter('resource_type') },
          {
            prop: 'value', label: this.$t('Resource'), formatter: tableFormatter('resource', () => {
              return this.globalResource
            })
          },
          { prop: 'protocols', label: this.$t('Other'), formatter: tableFormatter('protocols') },
          {
            prop: 'action',
            label: this.$t('Action'),
            align: 'center',
            width: '100px',
            formatter: (row, col, cellValue, index) => {
              return (
                <div className='input-button'>
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
  created() {
    this.init()
  },
  methods: {
    init() {
      this.nameOptions.map((o) => {
        this.globalResource[o.value] = o.label
      })
    },
    onSubmit() {
      this.$emit('input', this.tableConfig.totalData)
    },
    beforeSubmit(data) {
      let status = true
      const labelMap = {
        platform: this.$tc('Platform'), domain: this.$tc('Zone'),
        name_strategy: this.$tc('Strategy')
      }
      this.tableConfig.totalData.map(item => {
        const iValue = item.value?.id || item.value
        const iAttr = item.attr?.value || item.attr
        if (iValue === data.value) {
          status = false
          this.$message.error(`${this.$tc('ExistError')}`)
        } else if (Object.keys(labelMap).indexOf(data?.attr) !== -1 && iAttr === data.attr) {
          status = false
          this.$message.error(`${this.$tc('UniqueError')}: ${labelMap[data.attr]}`)
        }
      })
      return status
    },
    handleDelete(index) {
      return () => {
        const item = this.tableConfig.totalData.splice(index, 1)
        if (item[0]?.id) {
          this.$axios.delete(`/api/v1/xpack/cloud/strategy-actions/${item[0].id}/`)
        }
        this.$message.success(this.$tc('DeleteSuccessMsg'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-form-item:nth-child(-n+3) {
  width: 43.5%;
}

::v-deep .el-form-item:last-child {
  width: 6%;
}

.action-input {
  margin-top: -10px;
}
</style>

