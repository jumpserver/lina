<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="userReletionConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="groupReletionConfig" />
    </el-col>
  </el-row>

</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'

export default {
  name: 'DatabaseAppPermissionUser',
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
      tableConfig: {
        url: `/api/v1/perms/database-app-permissions/${this.object.id}/users/all/`,
        columns: [
          'user_display', 'delete_action'
        ],
        columnsMeta: {
          user_display: {
            label: this.$t('perms.User'),
            align: 'center'
          },
          delete_action: {
            prop: 'user',
            label: this.$tco('Action'),
            align: 'center',
            width: 150,
            objects: this.object.users,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/database-app-permissions-users-relations/?databaseapppermission=${this.object.id}&user=`
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
      userReletionConfig: {
        icon: 'fa-user',
        title: this.$t('perms.Add user to this permission'),
        objectsAjax: {
          url: '/api/v1/users/users/',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.users,
        showHasObjects: false,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/database-app-permissions-users-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              databaseapppermission: objectId,
              user: v.value
            }
          })
          const res = this.$axios.post(relationUrl, data)
          this.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
          return res
        }
      },
      groupReletionConfig: {
        icon: 'fa-group',
        title: this.$t('perms.Add user group to this permission'),
        objectsAjax: {
          url: '/api/v1/users/groups/'
        },
        hasObjectsId: this.object.user_groups,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/database-app-permissions-user-groups-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              databaseapppermission: objectId,
              usergroup: v.value
            }
          })
          const res = this.$axios.post(relationUrl, data)
          this.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
          return res
        },
        performDelete: (item) => {
          // const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/database-app-permissions-user-groups-relations/?databaseapppermission=${objectId}`
          // const relationUrl = `/api/v1/perms/database-app-permissions-user-groups-relations/?databaseapppermission=${objectId}&usergroups=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
