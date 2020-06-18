<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import AssetPermissionFormActionField from './components/AssetPermissionFormActionField'
import AssetSelect from '@/components/AssetSelect'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node']) {
      nodesInitial.push(this.$route.query.node)
    }
    const assetsInitial = []
    if (this.$route.query['asset']) {
      assetsInitial.push(this.$route.query.asset)
    }
    return {
      initial: {
        is_active: true,
        actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file'],
        date_start: this.$moment().format('YYYY-MM-DD HH:mm:ss ZZ'),
        date_expired: '2099-12-31 00:00:00 +0800',
        nodes: nodesInitial,
        assets: assetsInitial
      },
      fields: [
        [this.$t('perms.Basic'), ['name']],
        [this.$t('perms.User'), ['users', 'user_groups']],
        [this.$t('perms.Asset'), ['assets', 'nodes', 'system_users']],
        [this.$t('common.action'), ['actions']],
        [this.$t('common.Other'), ['is_active', 'date_start', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/asset-permissions/',
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
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('perms.Asset'),
          rules: [{
            required: false
          }],
          el: {
            value: []
          }
        },
        nodes: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          }
        },
        system_users: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/system-users/',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        },
        actions: {
          label: this.$t('perms.Actions'),
          component: AssetPermissionFormActionField
        },
        date_start: {
          label: this.$t('common.dateStart')
        },
        date_expired: {
          label: this.$t('common.dateExpired')
        },
        comment: {
          label: this.$t('common.Comment')
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
