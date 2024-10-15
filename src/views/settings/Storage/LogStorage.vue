<template>
  <ListTable ref="ListTable" :header-actions="logStorageActions" :table-config="logStorageTableConfig" />
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'

export default {
  name: 'LogStorage',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      logStorageActions: {
        canCreate: this.$hasPerm('audits.add_logstorage'),
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasMoreActions: false,
        moreCreates: {
          callback: (item) => {
            this.$router.push({ name: 'CreateLogStorage', query: { type: item.name }})
          },
          dropdown: [
            { name: 'es', title: 'Elasticsearch' }
          ]
        }
      },
      logStorageTableConfig: {
        title: 'log-storages',
        url: '/api/v1/audits/log-storages/',
        permissions: {
          resource: 'logstorage'
        },
        columns: [
          'id', 'name', 'type', 'log_types_display', 'comment', 'is_default', 'actions'
        ],
        columnsExclude: ['meta'],
        columnsShow: {
          min: ['name', 'type', 'actions'],
          default: ['name', 'type', 'log_types_display', 'comment', 'is_default', 'actions']
        },
        columnsMeta: {
          comment: {
            sortable: 'custom'
          },
          name: {
            formatter: function(row) {
              return row.name
            }
          },
          log_types_display: {
            formatter: function(row) {
              return row.log_types_display.join(', ') || '-'
            }
          },
          is_default: {
            formatterArgs: {
              showFalse: false,
              showText: false
            },
            align: 'center'
          },
          actions: {
            formatterArgs: {
              canUpdate: function({ row }) {
                return (row.name !== 'default' && vm.$hasPerm('audits.change_logstorage'))
              },
              onUpdate: function({ row }) {
                this.$router.push({ name: 'LogStorageUpdate', params: { id: row.id }, query: { type: row.type.value }})
              },
              canDelete: function({ row }) {
                return (row.name !== 'default' && vm.$hasPerm('audits.delete_logstorage'))
              },
              hasClone: false,
              extraActions: [
                {
                  name: 'test',
                  title: this.$t('Test'),
                  type: 'primary',
                  can: vm.$hasPerm('audits.view_logstorage'),
                  callback: function({ row, col, cellValue, reload }) {
                    this.$axios.get(
                      `/api/v1/audits/log-storages/${row.id}/test-connective/`
                    ).then(data => {
                      if (!data['is_valid']) {
                        this.$message.error(data.msg)
                      } else {
                        this.$message.success(data.msg)
                      }
                    })
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  methods: {
  }
}

</script>

<style scoped>

</style>
