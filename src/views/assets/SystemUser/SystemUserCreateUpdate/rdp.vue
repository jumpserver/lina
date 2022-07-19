<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
    v-bind="$attrs"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import getFields from './fields'

export default {
  name: 'CommonUserRDP',
  components: { GenericCreateUpdatePage },
  data() {
    const fields = getFields.bind(this)()
    return {
      initial: {
        login_mode: 'auto',
        protocol: this.$route.query.protocol,
        username_same_with_user: false,
        auto_generate_key: false,
        auto_push_account: false,
        shell: '/bin/bash'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'protocol', 'username', 'username_same_with_user']],
        [this.$t('assets.Account'), [
          'login_mode', 'account_template_enabled',
          'auto_generate_key', 'password',
          'auto_push_account', 'system_groups',
          'ad_domain'
        ]],
        [this.$t('common.Other'), ['priority', 'comment']]
      ],
      fieldsMeta: {
        login_mode: fields.login_mode,
        auto_generate_key: fields.auto_generate_key,
        account_template_enabled: fields.account_template_enabled,
        username: fields.username,
        username_same_with_user: fields.username_same_with_user,
        auto_push_account: fields.auto_push_account,
        protocol: fields.protocol,
        ad_domain: {
          label: this.$t('assets.AdDomain'),
          helpText: this.$t('assets.AdDomainHelpText'),
          hidden: (item) => item.protocol !== 'ssh' || !item.auto_push_account
        },
        password: fields.password,
        system_groups: fields.system_groups
      },
      url: '/api/v1/assets/system-users/'
    }
  },
  method: {
  }
}
</script>

<style lang='less' scoped>

</style>
