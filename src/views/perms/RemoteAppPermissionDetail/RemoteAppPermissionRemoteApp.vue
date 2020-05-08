<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="remoteAppReletionConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="systemUserReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'

export default {
  name: 'RemoteAppPermissionUser',
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
        url: `/api/v1/perms/remote-app-permissions/${this.object.id}/remote-apps/all/`,
        columns: [
          // 'remote_app_display'
        ],
        columnsMeta: {
          // asset_display: {
          //   label: this.$t('perms.RemoteApp')
          // }
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
      remoteAppReletionConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.Add RemoteApp to this permission'),
        objectsAjax: {
          url: '/api/v1/applications/remote-apps/'
        },
        hasObjectsId: this.object.remote_apps,
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          console.log('this.object===', this.object)
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/remote-apps/add/`
          const remoteAppId = items.map(v => v.value)
          const data = { remote_apps: remoteAppId }
          const res = this.$axios.patch(relationUrl, data)
          this.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
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
            results = results.filter((item) => item.protocol === 'rdp').map((item) => {
              return { label: item.name + '(' + item.username + ')', value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/`
          const objectRelationSystemUsers = this.object.system_users
          items.map(v => objectRelationSystemUsers.push(v.value))
          const data = { system_users: objectRelationSystemUsers }
          return this.$axios.patch(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/`
          const objectOldRelationSystemUsers = this.object.system_users
          const objectNewRelationSystemUsers = objectOldRelationSystemUsers.filter(v => v !== item.value)
          const data = { system_users: objectNewRelationSystemUsers }
          return this.$axios.patch(relationUrl, data)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
