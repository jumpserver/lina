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
        url: '/api/v1/applications/applications/?category=db',
        columns: [
          'name', 'type_display', 'attrs.host', 'attrs.port', 'attrs.database', 'comment', 'actions'
        ],
        columnsMeta: {
          type_display: {
            label: this.$t('applications.type'),
            width: '120px'
          },
          'attrs.host': {
            label: this.$t('applications.host'),
            width: '140px'
          },
          'attrs.port': {
            label: this.$t('applications.port'),
            width: '60px'
          },
          'attrs.database': {
            label: this.$t('applications.database'),
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
