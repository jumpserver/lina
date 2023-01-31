<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :excludes="excludes" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
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
    return {
      quickActions: [
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
                `/api/v1/accounts/accounts/${this.object.id}/verify/`,
                { action: 'test' }
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
              url: `/api/v1/accounts/accounts/${vm.object.id}/su-from-accounts/?fields_size=mini`,
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            },
            disabled: !vm.$hasPerm('accounts.change_account')
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

<style scoped lang="scss">
</style>
