<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import QuickActions from '@/components/QuickActions'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    QuickActions
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
            disabled: !vm.$hasPerm('assets.test_account')
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
            disabled: !vm.$hasPerm('accounts.create_account')
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/accounts/accounts/tasks/`,
                { action: 'verify', accounts: [this.object.id] }
              ).then(res => {
                openTaskPage(res['task'])
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
            disabled: !vm.$hasPerm('assets.test_account') || filterSuFrom.includes(vm.object?.asset?.category?.value)
          },
          callbacks: Object.freeze({
            change: (value) => {
              const relationUrl = `/api/v1/accounts/accounts/${this.object.id}/`
              return this.$axios.patch(relationUrl, { su_from: value })
            }
          })
        }
      ],
      url: `/api/v1/accounts/accounts/${this.object.id}`,
      excludes: [
        'asset', 'template', 'privileged', 'secret',
        'passphrase', 'specific'
      ]
    }
  },
  computed: {
  }
}
</script>

<style lang="scss" scoped>
</style>
