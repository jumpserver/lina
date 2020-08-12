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
        [this.$t('perms.' + 'KubernetesApp'), ['k8s_apps', 'system_users']],
        [this.$t('common.Other'), ['is_active', 'date_start', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/k8s-app-permissions/',
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
        k8s_apps: {
          label: this.$t('perms.KubernetesApp'),
          el: {
            value: [],
            url: '/api/v1/applications/k8s-apps/'
          }
        },
        system_users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/system-users/?protocol=k8s'
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
