<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        axiosConfig: {
          raw: 1,
          params: {
            display: 1,
            is_finished: 0
          }
        },
        url: '/api/v1/terminal/sessions/',
        columns: [
          {
            label: this.$t('sessions.id'),
            type: 'index'
          },
          {
            prop: 'user',
            label: this.$t('sessions.user'),
            sortable: 'custom'
          },
          {
            prop: 'asset',
            label: this.$t('sessions.asset'),
            sortable: 'custom'
          },
          {
            prop: 'system_user',
            label: this.$t('sessions.systemUser'),
            sortable: 'custom'
          },
          {
            prop: 'remote_addr',
            label: this.$t('sessions.remoteAddr'),
            sortable: 'custom'
          },
          {
            prop: 'protocol',
            label: this.$t('sessions.protocol'),
            sortable: 'custom'
          },
          {
            prop: 'login_from_display',
            label: this.$t('sessions.loginForm')
          },
          {
            prop: 'command',
            label: this.$t('sessions.command')
          },
          {
            prop: 'date_start',
            label: this.$t('sessions.dateStart'),
            sortable: 'custom'
          },
          {
            prop: 'duration',
            label: this.$t('sessions.duration')
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              hasEdit: false,
              hasDelete: false,
              extraActions: [
                {
                  name: 'replay',
                  title: this.$t('sessions.replay'),
                  type: 'primary'
                },
                {
                  name: 'replay',
                  title: this.$t('sessions.download'),
                  type: 'warning'
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
