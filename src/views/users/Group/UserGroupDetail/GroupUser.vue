<template>
  <div>
    <TwoCol>
      <template>
        <GenericListTable
          ref="listTable"
          :header-actions="headerActions"
          :table-config="tableConfig"
        />
      </template>
      <template #right>
        <RelationCard :key="relationKey" v-bind="relationConfig" @addSuccess="addSuccess" />
      </template>
    </TwoCol>
    <TwoCol />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import RelationCard from '@/components/Cards/RelationCard'
import { DeleteActionFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'GroupUser',
  components: {
    TwoCol,
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
    return {
      quickActions: [
        {
          title: this.$t('AllMembers'),
          attrs: {
            type: 'primary',
            label: this.$tc('Add'),
            disabled: !this.$hasPerm('users.add_usergroup')
          },
          callbacks: Object.freeze({
            click: () => {
              const msg = this.$t('AddAllMembersWarningMsg')
              this.$confirm(msg, this.$tc('Info'), {
                type: 'warning',
                confirmButtonClass: 'el-button--danger',
                beforeClose: async(action, instance, done) => {
                  if (action !== 'confirm') return done()
                  this.$axios.post(
                    `/api/v1/users/groups/${this.object.id}/add-all-users/`,
                  ).then(res => {
                    this.$message.success(this.$tc('AddSuccessMsg'))
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
          'name', 'delete_action'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              can: false,
              getTitle: ({ row }) => row.name + '(' + row.username + ')'
            }
          },
          delete_action: {
            prop: 'id',
            label: this.$t('Actions'),
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
                this.$message.success(this.$tc('DeleteSuccessMsg'))
                this.relationKey += 1
                reload()
              }).catch(error => {
                this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
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
        title: this.$t('Members'),
        objectsAjax: {
          url: `/api/v1/users/users/?fields_size=mini&order=name&exclude_group_id=${this.object.id}`,
          transformOption: (item) => {
            return { label: item.name + '(' + item.username + ')', value: item.id }
          }
        },
        showHasObjects: false,
        hasObjectsId: this.object.users,
        disabled: !this.$hasPerm('users.change_usergroup') || this.$store.getters.currentOrgIsRoot,
        performAdd: (items) => {
          const relationUrl = `/api/v1/users/users-groups-relations/`
          const groupId = this.object.id
          const data = items.map(v => {
            return {
              user: v.value,
              usergroup: groupId
            }
          })

          this.$message.success(this.$tc('AddSuccessMsg'))
          return this.$axios.post(relationUrl, data)
        }
      },
      relationKey: 0
    }
  },
  methods: {
    addSuccess() {
      this.$refs.listTable.reloadTable()
    }
  }
}
</script>

<style scoped>
.cell a {
  color: var(--color-info);
}
</style>
