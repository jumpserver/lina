<template>
  <AttrInput
    :before-submit="beforeSubmit"
    :form-config="formConfig"
    :table-config="tableConfig"
    class="attr-input"
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
      formConfig: {
        initial: { attr: '', value: '' },
        inline: true,
        hasSaveContinue: false,
        submitBtnSize: 'mini',
        submitBtnText: this.$t('common.Add'),
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
                let url
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
                }
                if (val !== 'platform') {
                  this.formConfig.fieldsMeta.protocols.el.hidden = true
                }
                this.resourceType = val
                this.formConfig.fieldsMeta.value.el.ajax.url = url
              }
            }
          },
          value: {
            label: '',
            component: Select2,
            rules: [Required],
            el: {
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
          { prop: 'attr', label: this.$t('common.ResourceType'), formatter: tableFormatter('resource_type') },
          { prop: 'value', label: this.$t('common.Resource'), formatter: tableFormatter('resource', () => { return this.globalResource }) },
          { prop: 'protocols', label: this.$t('common.Other'), formatter: tableFormatter('protocols') },
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
    beforeSubmit(data) {
      let status = true
      const labelMap = {
        platform: this.$tc('assets.Platform'), domain: this.$tc('assets.Domain')
      }
      this.tableConfig.totalData.map(item => {
        const iValue = item.value?.id || item.value
        const iAttr = item.attr?.value || item.attr
        if (iValue === data.value) {
          status = false
          this.$message.error(`${this.$tc('xpack.Cloud.ExistError')}`)
        } else if (Object.keys(labelMap).indexOf(data?.attr) !== -1 && iAttr === data.attr) {
          status = false
          this.$message.error(`${this.$tc('xpack.Cloud.UniqueError')}: ${labelMap[data.attr]}`)
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
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .el-form-item:nth-child(-n+3) {
  width: 43.5%;
}
>>> .el-form-item:last-child {
  width: 6%;
}
</style>

