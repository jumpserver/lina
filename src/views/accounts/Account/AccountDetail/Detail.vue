<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :object="object" v-bind="detail" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
      <ViewSecret
        v-if="showViewSecretDialog"
        :account="object"
        :url="secretUrl"
        :visible.sync="showViewSecretDialog"
      />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import QuickActions from '@/components/QuickActions'
import ViewSecret from '@/components/AccountListTable/ViewSecret'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    QuickActions,
    ViewSecret
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    const filterSuFrom = ['database', 'device', 'cloud', 'web']

    return {
      secretUrl: `/api/v1/accounts/account-secrets/${this.object.id}/`,
      showViewSecretDialog: false,
      quickActions: [
        {
          title: this.$t('common.Activate'),
          type: 'switcher',
          attrs: {
            model: vm.object.is_active,
            disabled: !vm.$hasPerm('accounts.change_account')
          },
          callbacks: Object.freeze({
            change: (val) => {
              this.$axios.patch(
                `/api/v1/accounts/accounts/${this.object.id}/`,
                { is_active: val }
              ).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('assets.Privileged'),
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
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('assets.TestAccountConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test'),
            disabled: (
              !vm.$hasPerm('accounts.verify_account') ||
              !vm.object.asset.auto_info?.ansible_enabled ||
              !vm.object.asset.auto_info?.ping_enabled ||
              this.$store.getters.currentOrgIsRoot
            )
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/accounts/accounts/tasks/`,
                {
                  action: 'test',
                  accounts: [this.object.id]
                }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          })
        },
        {
          title: this.$t('assets.PushAccount'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Push'),
            disabled: (
              !vm.$hasPerm('accounts.push_account') ||
              !vm.object.asset.auto_info?.push_account_enabled ||
              this.$store.getters.currentOrgIsRoot
            )
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/accounts/accounts/tasks/`,
                { action: 'push', accounts: [this.object.id] }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          })
        },
        {
          title: this.$t('common.ViewSecret'),
          attrs: {
            type: 'primary',
            label: this.$t('common.View'),
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
          title: this.$t('assets.UserSwitchFrom'),
          type: 'updateSelect',
          attrs: {
            type: 'primary',
            class: 'su-from-select2',
            multiple: false,
            clearable: true,
            model: vm.object.su_from?.id || '',
            label: vm.object.su_from?.name ? vm.object.su_from?.name + `(${vm.object.su_from?.username})` : '',
            ajax: {
              url: `/api/v1/accounts/accounts/su-from-accounts/?account=${vm.object.id}&fields_size=mini`,
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            },
            disabled: !vm.$hasPerm('accounts.verify_account') || filterSuFrom.includes(vm.object?.asset?.category?.value)
          },
          callbacks: Object.freeze({
            change: (value) => {
              const relationUrl = `/api/v1/accounts/accounts/${this.object.id}/`
              return this.$axios.patch(relationUrl, { su_from: value })
            }
          })
        }
      ],
      detail: {
        url: `/api/v1/accounts/accounts/${this.object.id}`,
        excludes: [
          'template', 'privileged', 'secret',
          'passphrase', 'spec_info'
        ],
        formatters: {
          asset: (item, value) => {
            const route = {
              name: 'AssetDetail',
              params: { id: this.object.asset.id }
            }
            return <router-link to={route} >{ value }</router-link>
          }
        }
      }
    }
  },
  computed: {
  }
}
</script>

<style lang="scss" scoped>
</style>
