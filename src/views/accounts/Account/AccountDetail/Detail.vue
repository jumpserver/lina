<template>
  <div>
    <TwoCol>
      <AutoDetailCard v-bind="detail" :fields="detailFields" :object="object" />
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
        <ViewSecret
          v-if="showViewSecretDialog"
          v-model:visible="showViewSecretDialog"
          :account="object"
          :url="secretUrl"
        />
        <AutomationParamsForm
          v-model:visible="autoPushVisible"
          :has-button="false"
          :method="pushAccountMethod"
          @can-setting="onCanSetting"
          @submit="onSubmit"
        />
      </template>
    </TwoCol>
    <Drawer
      v-if="sourceTemplateVisible"
      v-model:visible="sourceTemplateVisible"
      :title="$t('AccountTemplate')"
      :component="sourceTemplateComponent"
      :component-props="sourceTemplateProps"
      :has-footer="false"
    />
    <el-drawer v-model="pamDrawerShow" :append-to-body="true" :with-header="false" size="50%">
      <component :is="drawerRefName" />
    </el-drawer>
  </div>
</template>

<script lang="jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import QuickActions from '@/components/Common/QuickActions/index.vue'
import ViewSecret from '@/components/Apps/AccountListTable/ViewSecret.vue'
import { openTaskPage } from '@/utils/jms/index'
import AutomationParamsForm from '@/views/assets/Platform/AutomationParamsSetting.vue'
import AssetDetail from '@/views/assets/Asset/AssetDetail'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import Drawer from '@/components/Drawer/index.vue'
export default {
  name: 'Detail',
  components: {
    Drawer,
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
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      sourceTemplateVisible: false,
      sourceTemplateProps: {},
      sourceTemplateComponent: () => import('@/views/accounts/AccountTemplate/Detail/index.vue'),
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
              this.$axios
                .patch(`/api/v1/accounts/accounts/${this.object.id}/`, {
                  is_active: val,
                  name: this.object.name
                })
                .then((res) => {
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
              this.$axios
                .patch(`/api/v1/accounts/accounts/${this.object.id}/`, {
                  name: this.object?.name,
                  privileged: val
                })
                .then((res) => {
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
            disabled:
              vm.object.secret_type?.value === 'ssh_certificate' ||
              !vm.$hasPerm('accounts.verify_account') ||
              !vm.object.asset.auto_config?.ansible_enabled ||
              !vm.object.asset.auto_config?.ping_enabled ||
              this.$store.getters.currentOrgIsRoot
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios
                .post(`/api/v1/accounts/accounts/tasks/`, {
                  action: 'verify',
                  accounts: [this.object.id]
                })
                .then((res) => {
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
            disabled:
              vm.object.secret_type?.value === 'ssh_certificate' ||
              !vm.$hasPerm('accounts.push_account') ||
              !vm.object.asset.auto_config?.push_account_enabled ||
              this.$store.getters.currentOrgIsRoot
          },
          callbacks: Object.freeze({
            click: () => {
              if (this.needSetAutoPushParams) {
                this.autoPushVisible = true
              } else {
                this.$axios
                  .post(`/api/v1/accounts/accounts/tasks/`, {
                    action: 'push',
                    accounts: [this.object.id]
                  })
                  .then((res) => {
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
            disabled:
              vm.object.secret_type?.value === 'ssh_certificate' ||
              !vm.$hasPerm('accounts.view_accountsecret')
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
            disabled:
              vm.object.secret_type?.value === 'ssh_certificate' ||
              !vm.$hasPerm('accounts.change_account')
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios
                .patch('/api/v1/accounts/accounts/clear-secret/', {
                  account_ids: [this.object.id]
                })
                .then(() => {
                  this.$message.success(this.$tc('ClearSuccessMsg'))
                  this.$store.commit('common/reload')
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
            label: vm.object.su_from?.name
              ? vm.object.su_from?.name + `(${vm.object.su_from?.username})`
              : this.$t('Select'),
            ajax: {
              url: `/api/v1/accounts/accounts/su-from-accounts/?account=${vm.object.id}&fields_size=mini`,
              transformOption: (item) => {
                return {
                  label: item.name + '(' + item.username + ')',
                  value: item.id
                }
              }
            },
            disabled:
              vm.object.secret_type?.value === 'ssh_certificate' ||
              !vm.$hasPerm('accounts.change_account') ||
              !vm.object.asset.auto_config?.su_enabled
          },
          callbacks: Object.freeze({
            change: (value) => {
              const relationUrl = `/api/v1/accounts/accounts/${this.object.id}/`
              return this.$axios.patch(relationUrl, {
                su_from: value,
                name: this.object.name
              })
            }
          })
        }
      ],
      detail: {
        url: `/api/v1/accounts/accounts/${this.object.id}`,
        excludes: ['template', 'privileged', 'secret', 'passphrase', 'spec_info', 'params'],
        formatters: {
          asset: (item, value) => {
            return <span>{value?.name}</span>
          },
          su_from: (item, value) => {
            return <span>{value?.name ? value?.name + `(${value?.username})` : ''}</span>
          }
        }
      }
    }
  },
  computed: {
    detailFields() {
      const isTemplate = (this.object.source?.value || this.object.source) === 'template'
      return Object.keys(this.object)
        .filter(
          (field) => field !== 'source_template' && (isTemplate || field !== 'follow_template')
        )
        .map((field) => {
          if (field === 'source_id' && isTemplate) {
            return {
              key: this.$t('SourceTemplate'),
              value: this.object.source_template,
              formatter: this.formatSourceTemplate
            }
          }
          if (field === 'secret_reset') {
            return { key: this.$t('SecretReset'), value: this.object.secret_reset }
          }
          if (field === 'follow_template') {
            return { key: this.$t('FollowTemplate'), value: this.object.follow_template }
          }
          return field
        })
    },
    pushAccountMethod() {
      return this.object.asset?.auto_config?.push_account_method || ''
    }
  },
  methods: {
    formatSourceTemplate(item, template) {
      if (!template) {
        return this.object.source_id ? (
          <span>
            {this.$t('SourceTemplateDeleted')} ({this.object.source_id})
          </span>
        ) : (
          <span>-</span>
        )
      }
      if (!this.$hasPerm('accounts.view_accounttemplate')) {
        return <span title={template.id}>{template.name}</span>
      }
      return (
        <el-link
          type="primary"
          underline="hover"
          title={template.id}
          onClick={() => this.openSourceTemplate(template)}
        >
          {template.name}
        </el-link>
      )
    },
    openSourceTemplate(template) {
      if (!template?.id || !this.$hasPerm('accounts.view_accounttemplate')) return
      this.sourceTemplateProps = {
        drawerContext: {
          isDrawer: true,
          action: 'detail',
          row: template,
          col: {},
          id: template.id,
          params: { id: template.id },
          query: {},
          routeName: 'AccountTemplateDetail'
        }
      }
      this.sourceTemplateVisible = true
    },
    onCanSetting(item) {
      this.needSetAutoPushParams = item
    },
    onSubmit(form) {
      this.$axios
        .post(`/api/v1/accounts/accounts/tasks/`, {
          action: 'push',
          accounts: [this.object.id],
          params: form
        })
        .then((res) => {
          openTaskPage(res['task'])
        })
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.su-from-select2) {
  width: min(220px, 100%);
}
</style>
