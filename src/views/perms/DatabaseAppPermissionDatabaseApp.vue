<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-if="!databaseAppReletionConfig.loading" v-bind="databaseAppReletionConfig" />
      <RelationCard v-if="!systemUserReletionConfig.loading" v-bind="systemUserReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'

export default {
  name: 'DatabaseAppPermissionDatabaseApp',
  components: {
    ListTable,
    RelationCard
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/database-app-permissions/${this.$route.params.id}/database-apps/all/`,
        columns: [
          'databaseapp_display', 'delete_action'
        ],
        columnsMeta: {
          databaseapp_display: {
            label: this.$t('perms.DatabaseApp'),
            align: 'center'
          },
          delete_action: {
            prop: 'databaseapp',
            label: this.$tc('Action'),
            align: 'center',
            width: 150,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/database-app-permissions-database-apps-relations/?databaseapppermission=${this.$route.params.id}&databaseapp=`
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
      databaseAppPermissionDatabaseApp: [],
      databaseAppPermissionSystemUser: [],
      databaseAppReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add DatabaseApp to this permission'),
        url: '/api/v1/applications/database-apps/',
        value: [],
        loading: false
      },
      systemUserReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add System User to this permission'),
        url: '/api/v1/assets/system-users/',
        value: [],
        loading: false
      }
    }
  }
}
</script>

<style scoped>

</style>
