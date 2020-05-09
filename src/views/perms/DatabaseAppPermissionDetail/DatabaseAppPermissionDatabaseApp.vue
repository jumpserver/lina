<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" v-loading="loading" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="databaseAppReletionConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="systemUserReletionConfig" />
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
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      tableConfig: {
        url: `/api/v1/perms/database-app-permissions/${this.object.id}/database-apps/all/`,
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
            label: this.$ttc('action'),
            align: 'center',
            width: 150,
            objects: this.object.database_apps,
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
      databaseAppReletionConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.Add DatabaseApp to this permission'),
        objectsAjax: {
          url: '/api/v1/applications/database-apps/'
        },
        hasObjectsId: this.object.database_apps,
        showHasObjects: false,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/database-app-permissions-database-apps-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              databaseapppermission: objectId,
              databaseapp: v.value
            }
          })
          this.loading = true
          const that = this
          const res = this.$axios.post(relationUrl, data)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        }
      },
      systemUserReletionConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.Add System User to this permission'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/',
          processResults(data) {
            let results = data.results
            results = results.filter((item) => item.protocol === 'mysql').map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/database-app-permissions-system-users-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              databaseapppermission: objectId,
              systemuser: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/database-app-permissions-system-users-relations/?databaseapppermission=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
