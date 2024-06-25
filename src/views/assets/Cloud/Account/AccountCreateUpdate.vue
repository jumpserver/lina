<template>
  <Page>
    <el-row :gutter="20">
      <el-col :md="20" :sm="24">
        <IBox>
          <GenericCreateUpdateForm
            v-show="activeStep===0"
            ref="baseForm"
            v-bind="configSettings"
          />
          <GenericCreateUpdateForm
            v-if="activeStep===1"
            ref="strategyForm"
            v-bind="strategySettings"
          />
        </IBox>
      </el-col>
      <el-col :md="4" :sm="24">
        <IBox style="height: 490px;">
          <el-steps
            direction="vertical"
            :active="activeStep"
            space="400px"
          >
            <el-step :title="$tc('Config')" :description="description" />
            <el-step :title="$tc('Strategy')" />
          </el-steps>
        </IBox>
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import { RequiredChange, specialEmojiCheck } from '@/components/Form/DataForm/rules'
import { ACCOUNT_PROVIDER_ATTRS_MAP, aliyun } from '../const'
import { Checkbox, CronTab, IBox, UploadKey } from '@/components'
import { encryptPassword } from '@/utils/crypto'
import { GenericCreateUpdateForm, Page } from '@/layout/components'
import SyncInstanceTaskStrategy from './components/SyncInstanceTaskStrategy'
import { setUrlParam } from '@/utils/common'

