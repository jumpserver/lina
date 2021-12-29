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
        [this.$t('common.Basic'), ['name', 'username', 'priority', 'protocol']],
        [this.$t('common.Auth'), ['login_mode', 'password']],
        [this.$t('common.Command filter'), ['cmd_filters']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        login_mode: fields.login_mode,
        username: fields.username,
        private_key: fields.private_key,
        protocol: fields.protocol,
        password: fields.password,
        cmd_filters: fields.cmd_filters
      },
      url: '/api/v1/assets/system-users/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
