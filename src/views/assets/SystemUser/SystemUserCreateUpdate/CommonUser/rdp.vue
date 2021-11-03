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
import getFields from '../fields'

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
        auto_push: false,
        sudo: '/bin/whoami',
        shell: '/bin/bash'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'protocol', 'username', 'username_same_with_user']],
        [this.$t('common.Auth'), ['login_mode', 'password', 'ad_domain']],
        [this.$t('assets.AutoPush'), ['auto_push', 'system_groups']],
        [this.$t('common.Other'), ['priority', 'comment']]
      ],
      fieldsMeta: {
        login_mode: fields.login_mode,
        username: fields.username,
        username_same_with_user: fields.username_same_with_user,
        auto_push: fields.auto_push,
        protocol: fields.protocol,
        ad_domain: {
          label: this.$t('assets.AdDomain'),
          helpText: this.$t('assets.AdDomainHelpText')
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
