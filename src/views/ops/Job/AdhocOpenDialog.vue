<template>
  <GenericListTableDialog
    :header-actions="headerActions"
    :visible.sync="iVisible"
    v-bind="config"
  />
</template>

<script>
import { GenericListTableDialog } from '@/layout/components'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    GenericListTableDialog
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      config: {
        title: this.$t('ops.SelectAdhoc'),
        visible: false,
        width: '60%',
        tableConfig: {
          hasSelection: false,
          url: `/api/v1/ops/adhocs/`,
          columns: ['name', 'module', 'args', 'comment', 'actions'],
          columnsMeta: {
            name: {
              title: this.$tc('common.Name'),
              formatter: (row) => {
                return row?.name || '-'
              }
            },
            actions: {
              formatter: ActionsFormatter,
              formatterArgs: {
                hasUpdate: false,
                hasClone: false,
                hasDelete: false,
                extraActions: [
                  {
                    title: this.$tc('common.Select'),
                    name: 'select',
                    can: true,
                    callback: ({ row }) => {
                      this.$emit('select', row)
                      this.iVisible = false
                    }
                  }
                ]
              }
            }
          }
        }
      },
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasLeftActions: false,
        hasColumnSetting: false,
        hasSearch: false,
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  }
}
</script>

<style scoped>

</style>
