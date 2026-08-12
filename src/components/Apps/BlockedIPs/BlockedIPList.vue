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
        url: '/api/v1/settings/security/block-ip/',
        columns: ['ip', 'actions'],
        totalData: [],
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
                      .post('/api/v1/settings/security/unlock-ip/', {
                        ips: [row.ip]
                      })
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
        hasSearch: true,
        hasRefresh: true,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: true,
        hasRightActions: true,
        extraMoreActions: [
          {
            name: 'UnlockSelected',
            title: this.$t('UnblockSelected'),
            icon: 'fa-solid fa-unlock',
            type: 'primary',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0
            },
            callback: function ({ selectedRows }) {
              vm.$axios
                .post('/api/v1/settings/security/unlock-ip/', {
                  ips: selectedRows.map((v) => {
                    return v.ip
                  })
                })
                .then((res) => {
                  vm.$message.success(vm.$tc('UnlockSuccessMsg'))
                  vm.$refs.ListTable.reloadTable()
                })
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.$axios.get('/api/v1/settings/security/block-ip/').then((res) => {
      this.tableConfig.totalData = res.results
    })
  }
}
</script>

<style lang="scss" scoped></style>
