<template>
  <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'

export default {
  name: 'BlockedIPList',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/settings/security/block-ip/',
        columns: [
          'ip', 'actions'
        ],
        columnsMeta: {
          ip: {
            label: this.$t('assets.ip')
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'UnlockIP',
                  title: this.$t('setting.Unblock'),
                  can: this.$hasPerm('settings.change_security'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.post(
                      '/api/v1/settings/security/unlock-ip/',
                      { ips: [row.ip] }
                    ).then(() => {
                      vm.$message.success(this.$tc('common.UnlockSuccessMsg'))
                      vm.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasSearch: false,
        hasRefresh: true,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: true,
        hasRightActions: true,
        extraMoreActions: [
          {
            name: 'UnlockSelected',
            title: this.$t('setting.BulkUnblock'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0
            },
            callback: function({ selectedRows }) {
              vm.$axios.post(
                '/api/v1/settings/security/unlock-ip/',
                {
                  ips: selectedRows.map(v => { return v.ip })
                }
              ).then(res => {
                vm.$message.success(vm.$tc('common.UnlockSuccessMsg'))
                vm.$refs.ListTable.reloadTable()
              })
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
