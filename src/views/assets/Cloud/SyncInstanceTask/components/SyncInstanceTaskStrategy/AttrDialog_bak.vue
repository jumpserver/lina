<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :close-on-click-modal="false"
    :title="$tc('条件动作配置')"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div>
      <el-input v-model="ruleName" placeholder="请输入名称">
        <template v-if="ruleNameError">
          <div class="el-form-item__error">{{ ruleNameError }}</div>
        </template>
      </el-input>
      <AttrInput
        :form-config="rulesFormConfig"
        :table-config="rulesTableConfig"
        @confirm="handleRulesAttrConfirm"
      />
      <el-divider />
      <el-input v-model="actionName" :placeholder="$t('请输入名称')" />
      <AttrInput
        :form-config="actionsFormConfig"
        :table-config="actionsTableConfig"
        @confirm="handleActionsAttrConfirm"
      />
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <el-button size="mini" type="primary" @click="handleAttrAdd">
        {{ $t('common.Submit') }}
      </el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import AttrInput from './AttrInput'
import { attrMatchOptions, strMatchValues } from '@/components/const'
import Select2 from '@/components/FormFields/Select2'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'
import TagInput from '@/components/FormFields/TagInput.vue'
import { Required } from '@/components/DataForm/rules'

export default {
  name: 'AttrDialog',
  components: { Dialog, AttrInput },
  props: {
    form: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    const resourceTypeOptions = [
      { label: '平台', value: 'platform' },
      { label: '节点', value: 'node' },
      { label: '网关', value: 'domain' },
      { label: '账号模版', value: 'account_template' }
    ]
    const instanceAttrOptions = [
      { label: vm.$t('实例名称'), value: 'instance_name' },
      { label: vm.$t('实例平台'), value: 'instance_platform' }
    ]
    const tableFormatter = (colName) => {
      return (row, col, cellValue) => {
        const value = cellValue
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
      ruleNameError: '错误',
      ruleName: '',
      actionName: '',
      resourceType: '',
      currentActionValue: '',
      globalResource: {},
      globalProtocols: {},
      rulesFormConfig: {
        inline: true,
        hasSaveContinue: false,
        submitBtnSize: 'mini',
        submitBtnText: vm.$t('common.Add'),
        hasReset: false,
        onSubmit: (validValues) => {
        },
        fields: [['', ['attr', 'match', { id: 'value', 'component': 'el-input' }]]],
        fieldsMeta: {
          attr: {
            component: Select2,
            rules: [Required],
            el: {
              value: [],
              multiple: false,
              clearable: false,
              options: instanceAttrOptions
            },
            on: {
              change: ([val], updateForm) => {
              }
            }
          },
          match: {
            component: Select2,
            rules: [Required],
            el: {
              value: [],
              multiple: false,
              clearable: false,
              options: attrMatchOptions.filter((option) => {
                if (strMatchValues.indexOf(option.value) !== -1) {
                  return option
                }
              })
            },
            on: {
              change: ([value], updateForm) => {
                if (value === 'in') {
                  vm.rulesFormConfig.fields[0][1][2].component = TagInput
                } else {
                  vm.rulesFormConfig.fields[0][1][2].component = 'el-input'
                }
                setTimeout(() => {
                  updateForm({ match: value })
                }, 10)
              }
            }
          },
          value: {
            component: Select2,
            rules: [Required]
          }
        }
      },
      rulesTableConfig: {
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
                  onClick={this.handleRulesAttrDelete({ row, col, cellValue, index })}
                />
              </div>
            )
          } }
        ],
        totalData: [],
        hasPagination: false
      },
      actionsFormConfig: {
        inline: true,
        hasSaveContinue: false,
        submitBtnSize: 'mini',
        submitBtnText: vm.$t('common.Add'),
        hasReset: false,
        onSubmit: (validValues) => {
        },
        cleanFormValue(data) {
          if (data?.resource_type !== 'platform') {
            delete data.protocols
          }
          return data
        },
        fields: [['', ['resource_type', 'resource', 'protocols']]],
        fieldsMeta: {
          resource_type: {
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
                updateForm({ resource: '' })
                let url
                switch (val) {
                  case 'platform':
                    url = '/api/v1/assets/platforms/'
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
                  vm.actionsFormConfig.fieldsMeta.protocols.el.hidden = true
                }
                vm.resourceType = val
                vm.actionsFormConfig.fieldsMeta.resource.el.ajax.url = url
              }
            }
          },
          resource: {
            component: Select2,
            rules: [Required],
            el: {
              value: [],
              style: {
                width: '400px'
              },
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
                  vm.actionsFormConfig.fieldsMeta.protocols.el.choices = vm.globalProtocols[val] || []
                  vm.actionsFormConfig.fieldsMeta.protocols.el.hidden = false
                } else {
                  vm.actionsFormConfig.fieldsMeta.protocols.el.hidden = true
                }
              }
            }
          },
          protocols: {
            component: ProtocolSelector,
            el: {
              hidden: true,
              settingReadonly: true,
              choices: []
            }
          }
        }
      },
      actionsTableConfig: {
        columns: [
          { prop: 'resource_type', label: this.$t('资源类型'), formatter: tableFormatter('resource_type') },
          { prop: 'resource', label: this.$t('资源'), formatter: tableFormatter('resource') },
          { prop: 'protocols', label: this.$t('其他信息'), formatter: tableFormatter('protocols') },
          { prop: 'action', label: this.$t('common.Action'), align: 'center', width: '100px', formatter: (row, col, cellValue, index) => {
            return (
              <div className='input-button'>
                <el-button
                  icon='el-icon-minus'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='danger'
                  onClick={this.handleActionsAttrDelete({ row, col, cellValue, index })}
                />
              </div>
            )
          } }
        ],
        totalData: [],
        hasPagination: false
      }
    }
  },
  mounted() {
  },
  methods: {
    handleRulesAttrConfirm(form) {
      console.log('rules:', form)
    },
    handleActionsAttrConfirm(form) {
      console.log('actions: ', form)
    },
    handleAttrEdit({ row, index }) {
      return () => {
      }
    },
    handleRulesAttrDelete({ index }) {
      return () => {
        this.rulesTableConfig.totalData.splice(index, 1)
      }
    },
    handleActionsAttrDelete({ index }) {
      return () => {
        this.actionsTableConfig.totalData.splice(index, 1)
      }
    },
    handleAttrAdd() {
      if (this.rulesTableConfig.totalData.length < 1 || this.actionsTableConfig.totalData.length < 1) {
        this.$message.error(this.$tc('条件和动作列表中需至少存在一项配置'))
      }
      const form = {
        rules: this.rulesTableConfig.totalData,
        actions: this.actionsTableConfig.totalData
      }
      console.log('form: ', form)
    }
  }
}
</script>

<style lang="scss" scoped>

.attr-form {
  >>> .el-select {
    width: 100%;
  }
}
</style>

