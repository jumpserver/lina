<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="userRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="groupRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
import { DeleteActionFormatter } from '@/components/TableFormatters'

export default {
  name: 'AssetPermissionUser',
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
        url: `/api/v1/perms/asset-permissions/${this.object.id}/users/all/`,
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
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.users,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/asset-permissions-users-relations/?assetpermission=${this.object.id}&user=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasMoreActions: false
      },
      userRelationConfig: {
        icon: 'fa-user',
        title: this.$t('perms.addUserToThisPermission'),
        objectsAjax: {
          url: '/api/v1/users/users/?fields_size=mini&order=name',
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        showHasMore: false,
        hasObjectsId: this.object.users,
        showHasObjects: false,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-users-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              assetpermission: objectId
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      },
      groupRelationConfig: {
        icon: 'fa-group',
        title: this.$t('perms.addUserGroupToThisPermission'),
        objectsAjax: {
          url: '/api/v1/users/groups/'
        },
        hasObjectsId: this.object.user_groups,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/asset-permissions-user-groups-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              assetpermission: objectId,
              usergroup: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const itemId = item.value
          const relationUrl = `/api/v1/perms/asset-permissions-user-groups-relations/?assetpermission=${objectId}&usergroup=${itemId}`
          return this.$axios.delete(relationUrl)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        },
        onDeleteSuccess: (obj, that) => {
          const theRemoveIndex = that.iHasObjects.findIndex((v) => v.value === obj.value)
          that.iHasObjects.splice(theRemoveIndex, 1)
          while (that.select2.disabledValues.indexOf(obj.value) !== -1) {
            const i = that.select2.disabledValues.indexOf(obj.value)
            this.$log.debug('disabled values remove index: ', i)
            that.select2.disabledValues.splice(i, 1)
          }
          this.$message.success(this.$t('common.deleteSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
