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
      <RelationCard v-if="!loading" ref="userRelation" v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { ListTable, RelationCard } from '@/components'
import { mapGetters } from 'vuex'

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
        disabled: !this.$hasPerm(`rbac.add_${this.object.scope.value}rolebinding`),
        icon: 'fa-user',
        title: this.$t('common.Members'),
        objectsAjax: {
          url: `/api/v1/users/users/?fields_size=mini&order=name${this.object.scope.value === 'system' ? '&oid=root' : ''}`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        performAdd: (items) => {
          const relationUrl = `/api/v1/rbac/${this.object.scope.value}-role-bindings/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              role: objectId,
              scope: this.object.scope.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: () => {
          this.$message.success(this.$tc('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
          this.$refs.userRelation.$refs.select2.clearSelected()
        }
      },
      tableConfig: {
        url: `/api/v1/rbac/${this.object.scope.value}-role-bindings/?role=${this.object.id}`,
        columns: this.object.scope.value === 'system' ? ['user_display', 'actions'] : ['user_display', 'org_name', 'actions'],
        columnsShow: {
          min: ['user_display', 'actions']
        },
        columnsMeta: {
          user_display: {
            label: this.$t('users.Name'),
            formatter: (row) => {
              return row.user.name
            }
          },
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
        importOptions: {
          canImportUpdate: false
        },
        searchConfig: {
          exclude: ['user', 'scope', 'role', 'org'],
          options: [
            {
              label: this.$t('users.Username'),
              value: 'user__username'
            },
            {
              label: this.$t('perms.User'),
              value: 'user__name'
            }
          ]
        }
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrg', 'currentOrgIsRoot'])
  },
  created() {
    try {
      const scope = this.$route.query['scope']
      this.relationConfig.disabled = !this.$hasPerm(`rbac.add_${this.object.scope.value}rolebinding`) || (scope === 'org' && this.currentOrgIsRoot)
    } finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
