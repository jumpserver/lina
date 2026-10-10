<template>
  <TwoCol>
    <template>
      <ListTable
        ref="ListTable"
        :header-actions="headerActions"
        :table-config="tableConfig"
      />
    </template>
    <template #right>
      <RelationCard v-if="!loading" ref="userRelation" v-bind="relationConfig" />
    </template>
  </TwoCol>
</template>

<script>
import { ListTable, RelationCard } from '@/components'
import { mapGetters } from 'vuex'
import { DeleteActionFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { fetchAllData } from '@/utils/request'

export default {
  components: {
    TwoCol,
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
      memberIds: [],
      relationConfig: {
        disabled: !this.$hasPerm(`rbac.add_${this.object.scope.value}rolebinding`),
        icon: 'fa-user',
        title: this.$t('Members'),
        objectsAjax: {
          url: `/api/v1/users/users/?fields_size=mini&order=name${this.object.scope.value === 'system' ? '&oid=root' : ''}`,
          transformOption: (item) => {
            const disabled = this.memberIds.includes(item.id)
            const label = `${item.name}(${item.username})${disabled ? ' (' + this.$t('RoleMemberAlreadyAdded') + ')' : ''}`
            return { label, value: item.id, disabled }
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
        onAddSuccess: async () => {
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
          this.$refs.userRelation.$refs.select2.clearSelected()
          await this.refreshMembers()
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
              ).then(async res => {
                this.$message.success(this.$tc('DeleteSuccessMsg'))
                reload()
                await this.refreshMembers()
              }).catch(() => {
                // Request errors are displayed by the shared response interceptor.
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
  async created() {
    try {
      const scope = this.$route.query['scope']
      this.relationConfig.disabled = !this.$hasPerm(`rbac.add_${this.object.scope.value}rolebinding`) || (scope === 'org' && this.currentOrgIsRoot)
      await this.refreshMembers()
    } catch (error) {
      // Request errors are displayed by the shared response interceptor.
    } finally {
      this.loading = false
    }
  },
  methods: {
    async refreshMembers() {
      const bindings = await fetchAllData(this.tableConfig.url, { limit: 100 })
      this.memberIds = bindings.map(binding => binding.user.id)
      const select = this.$refs.userRelation && this.$refs.userRelation.$refs.select2
      if (select) {
        await select.refresh()
      }
    }
  }
}
</script>
