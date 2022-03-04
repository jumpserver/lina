<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <ListTable
        ref="ListTable"
        :table-config="tableConfig"
        :header-actions="headerActions"
      />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard ref="userRelation" v-bind="relationConfig" />
    </el-col>
  </el-row>
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
      required: true
    }
  },
  data() {
    return {
      loading: true,
      relationConfig: {
        icon: 'fa-user',
        title: this.$t('common.Members'),
        objectsAjax: {
          url: `/api/v1/users/users/?fields_size=mini&order=name${this.object.scope === 'system' ? '&oid=root' : ''}`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        performAdd: (items) => {
          const relationUrl = `/api/v1/rbac/${this.object.scope}-role-bindings/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              role: objectId,
              scope: this.object.scope
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: () => {
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
          this.$refs.userRelation.$refs.select2.clearSelected()
        }
      },
      tableConfig: {
        url: `/api/v1/rbac/${this.object.scope}-role-bindings/?role=${this.object.id}`,
        columns: ['user_display', 'actions'],
        columnsShow: {
          min: ['user_display', 'actions']
        },
        columnsMeta: {
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              canDelete: ({ row }) => {
                return this.$hasPerm(`rbac.delete_${row.scope}rolebinding`)
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        searchConfig: {
          exclude: ['scope', 'role', 'org']
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
