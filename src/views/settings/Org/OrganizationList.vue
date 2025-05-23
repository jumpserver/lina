<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    <Dialog
      :show-buttons="false"
      :title="$tc('General')"
      :visible.sync="visible"
    >
      <GenericCreateUpdateForm v-bind="form" @submitSuccess="visible=false" />
    </Dialog>
  </div>
</template>

<script>
import { GenericCreateUpdateForm, GenericListPage } from '@/layout/components'
import { Dialog } from '@/components'

const performDelete = function({ row, col }) {
  const id = row.id
  const url = `${this.url}${id}/`
  return this.$axios.delete(url)
}
export default {
  components: {
    GenericCreateUpdateForm,
    GenericListPage,
    Dialog
  },
  data() {
    const vm = this
    return {
      visible: false,
      form: {
        url: '/api/v1/settings/setting/?category=basic',
        fields: ['GLOBAL_ORG_DISPLAY_NAME'],
        labelWidth: '200px',
        fieldsMeta: {},
        submitMethod() {
          return 'patch'
        }
      },
      tableConfig: {
        url: '/api/v1/orgs/orgs/',
        permissions: {
          app: 'orgs',
          resource: 'organization'
        },
        columns: ['name', 'id',
          'resource_statistics.users_amount',
          'resource_statistics.groups_amount',
          'resource_statistics.assets_amount',
          'resource_statistics.asset_perms_amount',
          'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'resource_statistics.users_amount',
            'resource_statistics.groups_amount',
            'resource_statistics.assets_amount',
            'resource_statistics.asset_perms_amount'
          ]
        },
        columnsMeta: {
          'resource_statistics.users_amount': {
            label: this.$t('Users'),
            width: '100px'
          },
          'resource_statistics.groups_amount': {
            label: this.$t('UserGroups'),
            width: '100px'
          },
          'resource_statistics.assets_amount': {
            label: this.$t('Assets'),
            width: '100px'
          },
          'resource_statistics.asset_perms_amount': {
            label: this.$tc('AssetPermission', 2),
            width: '200px'
          },
          actions: {
            formatterArgs: {
              canUpdate: this.$hasPerm('orgs.change_organization'),
              canDelete: function({ row }) {
                return !row.internal && vm.$hasPerm('orgs.delete_organization')
              },
              onDelete: function({ row, col, cellValue, reload }) {
                const msg = this.$t('DeleteOrgMsg')
                const title = this.$t('DeleteOrgTitle')
                this.$alert(msg, title, {
                  type: 'warning',
                  confirmButtonClass: 'el-button--danger',
                  showCancelButton: true,
                  beforeClose: async(action, instance, done) => {
                    if (action !== 'confirm') return done()
                    instance.confirmButtonLoading = true
                    try {
                      await performDelete.bind(this)({ row: row, col: col })
                      this.$store.dispatch('users/deleteAdminOrg', { id: row.id, name: row.name })
                        .then(() => {
                          done()
                          reload()
                          this.$message.success(this.$tc('DeleteSuccessMsg'))
                        })
                    } finally {
                      instance.confirmButtonLoading = false
                    }
                  }
                }).catch(() => {
                  /* 取消*/
                })
              }
            }
          }
        }
      },
      headerActions: {
        canCreate: this.$hasPerm('orgs.add_organization'),
        extraActions: [
          {
            title: this.$t('Setting'),
            icon: 'el-icon-setting',
            callback: () => {
              this.visible = true
            }
          }
        ],
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
