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
          dropdown: [
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
              has: this.hasLicence,
              callback: this.createPostgreSQL.bind(this)
            },
            {
              name: 'MariaDB',
              title: 'MariaDB',
              type: 'primary',
              has: this.hasLicence,
              callback: this.createMariaDB.bind(this)
            },
            {
              name: 'Oracle',
              title: 'Oracle',
              type: 'primary',
              has: this.hasLicence,
              callback: this.createOracle.bind(this)
            }
          ]
        }
      }
    }
  },
  computed: {
    ...mapGetters(['publicSettings', 'currentOrg', 'hasValidLicense'])
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
    hasLicense() {
      return this.hasLicence
    }
  }
}
</script>

<style>

</style>
