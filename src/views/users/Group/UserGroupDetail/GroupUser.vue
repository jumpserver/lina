<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="14" :sm="24">
        <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
      </el-col>
      <el-col :md="10" :sm="24">
        <QuickActions :actions="quickActions" :title="title" type="primary" />
        <RelationCard v-bind="relationConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import QuickActions from '@/components/QuickActions'
import RelationCard from '@/components/Cards/RelationCard'
import { DeleteActionFormatter, DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'GroupUser',
  components: {
    QuickActions,
    RelationCard,
    GenericListTable
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      title: this.$t('assets.QuickAdd'),
      quickActions: [
        {
          title: this.$t('users.AllMembers'),
          attrs: {
            type: 'primary',
            label: this.$tc('common.Add'),
            disabled: !this.$hasPerm('users.add_usergroup')
          },
          callbacks: Object.freeze({
            click: () => {
              const msg = this.$t('users.AddAllMembersWarningMsg')
              this.$confirm(msg, this.$tc('common.Info'), {
                type: 'warning',
                confirmButtonClass: 'el-button--danger',
                beforeClose: async(action, instance, done) => {
                  if (action !== 'confirm') return done()
                  this.$axios.post(
                    `/api/v1/users/groups/${this.object.id}/add-all-users/`,
                  ).then(res => {
                    this.$message.success(this.$tc('common.AddSuccessMsg'))
                    done()
                    window.location.reload()
                  })
                }
              }).catch(() => {
              })
            }
          })
        }
      ],
      tableConfig: {
        url: `/api/v1/users/users/?group_id=${this.object.id}`,
        columns: [
          'name', 'username', 'email', 'is_valid', 'delete_action'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'UserDetail',
              can: vm.$hasPerm('user.view_user')
            }
          },
          delete_action: {
            prop: 'id',
            label: this.$t('common.Actions'),
            align: 'center',
            width: 150,
            objects: this.object.users,
            formatter: DeleteActionFormatter,
            formatterArgs: {
              disabled: !this.$hasPerm('users.change_usergroup')
            },
            onDelete: function(col, row, cellValue, reload) {
              this.$axios.delete(
                '/api/v1/users/users-groups-relations/', {
                  params: {
                    usergroup: this.object.id,
                    user: row.id
                  }
                }
              ).then(res => {
                this.$message.success(this.$tc('common.deleteSuccessMsg'))
                reload()
              }).catch(error => {
                this.$message.error(this.$tc('common.deleteErrorMsg') + ' ' + error)
              })
            }.bind(this)
          },
          actions: {
            has: false
          }
        },
        tableAttrs: {
          border: false
        }
      },
      headerActions: {
        hasSearch: true,
        hasRefresh: true,
        hasLeftActions: false,
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        searchConfig: {
          getUrlQuery: false
        },
        hasMoreActions: false
      },
      relationConfig: {
        icon: 'fa-user',
        title: this.$t('common.Members'),
        objectsAjax: {
          url: `/api/v1/users/users/?fields_size=mini&order=name&exclude_group_id=${this.object.id}`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        showHasObjects: false,
        hasObjectsId: this.object.users,
        disabled: !this.$hasPerm('users.change_usergroup'),
        performAdd: (items) => {
          const relationUrl = `/api/v1/users/users-groups-relations/`
          const groupId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              usergroup: groupId
            }
          })
          this.$axios.post(relationUrl, data)
          this.$message.success(this.$tc('common.AddSuccessMsg'))
          window.location.reload()
        }
      }
    }
  }
}
</script>

<style scoped>
.cell a {
  color: var(--color-info);
}
</style>
