<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="k8sAppRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
import { DeleteActionFormatter } from '@/components/ListTable/formatters/index'

export default {
  name: 'KubernetesAppPermissionKubernetesApp',
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
        url: `/api/v1/perms/k8s-app-permissions/${this.object.id}/k8s-apps/all/`,
        columns: [
          'k8sapp_display', 'delete_action'
        ],
        columnsMeta: {
          k8sapp_display: {
            label: this.$t('perms.KubernetesApp'),
            align: 'center'
          },
          delete_action: {
            prop: 'k8sapp',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.k8s_apps,
            formatter: DeleteActionFormatter,
            deleteUrl: `/api/v1/perms/k8s-app-permissions-k8s-apps-relations/?k8sapppermission=${this.$route.params.id}&k8sapp=`
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: true,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false
      },
      k8sAppRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addK8sAppToThisPermission'),
        objectsAjax: {
          url: '/api/v1/applications/k8s-apps/'
        },
        hasObjectsId: this.object.k8s_apps,
        showHasObjects: false,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/k8s-app-permissions-k8s-apps-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              k8sapppermission: objectId,
              k8sapp: v.value
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
      systemUserRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addSystemUserToThisPermission'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/',
          processResults(data) {
            let results = data.results
            results = results.filter((item) => item.protocol === 'k8s').map((item) => {
              return { label: item.name, value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          const relationUrl = `/api/v1/perms/k8s-app-permissions-system-users-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              k8sapppermission: objectId,
              systemuser: v.value
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
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/k8s-app-permissions-system-users-relations/?k8sapppermission=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
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
