<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

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
