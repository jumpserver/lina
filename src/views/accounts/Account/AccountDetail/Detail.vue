<template>
  <div>
    <TwoCol>
      <template>
        <AutoDetailCard
          :object="object"
          v-bind="detail"
        />
      </template>
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
        <ViewSecret
          v-if="showViewSecretDialog"
          :account="object"
          :url="secretUrl"
          :visible.sync="showViewSecretDialog"
        />
        <AutomationParamsForm
          :has-button="false"
          :method="pushAccountMethod"
          :visible.sync="autoPushVisible"
          @canSetting="onCanSetting"
          @submit="onSubmit"
        />
      </template>
    </TwoCol>
    <el-drawer
      :append-to-body="true"
      :visible.sync="pamDrawerShow"
      :with-header="false"
      size="50%"
    >
      <component :is="drawerRefName" />
    </el-drawer>
  </div>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import QuickActions from '@/components/Common/QuickActions/index.vue'
import ViewSecret from '@/components/Apps/AccountListTable/ViewSecret.vue'
import { openTaskPage } from '@/utils/jms'
import AutomationParamsForm from '@/views/assets/Platform/AutomationParamsSetting.vue'
import AssetDetail from '@/views/assets/Asset/AssetDetail'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    AutoDetailCard,
    QuickActions,
    AssetDetail,
    AutomationParamsForm,
    ViewSecret
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const vm = this
    return {
      pamDrawerShow: false,
      drawerRefName: null,
      needSetAutoPushParams: false,
      autoPushVisible: false,
      secretUrl: `/api/v1/accounts/account-secrets/${this.object.id}/`,
      showViewSecretDialog: false,
      quickActions: [
        {
          title: this.$t('Active'),
          type: 'switcher',
          attrs: {
            model: vm.object.is_active,
            disabled: !vm.$hasPerm('accounts.change_account')
          },
          callbacks: Object.freeze({
            change: (val) => {
              this.$axios.patch(
                `/api/v1/accounts/accounts/${this.object.id}/`,
                { is_active: val, name: this.object.name }
              ).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('Privileged'),
          type: 'switcher',
          attrs: {
            model: vm.object.privileged,
            disabled: !vm.$hasPerm('accounts.change_account')
          },
          callbacks: Object.freeze({
            change: (val) => {
              this.$axios.patch(
                `/api/v1/accounts/accounts/${this.object.id}/`,
                { name: this.object?.name, privileged: val }
              ).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('TestAccountConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('Test'),
            disabled: (
              !vm.$hasPerm('accounts.verify_account') ||
              !vm.object.asset.auto_config?.ansible_enabled ||
              !vm.object.asset.auto_config?.ping_enabled ||
              this.$store.getters.currentOrgIsRoot
            )
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/accounts/accounts/tasks/`,
                {
                  action: 'verify',
                  accounts: [this.object.id]
                }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          })
        },
        {
          title: this.$t('PushAccount'),
          attrs: {
            type: 'primary',
            label: this.$t('Push'),
            disabled: (
              !vm.$hasPerm('accounts.push_account') ||
              !vm.object.asset.auto_config?.push_account_enabled ||
              this.$store.getters.currentOrgIsRoot
            )
          },
          callbacks: Object.freeze({
            click: () => {
              if (this.needSetAutoPushParams) {
                this.autoPushVisible = true
              } else {
                this.$axios.post(
                  `/api/v1/accounts/accounts/tasks/`,
                  { action: 'push', accounts: [this.object.id] }
                ).then(res => {
                  openTaskPage(res['task'])
                })
              }
            }
          })
        },
        {
          title: this.$t('ViewSecret'),
          attrs: {
            type: 'primary',
            label: this.$t('View'),
            disabled: !vm.$hasPerm('accounts.view_accountsecret')
          },
          callbacks: Object.freeze({
            click: () => {
              vm.showViewSecretDialog = false
              setTimeout(() => {
                vm.showViewSecretDialog = true
              })
            }
          })
        },
        {
          title: this.$t('ClearSecret'),
          attrs: {
            type: 'primary',
            label: this.$t('Clear'),
            disabled: !vm.$hasPerm('accounts.change_account')
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.patch(
                '/api/v1/accounts/accounts/clear-secret/',
                { account_ids: [this.object.id] }
              ).then(() => {
                this.$message.success(this.$tc('ClearSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('SuFrom'),
          type: 'updateSelect',
          attrs: {
            type: 'primary',
            class: 'su-from-select2',
            multiple: false,
            clearable: true,
            model: vm.object.su_from?.id || '',
            label: vm.object.su_from?.name ? vm.object.su_from?.name + `(${vm.object.su_from?.username})` : '-',
            ajax: {
              url: `/api/v1/accounts/accounts/su-from-accounts/?account=${vm.object.id}&fields_size=mini`,
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            },
            disabled: !vm.$hasPerm('accounts.change_account') ||
              !vm.object.asset.auto_config?.su_enabled
          },
          callbacks: Object.freeze({
            change: (value) => {
              const relationUrl = `/api/v1/accounts/accounts/${this.object.id}/`
              return this.$axios.patch(relationUrl, { su_from: value, name: this.object.name })
            }
          })
        }
      ],
      detail: {
        url: `/api/v1/accounts/accounts/${this.object.id}`,
        excludes: [
          'template', 'privileged', 'secret',
          'passphrase', 'spec_info', 'params'
        ],
        formatters: {
          asset: (item, value) => {
            return <span>{ value?.name }</span>
          },
          su_from: (item, value) => {
            return <span>{value?.name ? value?.name + `(${value?.username})` : ''}</span>
          }
        }
      }
    }
  },
  computed: {
    pushAccountMethod() {
      return this.object.asset?.auto_config?.push_account_method || ''
    }
  },
  methods: {
    onCanSetting(item) {
      this.needSetAutoPushParams = item
    },
    onSubmit(form) {
      this.$axios.post(
        `/api/v1/accounts/accounts/tasks/`,
        {
          action: 'push',
          accounts: [this.object.id],
          params: form
        }
      ).then(res => {
        openTaskPage(res['task'])
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
