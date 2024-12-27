<template>
  <el-row :gutter="20">
    <el-col :md="24" :sm="24">
      <ListTable
        ref="ListTable"
        :header-actions="headerActions"
        :table-config="tableConfig"
      />
    </el-col>
    <el-col :md="20" :sm="24" class="detail-right-quick-actions">
      <RelationCard v-if="!loading" ref="userRelation" v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { ListTable, RelationCard } from '@/components'
import { mapGetters } from 'vuex'
import { DeleteActionFormatter } from '@/components/Table/TableFormatters'

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
        title: this.$t('Members'),
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
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
          this.$refs.userRelation.$refs.select2.clearSelected()
        }
      },
      tableConfig: {
        url: `/api/v1/rbac/${this.object.scope.value}-role-bindings/?role=${this.object.id}`,
        columns: this.object.scope.value === 'system' ? ['user_display', 'delete_action'] : ['user_display', 'org_name', 'delete_action'],
        columnsShow: {
          min: ['user_display', 'delete_action']
        },
        columnsMeta: {
          user_display: {
            label: this.$t('Name'),
            formatter: (row) => {
              return `${row.user.name}(${row.user.username})`
            }
          },
          delete_action: {
            prop: 'id',
            label: this.$t('Actions'),
            align: 'center',
            width: 150,
            objects: 'all',
            formatter: DeleteActionFormatter,
            formatterArgs: {
              disabled: false
            },
            onDelete: function(col, row, cellValue, reload) {
              this.$axios.delete(
                `/api/v1/rbac/${this.object.scope.value}-role-bindings/${row.id}/?role=${this.object.id}`,
              ).then(res => {
                this.$message.success(this.$tc('DeleteSuccessMsg'))
                reload()
              }).catch(error => {
                this.$message.error({
                  message: error.response.data.detail,
                  duration: 3000
                })
              })
            }.bind(this)
          },
          actions: {
            has: false,
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
              label: this.$t('Username'),
              value: 'user__username'
            },
            {
              label: this.$t('User'),
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
