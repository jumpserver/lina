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
        url: '/api/v1/applications/database-apps/',
        columns: [
          'name', 'get_type_display', 'host', 'port', 'database', 'comment', 'actions'
        ],
        columnsMeta: {
          get_type_display: {
            label: this.$t('applications.type'),
            width: '80px'
          },
          host: {
            width: '140px'
          },
          port: {
            width: '60px'
          },
          database: {
            showOverflowTooltip: true
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        createRoute: 'DatabaseAppCreate',
        moreActionsTitle: this.$t('common.Create'),
        moreActionsType: 'primary',
        extraMoreActions: [
          {
            name: 'MySQL',
            title: 'MySQL',
            type: 'primary',
            can: true,
            callback: this.createMysql.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    createMysql() {
      this.$router.push({ name: 'DatabaseAppCreate', query: { type: 'mysql' }})
    }
  }
}
</script>

<style>

</style>
