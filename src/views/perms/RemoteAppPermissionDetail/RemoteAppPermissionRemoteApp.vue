<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="remoteAppReletionConfig" />
      <RelationCard v-bind="systemUserReletionConfig" />
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
        icon: 'fa-info',
        title: this.$t('perms.Add RemoteApp to this permission'),
        objectsAjax: {
          url: '/api/v1/applications/remote-apps/'
        }
      },
      systemUserReletionConfig: {
        icon: 'fa-info',
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
          const relationUrl = `/api/v1/perms/remote-app-permissions-system-users-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              remoteapppermission: objectId,
              systemuser: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions-system-users-relations/?remoteapppermission=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
