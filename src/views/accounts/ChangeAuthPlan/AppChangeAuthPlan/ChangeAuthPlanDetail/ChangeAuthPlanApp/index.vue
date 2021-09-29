<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <GenericListTable ref="listTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard type="info" style="margin-top: 15px" v-bind="systemuserRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import RelationCard from '@/components/RelationCard/index'
import { DeleteActionFormatter, DetailFormatter } from '@/components/TableFormatters'

export default {
  name: 'ChangeAuthPlanDatabase',
  components: {
    GenericListTable, RelationCard
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/xpack/change-auth-plan/app-plan/${this.object.id}/systemusers/`,
        columns: [
          'name', 'username', 'delete_action'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'SystemUserDetail'
            }
          },
          delete_action: {
            prop: 'id',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.system_users,
            formatter: DeleteActionFormatter,
            onDelete: function(col, row, cellValue, reload) {
              this.$axios.patch(
                `/api/v1/xpack/change-auth-plan/app-plan/${this.object.id}/systemusers/?action=remove`,
                { system_users: [row.id] }
              ).then(res => {
                this.$message.success(this.$t('common.deleteSuccessMsg'))
                reload()
              }).catch(error => {
                this.$message.error(this.$t('common.deleteErrorMsg') + ' ' + error)
              })
            }.bind(this)
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
        hasMoreActions: false
      },
      systemuserRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('xpack.ChangeAuthPlan.AddSystemUser'),
        objectsAjax: {
          url: `/api/v1/assets/system-users/?protocol=${this.object.type}`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        // hasObjectsId: this.object.systemuser,
        showHasObjects: false,
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/xpack/change-auth-plan/app-plan/${this.object.id}/systemusers/?action=add`
          const systemusers = items.map(v => v.value)
          const iHasObjects = that.iHasObjects.map(v => v.value)
          const data = {
            system_users: Array.from(new Set([...iHasObjects, ...systemusers]))
          }
          return this.$axios.patch(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          window.location.reload()
          this.$refs.listTable.$refs.ListTable.reloadTable()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
