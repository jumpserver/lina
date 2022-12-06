<template>
  <GenericListTableDialog
    :header-actions="headerActions"
    :visible.sync="iVisible"
    v-bind="config"
  />
</template>

<script>
import { GenericListTableDialog } from '@/layout/components'
import { ActionsFormatter } from '@/components/TableFormatters'

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
          url: `/api/v1/ops/adhocs/`,
          columns: ['name', 'module', 'args', 'actions'],
          columnsMeta: {
            actions: {
              formatter: ActionsFormatter,
              formatterArgs: {
                hasUpdate: false,
                hasClone: false,
                hasDelete: false,
                extraActions: [
                  {
                    title: '选择',
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
