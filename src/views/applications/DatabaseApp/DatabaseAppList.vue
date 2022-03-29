<template>
  <GenericListPage ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DATABASE, KV_DATABASE } from '@/views/applications/const'

function getAppType(arr) {
  const searchAppType = []
  if (arr.length < 1) return searchAppType
  arr.forEach((i) => {
    const option = {
      value: i.name,
      label: i.title
    }
    searchAppType.push(option)
  })
  return searchAppType
}

export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    const appType = [...DATABASE, ...KV_DATABASE]
    return {
      tableConfig: {
        url: '/api/v1/applications/applications/?category=db',
        columns: [
          'name', 'type_display', 'attrs.host', 'attrs.port', 'attrs.database',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'type_display', 'attrs.host', 'attrs.port',
            'attrs.database', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          type_display: {
            label: this.$t('applications.type')
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
        hasBulkDelete: true,
        createRoute: 'DatabaseAppCreate',
        searchConfig: {
          exclude: ['category', 'type'],
          options: [
            {
              value: 'type',
              label: this.$t('applications.type'),
              children: getAppType(appType)
            }
          ]
        },
        moreCreates: {
          callback: (item) => {
            vm.$router.push({ name: 'DatabaseAppCreate', query: { type: item.name.toLowerCase() }})
          },
          dropdown: appType
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style>

</style>
