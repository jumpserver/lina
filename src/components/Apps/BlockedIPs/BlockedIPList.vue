<template>
  <ListTable :header-actions="headerActions" :table-config="{ ...tableConfig, totalData: ips }" />
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'

export default {
  name: 'BlockedIPList',
  components: {
    ListTable
  },
  emits: ['refresh', 'unlock'],
  props: {
    ips: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/settings/security/block-ip/',
        columns: ['ip', 'actions'],
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
                  callback: ({ row }) => this.$emit('unlock', [row.ip])
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
        handleRefreshClick: () => this.$emit('refresh'),
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
            callback: ({ selectedRows }) => {
              this.$emit(
                'unlock',
                selectedRows.map((row) => row.ip)
              )
            }
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
