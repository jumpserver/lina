<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="primary" v-bind="databaseAppRelationConfig" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
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
      tableConfig: {
        url: `/api/v1/perms/database-app-permissions/${this.object.id}/database-apps/all/`,
        columns: [
          'databaseapp_display', 'delete_action'
        ],
        columnsMeta: {
          databaseapp_display: {
            label: this.$t('perms.databaseApp'),
            align: 'center'
          },
          delete_action: {
            prop: 'databaseapp',
            label: this.$t('common.Actions'),
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
        hasSearch: false,
        hasLeftActions: false,
        hasRightActions: false
      },
      databaseAppRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('perms.addDatabaseAppToThisPermission'),
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
          return this.$axios.post(relationUrl, data)
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
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          setTimeout(() => location.reload(), 300)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/perms/database-app-permissions-system-users-relations/?databaseapppermission=${objectId}&systemuser=${itemId}`
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
          setTimeout(() => location.reload(), 300)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
