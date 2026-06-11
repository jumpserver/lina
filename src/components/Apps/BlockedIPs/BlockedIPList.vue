<template>
  <ListTable ref="ListTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'

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
        url: '',
        totalData: [
          {
            id: '1',
            ip: '192.168.1.1'
          },
          {
            id: '2',
            ip: '192.168.1.2'
          }
        ],
        columns: [
          { prop: 'id', label: this.$t('ID') },
          { prop: 'ip', label: this.$t('IP') },
          { prop: 'actions', label: this.$t('Actions') }
        ],
        columnsMeta: {
          ip: {
            label: this.$t('IP')
          },
          actions: {
            formatterArgs: {
              hasDelete: false,
              hasUpdate: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'UnlockIP',
                  title: this.$t('Unblock'),
                  can: this.$hasPerm('settings.change_security'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios
                      .post('/api/v1/settings/security/unlock-ip/', { ips: [row.ip] })
                      .then(() => {
                        vm.$message.success(this.$tc('UnlockSuccessMsg'))
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
            title: this.$t('UnblockSelected'),
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0
            },
            callback: function ({ selectedRows }) {
              vm.$axios
                .post('/api/v1/settings/security/unlock-ip/', {
                  ips: selectedRows.map(v => {
                    return v.ip
                  })
                })
                .then(res => {
                  vm.$message.success(vm.$tc('UnlockSuccessMsg'))
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

<style lang="less" scoped></style>
