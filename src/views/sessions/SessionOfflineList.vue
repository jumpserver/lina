<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
// import DetailFormatter from '@/components/DataTable/formatters/DetailFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      showTree: true,
      tableConfig: {
        axiosConfig: {
          raw: 1,
          params: {
            display: 1,
            is_finished: 1
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
            sortable: true
          },
          {
            prop: 'asset',
            label: this.$t('sessions.asset')
          },
          {
            prop: 'system_user',
            label: this.$t('sessions.systemUser')
          },
          {
            prop: 'remote_addr',
            label: this.$t('sessions.remoteAddr')
          },
          {
            prop: 'protocol',
            label: this.$t('sessions.protocol')
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
            label: this.$t('sessions.dateStart')
          },
          {
            prop: 'duration',
            label: this.$t('sessions.duration')
          }
        ],
        tableActions: {
          hasEdit: false,
          hasDelete: false
        },
        extraButtons: [
          {
            type: 'warning',
            text: this.$t('sessions.replay'),
            // 必须使用箭头函数
            atClick: (row) => {
              this.$router.push({ name: '404' })
            }
          },
          {
            type: 'primary',
            text: this.$t('sessions.download'),
            atClick: (row) => {
              this.$router.push({ name: '404' })
            }
          }
        ]
      },
      headerActions: {
        hasCreate: false,
        hasDelete: false,
        hasUpdate: false
      }
    }
  }
}
</script>

<style>

</style>
