<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { AssetSelect } from '@/components'

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
        [this.$tco('Action'), ['actions']],
        [this.$tco('Other'), ['is_active', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/asset-permissions/',
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
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('perms.Asset'),
          rules: [{
            required: false
          }]
        },
        nodes: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              processResults(data) {
                let results = data.results
                results = results.map((item) => {
                  return { label: item.full_value, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
        system_users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/system-users/',
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
