<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-if="!userReletionConfig.loading" v-bind="userReletionConfig" />
      <RelationCard v-if="!groupReletionConfig.loading" v-bind="groupReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'

export default {
  name: 'AssetPermissionUser',
  components: {
    ListTable,
    RelationCard
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/users/all/`,
        columns: [
          'user_display'
        ],
        columnsMeta: {
          user_display: {
            label: this.$t('perms.User')
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      },
      assetPermissionUser: [],
      assetPermissionUserGroup: [],
      userReletionConfig: {
        icon: 'fa-user',
        title: this.$t('perms.AddUserToAssetPermission'),
        url: '/api/v1/users/users/',
        value: [],
        loading: false
      },
      groupReletionConfig: {
        icon: 'fa-group',
        title: this.$t('perms.AddGroupToAssetPermission'),
        url: '/api/v1/users/groups/',
        value: [],
        loading: false
      }
    }
  },
  mounted() {
    // 获取用户组成员
  }
}
</script>

<style scoped>

</style>
