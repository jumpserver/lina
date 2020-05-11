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
        [this.$t('common.Other'), ['is_active', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/database-app-permissions/',
      fieldsMeta: {
        users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/',
              processResults(data) {
                let results = data.results
                results = results.map((item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
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
              url: '/api/v1/assets/system-users/',
              processResults(data) {
                let results = data.results
                results = results.filter((item) => item.protocol === 'mysql').map((item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
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
