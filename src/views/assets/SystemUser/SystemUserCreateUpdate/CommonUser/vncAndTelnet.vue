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
  name: 'CommonUserVNC',
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
        [this.$t('common.Basic'), ['name', 'protocol', 'username', 'username_same_with_user']],
        [this.$t('common.Auth'), ['login_mode', 'password']],
        [this.$t('common.Other'), ['priority', 'comment']]
      ],
      fieldsMeta: {
        login_mode: fields.login_mode,
        username: fields.username,
        username_same_with_user: fields.username_same_with_user,
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
