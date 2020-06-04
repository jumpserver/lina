<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="remoteAppRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'

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
          'remoteapp_display', 'delete_action'
        ],
        columnsMeta: {
          remoteapp_display: {
            label: this.$t('perms.remoteApp'),
            align: 'center'
          },
          delete_action: {
            prop: 'remoteapp',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.remote_apps,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/remote-app-permissions-remote-apps-relations/?remoteapppermission=${this.$route.params.id}&remoteapp=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: false,
        hasLeftActions: false,
        hasRightActions: false
      },
      remoteAppRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addRemoteAppToThisPermission'),
        objectsAjax: {
          url: '/api/v1/applications/remote-apps/'
        },
        hasObjectsId: this.object.remote_apps,
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/remote-apps/add/`
          const remoteAppId = items.map(v => v.value)
          const data = { remote_apps: remoteAppId }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          setTimeout(() => location.reload(), 300)
        }
      },
      systemUserRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addSystemUserToThisPermission'),
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
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          setTimeout(() => location.reload(), 300)
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/remote-app-permissions/${objectId}/`
          const objectOldRelationSystemUsers = this.object.system_users
          const objectNewRelationSystemUsers = objectOldRelationSystemUsers.filter(v => v !== item.value)
          const data = { system_users: objectNewRelationSystemUsers }
          return this.$axios.patch(relationUrl, data)
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
          setTimeout(() => location.reload(), 300)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
