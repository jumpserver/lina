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
  name: 'CommonUserDatabase',
  components: { GenericCreateUpdatePage },
  data() {
    const fields = getFields.bind(this)()
    return {
      initial: {
        login_mode: 'auto',
        protocol: this.$route.query.protocol,
        auto_generate_key: false,
        auto_push: false
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'login_mode', 'username', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['password']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        login_mode: fields.login_mode,
        username: fields.username,
        private_key: fields.private_key,
        protocol: fields.protocol,
        password: fields.password
      },
      url: '/api/v1/assets/system-users/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
