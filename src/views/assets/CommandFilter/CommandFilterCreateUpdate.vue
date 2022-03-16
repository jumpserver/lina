<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import AssetSelect from '@/components/AssetSelect/index'
export default {
  name: 'CommandFilterCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      initial: {

      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('common.Correlation'), ['users', 'user_groups', 'assets', 'applications', 'system_users']],
        [this.$t('common.Other'), ['is_active', 'comment']]
      ],
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
        applications: {
          label: this.$t('assets.Applications'),
          el: {
            value: [],
            ajax: {
              url: `/api/v1/applications/applications/?category__in=db,cloud`,
              transformOption: (item) => {
                return { label: item.name + ' (' + item.type_display + ')', value: item.id }
              }
            }
          }
        },
        system_users: {
          el: {
            value: [],
            ajax: {
              url: `/api/v1/assets/system-users/?protocol__in=ssh,telnet,mysql,postgresql,mariadb,oracle,sqlserver,k8s`,
              transformOption: (item) => {
                if (this.$route.query.type === 'k8s') {
                  return { label: item.name, value: item.id }
                }
                const username = item.username || '*'
                return { label: item.name + '(' + username + ')', value: item.id }
              }
            }
          }
        }

      },
      url: '/api/v1/assets/cmd-filters/'
    }
  }
}
</script>

<style lang='less' scoped>

</style>
