<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" v-loading="loading" :table-config="tableConfig" :header-actions="headerActions" />
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
      loading: false,
      tableConfig: {
        url: `/api/v1/perms/remote-app-permissions/${this.object.id}/users/all/`,
        columns: [
          // 'user_display'
        ],
        columnsMeta: {
          // user_display: {
          //   label: this.$t('perms.User')
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
      userReletionConfig: {
        icon: 'fa-user',
        title: this.$t('perms.addUserToThisPermission'),
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
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/users/add/`
          const usersId = items.map(v => v.value)
          const data = { users: usersId }
          this.loading = true
          const that = this
          const res = this.$axios.patch(relationUrl, data)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        }
      },
      groupReletionConfig: {
        icon: 'fa-group',
        title: this.$t('perms.addUserGroupToThisPermission'),
        objectsAjax: {
          url: '/api/v1/users/groups/'
        },
        hasObjectsId: this.object.user_groups,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/`
          const objectRelationUserGroups = this.object.user_groups
          items.map(v => objectRelationUserGroups.push(v.value))
          const data = { user_groups: objectRelationUserGroups }
          this.loading = true
          const that = this
          const res = this.$axios.patch(relationUrl, data)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/`
          const objectOldRelationUserGroups = this.object.user_groups
          const objectNewRelationUserGroups = objectOldRelationUserGroups.filter(v => v !== item.value)
          const data = { user_groups: objectNewRelationUserGroups }
          this.loading = true
          const that = this
          const res = this.$axios.patch(relationUrl, data)
          setTimeout(function() {
            that.$refs.listTable.$refs.dataTable.$refs.dataTable.$refs.table.getList()
            that.loading = false
          }, 500)
          return res
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
