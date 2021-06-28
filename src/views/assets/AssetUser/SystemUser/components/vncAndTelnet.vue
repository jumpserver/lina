<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import getFields from '@/views/assets/AssetUser/SystemUser/components/fields'

// const asciiProtocols = ['ssh', 'telnet', 'mysql']

export default {
  name: 'SystemUserCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    const fields = getFields.bind(this)()
    return {
      initial: {
        login_mode: 'auto',
        protocol: this.$route.query.protocol,
        username_same_with_user: false
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'login_mode', 'username', 'username_same_with_user', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['update_password', 'password']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        login_mode: fields.login_mode,
        username: fields.username,
        username_same_with_user: fields.username_same_with_user,
        protocol: fields.protocol,
        update_password: fields.update_password,
        password: fields.password
      },
      url: '/api/v1/assets/system-users/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
