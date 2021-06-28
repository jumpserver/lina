<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import getFields from './fields'

export default {
  name: 'SystemUserCreateUpdate',
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
        sftp_root: 'tmp',
        sudo: '/bin/whoami',
        shell: '/bin/bash'
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$t('assets.AutoPush'), ['auto_push', 'system_groups']],
        [this.$t('common.Auth'), ['update_password', 'password', 'ad_domain']],
        [this.$t('common.Other'), ['comment']]
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
        update_password: fields.update_password,
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
