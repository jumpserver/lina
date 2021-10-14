<template>
  <div>
    <el-row :gutter="24">
      <el-col :span="16">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :span="8">
        <RelationCard type="primary" v-bind="userRelationConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ListTable, RelationCard } from '@/components'

export default {
  components: {
    ListTable,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      userRelationConfig: {
        icon: 'fa-group',
        title: this.$t('users.UserGroups'),
        objectsAjax: {
          url: `/api/v1/assets/assets/${this.object.id}/perm-user-groups/`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.groups,
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
      tableConfig: {
        url: `/api/v1/assets/assets/${this.object.id}/perm-users/`,
        columns: ['name', 'username', 'is_valid', 'created_by', 'comment'],
        columnsShow: {
          default: ['name', 'username', 'is_valid'],
          min: ['name']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'UserDetail'
            }
          },
          users_amount: {
            label: this.$t('users.Users'),
            width: '120px'
          }
        },
        detailRoute: 'UserDetail'
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
