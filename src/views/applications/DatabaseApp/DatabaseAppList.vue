<template>
  <GenericListPage ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/applications/applications/?category=db',
        columns: [
          'name', 'type_display', 'attrs.host', 'attrs.port', 'attrs.database',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'type_display', 'attrs.host', 'attrs.port', 'attrs.database', 'comment', 'actions']
        },
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
            width: '80px'
          },
          'attrs.database': {
            label: this.$t('applications.database'),
            showOverflowTooltip: true
          },
          actions: {
            prop: 'actions',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'DatabaseAppCreate', query: { type: row.type, clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'DatabaseAppUpdate', params: { id: row.id }, query: { type: row.type }})
              },
              performDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/applications/applications/${row.id}/`
                ).then(res => {
                  this.$refs.GenericListTable.$refs.ListTable.$refs.ListTable.reloadTable()
                  // this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg') + ' ' + error)
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        createRoute: 'DatabaseAppCreate',
        moreCreates: {
          callback: (item) => {
            vm.$router.push({ name: 'DatabaseAppCreate', query: { type: item.name.toLowerCase() }})
          },
          dropdown: [
            {
              name: 'MySQL',
              title: 'MySQL',
              has: true
            },
            {
              name: 'PostgreSQL',
              title: 'PostgreSQL',
              has: this.$store.getters.hasValidLicense
            },
            {
              name: 'MariaDB',
              title: 'MariaDB',
              type: 'primary',
              has: this.$store.getters.hasValidLicense
            },
            {
              name: 'Oracle',
              title: 'Oracle',
              has: this.$store.getters.hasValidLicense
            }
          ]
        }
      }
    }
  }
}
</script>

<style>

</style>
