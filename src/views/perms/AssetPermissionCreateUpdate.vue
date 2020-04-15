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
        actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file'],
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
          options: [
            { label: 'all', value: this.$t('perms.All') },
            { label: 'connect', value: this.$t('perms.Connect') },
            { label: 'updownload', value: this.$t('perms.UpDownload') },
            { label: 'upload_file', value: this.$t('perms.UploadFile') },
            { label: 'download_file', value: this.$t('perms.DownloadFile') }
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