export default {
  components: {
    IBox,
    Page,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    const accountProvider = this.$route.query.provider || aliyun
    const accountProviderAttrs = ACCOUNT_PROVIDER_ATTRS_MAP[accountProvider]

    function setFieldAttrs() {
      const fieldsObject = {}
      const updateNotRequiredFields = ['access_key_secret', 'client_secret', 'password', 'sc_password', 'oc_password', 'cert_file', 'key_file', 'public_key', 'private_key']
      for (const item of accountProviderAttrs?.attrs) {
        fieldsObject[item] = {
          rules: updateNotRequiredFields.includes(item) && vm.$route.params.id ? [] : [RequiredChange]
        }
      }
      return fieldsObject
    }

    return {
      accountId: '',
      taskId: '',
      activeStep: 0,
      description: accountProviderAttrs.title,
      configSettings: {
        initial: {
          attrs: {
            ip_group: []
          },
          provider: this.$route.query.provider,
          port: 443
        },
        url: '/api/v1/xpack/cloud/accounts/',
        fields: [
          [this.$t('Basic'), ['name', 'provider']],
          [this.$t(accountProviderAttrs.title), ['attrs']],
          [this.$t('Other'), ['comment']]
        ],
        fieldsMeta: {
          name: {
            rules: [RequiredChange, specialEmojiCheck]
          },
          attrs: {
            encryptedFields: ['access_key_secret'],
            fields: accountProviderAttrs.attrs,
            fieldsMeta: {
              // 必须放在最上面，下面特殊制定的字段才会覆盖默认
              ...setFieldAttrs(),
              service_account_key: {
                label: this.$t('ServerAccountKey'),
                component: UploadKey,
                el: {
                  toFormat: 'object'
                }
              },
              cert_file: {
                label: this.$t('Certificate'),
                component: UploadKey,
                el: {
                  toFormat: 'object'
                }
              },
              key_file: {
                label: this.$t('SecretKey'),
                component: UploadKey,
                el: {
                  toFormat: 'object'
                }
              },
              password: {
                rules: this.$route.params.id ? [] : [RequiredChange]
              },
              public_key: {
                label: this.$t('PublicKey'),
                rules: this.$route.params.id ? [] : [RequiredChange]
              },
              private_key: {
                label: this.$t('PrivateKey'),
                rules: this.$route.params.id ? [] : [RequiredChange]
              },
              project: {
                label: this.$t('Project')
              }
            }
          },
          provider: {
            rules: [RequiredChange],
            el: {
              disabled: true
            }
          }
        },
        onPerformSuccess: (resp) => {
          let url = vm.strategySettings.fieldsMeta.regions.el.url
          if (!vm.accountId) {
            vm.accountId = resp?.id
            url = setUrlParam(url, 'account_id', vm.accountId)
            vm.strategySettings.fieldsMeta.regions.el.url = url
          }
          if (!vm.taskId) {
            vm.taskId = resp?.task?.id
            vm.strategySettings.url += `${vm.taskId}/`
          }
          this.activeStep = this.activeStep === 0 ? 1 : 0
        },
        submitBtnText: this.$t('Next'),
        hasSaveContinue: false,
        hasReset: false,
        getUrl: () => {
          let url = vm.configSettings.url
          const params = vm.$route.params
          const instanceId = params?.id || vm.accountId
          if (instanceId) {
            url = `${url}${instanceId}/`
          }
          return `${url}?provider=${accountProvider}`
        },
        submitMethod: () => { return vm.$route.params?.id || vm.accountId ? 'put' : 'post' },
        cleanFormValue(values) {
          const encryptedFields = [
            'access_key_secret', 'password', 'client_secret',
            'oc_password', 'sc_password'
          ]
          const attrs = values.attrs
          for (const item of encryptedFields) {
            const value = attrs[item]
            if (!value) {
              continue
            }
            attrs[item] = encryptPassword(value)
          }
          if (Array.isArray(attrs.ip_group)) {
            values.attrs.ip_group = attrs.ip_group.filter(Boolean)
          }
          return values
        },
        afterGetFormValue(formValue) {
          if (!formValue.attrs) {
            return formValue
          }
          return formValue
        }
      },
      strategySettings: {
        initial: {
          is_periodic: false,
          interval: 24,
          hostname_strategy: 'instance_name_partial_ip',
          ip_network_segment_group: ['*']
        },
        fields: [
          [this.$t('CloudSource'), ['regions']],
          [this.$t('SaveSetting'), [
            'hostname_strategy', 'ip_network_segment_group', 'sync_ip_type',
            'is_always_update', 'fully_synchronous'
          ]],
          [this.$t('SyncStrategy'), ['strategy']],
          [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']]
        ],
        url: '/api/v1/xpack/cloud/sync-instance-tasks/',
        fieldsMeta: {
          hostname_strategy: {
            rules: [RequiredChange],
            helpTip: this.$t('HostnameStrategy')
          },
          is_always_update: {
            type: 'switch',
            label: this.$t('IsAlwaysUpdate'),
            helpTip: this.$t('IsAlwaysUpdateHelpTip')
          },
          fully_synchronous: {
            type: 'switch',
            label: this.$t('FullySynchronous'),
            helpTip: this.$t('FullySynchronousHelpTip')
          },
          regions: {
            component: Checkbox,
            el: {
              url: '/api/v1/xpack/cloud/regions/',
              options: [],
              value: [],
              noOptionTip: this.$t('CloudRegionTip'),
              processResults(data) {
                return data.regions?.map((item) => {
                  return { label: item.name, value: item.id }
                })
              }
            }
          },
          is_periodic: {
            type: 'switch'
          },
          crontab: {
            component: CronTab,
            hidden: (formValue) => {
              return formValue.is_periodic === false
            },
            helpText: this.$t('CrontabOfCreateUpdatePage'),
            helpTextAsTip: true
          },
          interval: {
            hidden: (formValue) => {
              return formValue.is_periodic === false
            },
            helpText: this.$t('IntervalOfCreateUpdatePage')
          },
          strategy: {
            label: this.$t('Strategy'),
            component: SyncInstanceTaskStrategy,
            helpTip: this.$t('StrategyHelpTip')
          }
        },
        hasSaveContinue: false,
        hasReset: false,
        getUrl: () => { return this.strategySettings.url },
        submitMethod: () => { return this.$refs.baseForm.form.task?.id ? 'put' : 'post' },
        moreButtons: [
          {
            title: this.$t('Previous'),
            callback: () => { this.activeStep = this.activeStep === 1 ? 0 : 1 }
          }
        ],
        updateSuccessNextRoute: { name: 'CloudAccountList' },
        createSuccessNextRoute: { name: 'CloudAccountList' },
        cleanFormValue(value) {
          const ipNetworkSegments = value.ip_network_segment_group
          const strategy = value?.strategy || []
          if (!Array.isArray(ipNetworkSegments)) {
            value.ip_network_segment_group = ipNetworkSegments ? ipNetworkSegments.split(',') : []
          }
          value.strategy = strategy.map(item => { return item.id })
          const accountId = this.$route.params?.id || this.accountId
          if (accountId) {
            value.account = { pk: accountId }
          }
          return value
        }
      }
    }
  },
  methods: {
  }
}

</script>

<style lang="less" scoped>
</style>
