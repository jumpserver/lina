<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="16" :sm="24">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :md="8" :sm="24">
        <QuickActions type="primary" :actions="quickActions" />
        <RelationCard ref="systemUserRelation" style="margin-top: 15px" v-bind="systemUserRelationConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuickActions from '@/components/QuickActions/index'
import RelationCard from '@/components/RelationCard'
import ListTable from '@/components/ListTable'
import { DetailFormatter } from '@/components/TableFormatters'
import { connectivityMeta } from '@/components/AccountListTable/const'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'SystemUserList',
  components: {
    QuickActions,
    RelationCard,
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: `/api/v1/assets/system-users-assets-relations/?asset=${this.object.id}`,
        columns: ['systemuser_display', 'connectivity', 'actions'],
        columnsMeta: {
          systemuser_display: {
            label: this.$t('assets.SystemUser'),
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                return {
                  name: 'SystemUserDetail',
                  params: { id: row.systemuser }
                }
              }
            }
          },
          connectivity: connectivityMeta,
          actions: {
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: false,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'Test',
                  title: this.$t('common.Test'),
                  type: 'primary',
                  can: vm.$hasPerm('assets.test_assetconnectivity'),
                  callback: ({ row }) => {
                    const theUrl = `/api/v1/assets/system-users/${row.systemuser}/tasks/`
                    const data = { action: 'test', assets: [this.object.id] }
                    this.$axios.post(theUrl, data).then(resp => {
                      openTaskPage(resp['task'])
                    })
                  }
                },
                {
                  name: 'Push',
                  title: this.$t('common.Push'),
                  can: vm.$hasPerm('assets.push_assetsystemuser'),
                  type: 'primary',
                  callback: ({ row }) => {
                    const theUrl = `/api/v1/assets/system-users/${row.systemuser}/tasks/`
                    const data = { action: 'push', assets: [this.object.id] }
                    this.$axios.post(theUrl, data).then(resp => {
                      openTaskPage(resp['task'])
                    })
                  }
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  type: 'danger',
                  can: !this.$store.getters.currentOrgIsRoot && vm.$hasPerm('assets.delete_authbook'),
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/system-users-assets-relations/${val.row.id}/`).then(() => {
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasCreate: false,
        extraMoreActions: [
          {
            title: this.$t('common.TestSelectedSystemUsersConnective'),
            name: 'TestSelected',
            can({ selectedRows }) {
              return selectedRows.length > 0 && vm.$hasPerm('assets.test_assetconnectivity')
            },
            callback: this.bulkTestCallback.bind(this)
          },
          {
            title: this.$t('common.PushSelectedSystemUsersToAsset'),
            name: 'PushSelected',
            can({ selectedRows }) {
              return selectedRows.length > 0 && vm.$hasPerm('assets.push_assetsystemuser')
            },
            callback: this.bulkPushCallback.bind(this)
          }
        ]
      },
      quickActions: [
        {
          title: this.$t('assets.TestAllSystemUsersConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Test'),
            disabled: !vm.$hasPerm('assets.test_assetconnectivity')
          },
          callbacks: {
            click: function() {
              const theUrl = `/api/v1/assets/assets/${this.object.id}/tasks/`
              const data = { action: 'test_system_user' }
              this.$axios.post(theUrl, data).then(resp => {
                openTaskPage(resp['task'])
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.PushAllSystemUsersToAsset'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Push'),
            disabled: !vm.$hasPerm('assets.push_assetsystemuser')
          },
          callbacks: {
            click: function({ row }) {
              const theUrl = `/api/v1/assets/assets/${this.object.id}/tasks/`
              const data = { action: 'push_system_user' }
              this.$axios.post(theUrl, data).then(resp => {
                openTaskPage(resp['task'])
              })
            }.bind(this)
          }
        }
      ],
      systemUserRelationConfig: {
        disabled: !vm.$hasPerm('assets.add_authbook'),
        icon: 'fa-link',
        type: 'info',
        title: this.$t('assets.AssociateSystemUsers'),
        objectsAjax: {
          url: `/api/v1/assets/system-users/`
        },
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/assets/system-users-assets-relations/`
          const data = items.map((i) => {
            return {
              'asset': this.object.id,
              'systemuser': i.value
            }
          })
          if (data.length === 0) {
            return this.$message.error(this.$tc('assets.UnselectedSystemUsers'))
          }
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (items, that) => {
          vm.$message.success(this.$t('common.updateSuccessMsg'))
          vm.$refs.ListTable.reloadTable()
          vm.$refs.systemUserRelation.$refs.select2.clearSelected()
        }
      }
    }
  },
  methods: {
    bulkPushCallback({ selectedRows }) {
      const theUrl = `/api/v1/assets/assets/${this.object.id}/tasks/`
      const systemUsers = selectedRows.map((v) => {
        return v.systemuser
      })
      const data = { action: 'push_system_user', system_users: systemUsers }
      this.$axios.post(theUrl, data).then(resp => {
        openTaskPage(resp['task'])
      })
    },
    bulkTestCallback({ selectedRows }) {
      const theUrl = `/api/v1/assets/assets/${this.object.id}/tasks/`
      const systemUsers = selectedRows.map((v) => {
        return v.systemuser
      })
      const data = { action: 'test_system_user', system_users: systemUsers }
      this.$axios.post(theUrl, data).then(resp => {
        openTaskPage(resp['task'])
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
