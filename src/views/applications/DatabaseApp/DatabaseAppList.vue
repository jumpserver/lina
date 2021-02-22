<template>
  <GenericListPage ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/applications/applications/?category=db',
        columns: [
          'name', 'type_display', 'attrs.host', 'attrs.port', 'attrs.database', 'date_created', 'comment', 'actions'
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
              hasClone: false,
              performDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/applications/applications/${row.id}/`
                ).then(res => {
                  this.$refs.GenericListTable.$refs.ListTable.reloadTable()
                  // this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
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
        hasBulkDelete: false,
        createRoute: 'DatabaseAppCreate',
        moreActionsTitle: this.$t('common.Create'),
        moreActionsType: 'primary',
        extraMoreActions: [
          {
            name: 'MySQL',
            title: 'MySQL',
            type: 'primary',
            has: true,
            callback: this.createMysql.bind(this)
          },
          {
            name: 'PostgreSQL',
            title: 'PostgreSQL',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createPostgreSQL.bind(this)
          },
          {
            name: 'MariaDB',
            title: 'MariaDB',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createMariaDB.bind(this)
          },
          {
            name: 'Oracle',
            title: 'Oracle',
            type: 'primary',
            has: this.isValidateLicense,
            callback: this.createOracle.bind(this)
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['publicSettings', 'currentOrg'])
  },
  methods: {
    createMysql() {
      this.$router.push({ name: 'DatabaseAppCreate', query: { type: 'mysql' }})
    },
    createPostgreSQL() {
      this.$router.push({ name: 'DatabaseAppCreate', query: { type: 'postgresql' }})
    },
    createMariaDB() {
      this.$router.push({ name: 'DatabaseAppCreate', query: { type: 'mariadb' }})
    },
    createOracle() {
      this.$router.push({ name: 'DatabaseAppCreate', query: { type: 'oracle' }})
    },
    isValidateLicense() {
      if (this.publicSettings.XPACK_ENABLED) {
        return this.publicSettings.XPACK_LICENSE_IS_VALID
      }
      return false
    }
  }
}
</script>

<style>

</style>
