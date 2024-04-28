<template>
  <Page>
    <CardTable ref="CardTable" v-bind="$data" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import CardTable from '@/components/Table/CardTable'

export default {
  name: 'ACLs',
  components: {
    CardTable,
    Page
  },
  data() {
    return {
      pagination: false,
      tableConfig: {
        totalData: [
          {
            id: 'command-filter',
            display_name: this.$t('CommandFilterACL'),
            name: 'CommandFilterAclList',
            comment: this.$t('CommandFilterACLHelpText'),
            icon: 'filter',
            tags: ['command']
          },
          {
            id: 'connect-asset',
            display_name: this.$t('AssetAclList'),
            name: 'AssetAclList',
            comment: this.$t('AssetLoginACLHelpText'),
            icon: 'assets',
            edition: 'enterprise',
            tags: ['asset']
          },
          {
            id: 'connect-method',
            display_name: this.$t('ConnectMethodAclList'),
            name: 'ConnectMethodAclList',
            comment: this.$t('ConnectMethodACLHelpText'),
            icon: 'client',
            edition: 'enterprise',
            tags: ['client', 'cli']
          },
          {
            id: 'UserLoginACL',
            display_name: this.$t('UserLoginAclList'),
            name: 'UserLoginAclList',
            comment: this.$t('UserLoginACLHelpText'),
            icon: 'login',
            edition: 'enterprise',
            tags: ['login']
          }
        ],
        onView: (item) => {
          this.$router.push({ name: item.name })
        }
      },
      headerActions: {
        hasSearch: false,
        hasLeftActions: false,
        hasRightActions: false
      }
    }
  },
  methods: {
    handleUpload(res) {
      this.$refs.CardTable.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
>>> .image img {
  width: 40px;
  height: 40px
}
</style>
