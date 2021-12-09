<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
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
import { DeleteActionFormatter } from '@/components/TableFormatters'

export default {
  name: 'ApplicationsPermission',
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
    const vm = this
    return {
      tableConfig: {
        url: `/api/v1/perms/application-permissions/${this.object.id}/applications/all/`,
        columns: [
          'application_display', 'delete_action'
        ],
        columnsMeta: {
          application_display: {
            label: this.$t('assets.Applications'),
            align: 'center'
          },
          delete_action: {
            prop: 'application',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.applications,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/application-permissions-applications-relations/?applicationpermission=${this.$route.params.id}&application=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false
      },
      remoteAppRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addApplicationToThisPermission'),
        disabled: this.$store.getters.currentOrgIsRoot,
        objectsAjax: {
          url: `/api/v1/applications/applications/?category=${this.object.category}&type=${this.object.type}`,
          transformOption: (item) => {
            return { label: item.name + ' (' + item.type_display + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.applications,
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/application-permissions-applications-relations/`
          const remoteAppId = items.map(v => v.value)
          const data = []
          for (const app of remoteAppId) {
            data.push({ applicationpermission: objectId, application: app })
          }
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
      systemUserRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addSystemUserToThisPermission'),
        objectsAjax: {
          url: vm.object.category === 'remote_app' ? `/api/v1/assets/system-users/?protocol=rdp` : `/api/v1/assets/system-users/?protocol=${vm.object.type}`,
          transformOption: (item) => {
            return { label: item.name + ' (' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/application-permissions/${objectId}/`
          const objectRelationSystemUsers = this.object.system_users
          items.map(v => objectRelationSystemUsers.push(v.value))
          const data = { system_users: objectRelationSystemUsers }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$tc('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        },
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/application-permissions/${objectId}/`
          const objectOldRelationSystemUsers = this.object.system_users
          const objectNewRelationSystemUsers = objectOldRelationSystemUsers.filter(v => v !== item.value)
          if (objectNewRelationSystemUsers.length === 0) {
            this.$message.error(this.$tc('common.lastCannotBeDeleteMsg'))
            return
          }
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
          this.$refs.ListTable.reloadTable()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
