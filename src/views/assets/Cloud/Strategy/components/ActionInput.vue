<template>
  <AttrInput
    :before-submit="beforeSubmit"
    :form-config="formConfig"
    :table-config="tableConfig"
    class="action-input"
    @submit="onSubmit"
  />
</template>

<script lang="jsx">
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
      default: () => []
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
        submitBtnSize: 'small',
        submitBtnText: this.$t('Add'),
        hasReset: false,
        onSubmit: () => {},
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
                  case 'platform': {
                    const category = this.$route.query.category || 'host'
                    url = `/api/v1/assets/platforms/?category=${category}`
                    break
                  }
                  case 'node':
                    url = '/api/v1/assets/nodes/'
                    break
                  case 'zone':
                    url = '/api/v1/assets/zones/'
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
                url: '/api/v1/assets/platforms/',
                transformOption: item => {
                  let display
                  switch (this.resourceType) {
                    case 'platform':
                      display = item?.name
                      this.globalProtocols[item.id] = item.protocols
                      this.globalResource[item.id] = display
                      break
                    case 'account_template':
                      display = `${item.name}(${item.username})`
                      this.globalResource[item.id] = display
                      break
                    case 'node':
                      display = item?.full_value
                      this.globalResource[item.id] = display
                      break
                    case 'label':
                      display = `${item.name}:${item.value}`
                      this.globalResource[item.id] = display
                      break
                    default:
                      display = item?.name
                      this.globalResource[item.id] = display
                  }
                  return { label: display, value: item.id }
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
              showSetting: () => false,
              choices: []
            }
          }
        }
      },
      tableConfig: {
        columns: [
          {
            prop: 'attr',
            label: this.$t('ResourceType'),
            formatter: tableFormatter('resource_type')
          },
          {
            prop: 'value',
            label: this.$t('Resource'),
            formatter: tableFormatter('resource', () => {
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
                <div class="input-button">
                  <el-button
                    icon="el-icon-minus"
                    size="small"
                    style={{ flexShrink: 0 }}
                    type="danger"
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
      this.nameOptions.map(o => {
        this.globalResource[o.value] = o.label
      })
    },
    onSubmit() {
      this.$emit('input', this.tableConfig.totalData)
    },
    beforeSubmit(data) {
      let status = true
      const labelMap = {
        platform: this.$tc('Platform'),
        zone: this.$tc('Zone'),
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
:deep(.el-form-item) {
  &:nth-child(-n + 3) {
    width: 43.5%;
  }
  &:last-child {
    width: 6%;
  }
}

.action-input {
}
</style>
