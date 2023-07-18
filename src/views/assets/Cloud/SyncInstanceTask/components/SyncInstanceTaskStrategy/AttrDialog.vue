<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :close-on-click-modal="false"
    :title="$tc('common.Strategy')"
    width="80%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <GenericCreateUpdateForm v-bind="$data" />
  </Dialog>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import Dialog from '@/components/Dialog/index.vue'
import AttrInput from './AttrInput'
import { attrMatchOptions, strMatchValues } from '@/components/const'
import Select2 from '@/components/FormFields/Select2'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'
import { Required } from '@/components/DataForm/rules'

export default {
  name: 'AttrDialog',
  components: { Dialog, GenericCreateUpdateForm },
  props: {
    value: {
      type: Object,
      default: () => ({ name: '', rules: [], actions: [] })
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    const resourceTypeOptions = [
      { label: this.$t('assets.Platform'), value: 'platform' },
      { label: this.$t('assets.Node'), value: 'node' },
      { label: this.$t('assets.Domain'), value: 'domain' },
      { label: this.$t('accounts.AccountTemplate'), value: 'account_template' }
    ]
    const instanceAttrOptions = [
      { label: vm.$t('xpack.Cloud.InstanceName'), value: 'instance_name' },
      { label: vm.$t('xpack.Cloud.InstancePlatformName'), value: 'instance_platform' }
    ]
    const tableFormatter = (colName) => {
      return (row, col, cellValue) => {
        const value = cellValue
        if (value?.label) { return value.label }
        switch (colName) {
          case 'attr':
            return instanceAttrOptions.find(attr => attr.value === value)?.label || value
          case 'resource_type':
            return resourceTypeOptions.find(attr => attr.value === value)?.label || value
          case 'match':
            return attrMatchOptions.find(opt => opt.value === value).label || value
          case 'value':
            return Array.isArray(value) ? value.join(', ') : value
          case 'resource':
            return vm.globalResource[value] || value
          case 'protocols':
            return Array.isArray(value) ? value.map(p => { return `${p.name}(${p.port})` }).join(', ') : ''
          default:
            return value
        }
      }
    }
    return {
      object: this.getObject(),
      resourceType: '',
      globalResource: {},
      globalProtocols: {},
      fields: [
        [this.$t('common.BasicSetting'), ['name']],
        [this.$t('common.RuleSetting'), ['rules']],
        [this.$t('common.ActionSetting'), ['actions']]
      ],
      fieldsMeta: {
        rules: {
          label: this.$t('common.Rule'),
          component: AttrInput,
          el: {
            formConfig: {
              initial: { attr: '', match: '', value: '' },
              inline: true,
              hasSaveContinue: false,
              submitBtnSize: 'mini',
              submitBtnText: vm.$t('common.Add'),
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
                      if (strMatchValues.indexOf(option.value) !== -1 && option.value !== 'in') {
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
                        onClick={this.handleAttrDelete('rules', index)}
                      />
                    </div>
                  )
                } }
              ],
              totalData: this.value.rules,
              hasPagination: false
            }
          }
        },
        actions: {
          label: this.$t('common.Action'),
          component: AttrInput,
          el: {
            beforeSubmit: (value) => {
              let status = true
              const labelMap = {
                platform: this.$tc('assets.Platform'), domain: this.$tc('assets.Domain')
              }
              if (Object.keys(labelMap).indexOf(value?.attr) !== -1) {
                this.fieldsMeta.actions.el.tableConfig.totalData.map(item => {
                  if (item.attr === value.attr) {
                    status = false
                    this.$message.error(`${this.$tc('xpack.Cloud.UniqueError')}: ${labelMap[value.attr]}`)
                  }
                })
              }
              return status
            },
            formConfig: {
              initial: { attr: '', value: '' },
              inline: true,
              hasSaveContinue: false,
              submitBtnSize: 'mini',
              submitBtnText: vm.$t('common.Add'),
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
                        vm.fieldsMeta.actions.el.formConfig.fieldsMeta.protocols.el.hidden = true
                      }
                      vm.resourceType = val
                      vm.fieldsMeta.actions.el.formConfig.fieldsMeta.value.el.ajax.url = url
                    }
                  }
                },
                value: {
                  label: '',
                  component: Select2,
                  rules: [Required],
                  el: {
                    value: [],
                    style: { width: '400px' },
                    ajax: {
                      url: '',
                      clearable: false,
                      transformOption: (item) => {
                        let label
                        switch (vm.resourceType) {
                          case 'platform':
                            label = item?.name
                            vm.globalProtocols[item.id] = item.protocols
                            vm.globalResource[item.id] = label
                            break
                          case 'account_template':
                            label = `${item.name}(${item.username})`
                            vm.globalResource[item.id] = label
                            break
                          case 'node':
                            label = item?.full_value
                            vm.globalResource[item.id] = label
                            break
                          default:
                            label = item?.name
                            vm.globalResource[item.id] = label
                        }
                        return { label: label, value: item.id }
                      }
                    },
                    multiple: false
                  },
                  on: {
                    change: ([val], updateForm) => {
                      if (vm.resourceType === 'platform') {
                        vm.fieldsMeta.actions.el.formConfig.fieldsMeta.protocols.el.choices = vm.globalProtocols[val] || []
                        vm.fieldsMeta.actions.el.formConfig.fieldsMeta.protocols.el.hidden = false
                      } else {
                        vm.fieldsMeta.actions.el.formConfig.fieldsMeta.protocols.el.hidden = true
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
                { prop: 'value', label: this.$t('common.Resource'), formatter: tableFormatter('resource') },
                { prop: 'protocols', label: this.$t('common.Other'), formatter: tableFormatter('protocols') },
                { prop: 'action', label: this.$t('common.Action'), align: 'center', width: '100px', formatter: (row, col, cellValue, index) => {
                  return (
                    <div className='input-button'>
                      <el-button
                        icon='el-icon-minus'
                        size='mini'
                        style={{ 'flexShrink': 0 }}
                        type='danger'
                        onClick={this.handleAttrDelete('actions', index)}
                      />
                    </div>
                  )
                } }
              ],
              totalData: this.value.actions,
              hasPagination: false
            }
          }
        }
      },
      hasSaveContinue: false,
      onPerformSuccess: (instance) => {
        const index = this.tableConfig.totalData.findIndex(x => x.id === instance.id)
        if (index !== -1) {
          this.tableConfig.totalData.splice(index, 1, instance)
        } else {
          this.tableConfig.totalData.push(instance)
        }
        this.$emit('confirm')
        this.$emit('update:visible', false)
      },
      getUrl: () => {
        const url = '/api/v1/xpack/cloud/rules-actions/'
        return this.object?.id ? `${url}${this.object.id}/` : url
      },
      submitMethod: () => {
        return this.object?.id ? 'put' : 'post'
      }
    }
  },
  mounted() {
  },
  methods: {
    getObject() {
      if (this.value?.id) {
        return {
          id: this.value.id, name: this.value.name,
          rules: this.value.rules, actions: this.value.actions
        }
      }
      return {}
    },
    handleAttrDelete(type, index) {
      return () => {
        const item = this.fieldsMeta[type].el.tableConfig.totalData.splice(index, 1)
        if (item[0]?.id) {
          this.$axios.delete(`/api/v1/xpack/cloud/${type}/${item[0]?.id}/`)
        }
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
        this.object[type] = this.fieldsMeta[type].el.tableConfig.totalData
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form ::v-deep .el-form {
  margin-top: -15px;
}
</style>

