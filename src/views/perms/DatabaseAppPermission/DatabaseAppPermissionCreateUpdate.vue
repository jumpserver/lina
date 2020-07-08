<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getDayFuture } from '@/utils/common'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        date_start: new Date().toISOString(),
        date_expired: getDayFuture(36500, new Date()).toISOString()
      },
      fields: [
        [this.$t('common.' + 'Basic'), ['name']],
        [this.$t('perms.' + 'User'), ['users', 'user_groups']],
        [this.$t('perms.' + 'databaseApp'), ['database_apps', 'system_users']],
        [this.$t('common.Other'), ['is_active', 'date_start', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/database-app-permissions/',
      fieldsMeta: {
        users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
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
            ajax: {
              url: '/api/v1/assets/system-users/?protocol=mysql'
            }
          }
        },
        date_start: {
          label: this.$t('common.dateStart')
        },
        date_expired: {
          label: this.$t('common.dateExpired')
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
