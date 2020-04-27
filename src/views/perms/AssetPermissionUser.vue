<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard v-bind="userReletionConfig" />
      <RelationCard v-bind="groupReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import { RelationCard } from '@/components'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'

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
          'user_display', 'delete_action'
        ],
        columnsMeta: {
          user_display: {
            label: this.$t('perms.User'),
            align: 'center'
          },
          delete_action: {
            prop: 'user',
            label: this.$tc('Action'),
            align: 'center',
            width: 150,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/asset-permissions-users-relations/?assetpermission=${this.$route.params.id}&user=`
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
      assetPermissionUser: [],
      assetPermissionUserGroup: [],
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
        performAdd: (items) => {
          console.log('item=====', items)
          const relationUrl = `/api/v1/perms/asset-permissions-users-relations/`
          const objectId = this.$route.params.id
          console.log('objectId====', objectId)
          const data = items.map(v => {
            return {
              user: v.value,
              assetpermission: objectId
            }
          })
          return this.$axios.post(relationUrl, data)
        }
      },
      groupReletionConfig: {
        icon: 'fa-group',
        title: this.$t('perms.Add user group to this permission'),
        objectsAjax: {
          url: '/api/v1/users/groups/'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
