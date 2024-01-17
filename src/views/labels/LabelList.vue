<template>
  <div>
    <GenericListPage ref="GenericListPage" :header-actions="headerActions" :table-config="tableConfig" />
    <BindDialog v-if="bindVisible" :label="label" :visible.sync="bindVisible" @bind-success="handleDialogConfirm" />
    <LabelResourcesDialog
      v-if="resDialogVisible"
      :label="label"
      :visible.sync="resDialogVisible"
      @addResource="handleAddResource"
    />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import BindDialog from './BindDialog.vue'
import LabelResourcesDialog from '@/views/labels/LabelResourcesDialog.vue'
import { mapGetters } from 'vuex'

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
          default: ['name', 'value', 'res_count', 'date_created', 'actions'],
          min: ['name', 'actions']
        },
        columnsMeta: {
          name: {
            formatter: (row) => row.name
          },
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
                  },
                  can: () => {
                    return !this.currentOrgIsRoot
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
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  methods: {
    handleClickResCount(row) {
      this.label = row
      this.resDialogVisible = true
    },
    handleAddResource() {
      this.bindVisible = true
      this.resDialogVisible = false
    },
    handleDialogConfirm() {
      this.bindVisible = false
      this.$refs.GenericListPage.reloadTable()
    }
  }
}
</script>

<style>

</style>
