<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    <BindDialog :label="label" :visible.sync="bindVisible" />
    <LabelResourcesDialog v-if="resDialogVisible" :label="label" :visible.sync="resDialogVisible" @addResource="handleAddResource" />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import BindDialog from './BindDialog.vue'
import LabelResourcesDialog from '@/views/labels/LabelResourcesDialog.vue'

export default {
  components: {
    LabelResourcesDialog,
    BindDialog,
    GenericListPage
  },
  data() {
    const vm = this
    return {
      bindVisible: false,
      resDialogVisible: false,
      label: {},
      tableConfig: {
        url: '/api/v1/labels/labels/',
        columnsShow: {
          default: ['name', 'value', 'res_count', 'date_created', 'date_updated', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          res_count: {
            formatter: (row) => {
              const onClick = () => {
                vm.handleClickResCount(row)
              }
              return (
                <el-link type='success' onClick={onClick}>{ row['res_count'] }</el-link>
              )
            }
          },
          actions: {
            formatterArgs: {
              extraActions: [
                {
                  title: this.$t('labels.BindResource'),
                  name: 'bind',
                  callback: ({ row }) => {
                    this.label = row
                    this.bindVisible = true
                  }
                }
              ]
            }
          }

        }
      },
      headerActions: {
        createRoute: 'LabelCreate'
      }
    }
  },
  methods: {
    handleClickResCount(row) {
      this.label = row
      this.resDialogVisible = true
    },
    handleAddResource() {
      this.bindVisible = true
      this.resDialogVisible = false
    }
  }
}
</script>

<style>

</style>
