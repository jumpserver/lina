<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="databaseAppReletionConfig" />
      <RelationCard v-bind="systemUserReletionConfig" />
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
        },
        tableAttrs: {
          border: false
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
        objectsAjax: {
          url: '/api/v1/applications/database-apps/'
        }
      },
      systemUserReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add System User to this permission'),
        objectsAjax: {
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
    }
  }
}
</script>

<style scoped>

</style>
