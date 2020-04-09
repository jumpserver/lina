<template>
  <GenericCreateUpdatePage :fields="fields" :form="form" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      form: {
        is_active: true,
        date_expired: '2099-12-31 00:00:00 +0800'
      },
      fields: [
        [this.$t('perms.' + 'Basic'), ['name']],
        [this.$t('perms.' + 'User'), ['users', 'user_groups']],
        [this.$t('perms.' + 'Asset'), ['assets', 'nodes', 'system_users']],
        [this.$tc('Action'), ['actions']],
        [this.$tc('Other'), ['is_active', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/asset-permissions/',
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
        assets: {
          el: {
            value: [],
            url: '/api/v1/assets/nodes/children/tree/'
          }
        },
        nodes: {
          el: {
            value: [],
            url: '/api/v1/assets/nodes/'
          }
        },
        system_users: {
          el: {
            value: [],
            url: '/api/v1/assets/system-users/'
          }
        },
        actions: {
          label: this.$t('perms.Actions'),
          type: 'checkbox-group',
          default: ['all', 'connect', 'updownload', 'upload_file', 'download_file'],
          options: [
            { label: 'all' },
            { label: 'connect' },
            { label: 'updownload' },
            { label: 'upload_file' },
            { label: 'download_file' }
          ]
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
