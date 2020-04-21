<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      config: {
        initial: {
          password_strategy: 0,
          mfa_level: 0,
          source: 'local',
          role: 'Admin',
          date_expired: '2099-12-31 00:00:00 +0800'
        },
        url: '/api/v1/users/groups/',
        fields: ['name', 'users', 'comment'],
        fieldsMeta: {
          users: {
            el: {
              value: [],
              url: '/api/v1/users/users/'
            }
          }
        }
      }
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
