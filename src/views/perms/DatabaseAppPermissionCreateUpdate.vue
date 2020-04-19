<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        date_expired: '2099-12-31 00:00:00 +0800'
      },
      fields: [
        [this.$t('perms.' + 'Basic'), ['name']],
        [this.$t('perms.' + 'User'), ['users', 'user_groups']],
        [this.$t('perms.' + 'DatabaseApp'), ['database_apps', 'system_users']],
        [this.$tc('Other'), ['is_active', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/database-app-permissions/',
      fieldsMeta: {
        users: {
          el: {
            value: [],
            url: '/api/v1/users/users/'
          }
        },
        user_groups: {
          el: {
            value: [],
            url: '/api/v1/users/groups/'
          }
        },
        database_apps: {
          el: {
            value: [],
            url: '/api/v1/applications/database-apps/'
          }
        },
        system_users: {
          el: {
            value: [],
            url: '/api/v1/assets/system-users/'
          }
        },
        actions: {
          label: this.$t('perms.Actions')
        },
        is_active: {
          type: 'checkbox'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
