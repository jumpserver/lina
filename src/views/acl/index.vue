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
            comment: '过滤命令',
            icon: 'filter'
          },
          {
            id: 'connect-asset',
            display_name: this.$t('UserLoginAclList'),
            name: 'AssetAclList',
            comment: '更改账号凭证，并推送到资产上',
            icon: 'connect'
          },
          {
            id: 'connect-method',
            display_name: this.$t('ConnectMethodAclList'),
            name: 'ConnectMethodAclList',
            comment: '采集资产上的账号信息',
            icon: 'client'
          },
          {
            id: 'UserLoginACL',
            display_name: this.$t('UserLoginAclList'),
            name: 'UserLoginAclList',
            comment: '备份账号到外部',
            icon: 'login'
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
