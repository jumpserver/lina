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
          default: ['name', 'value', 'color', 'res_count', 'date_created', 'actions'],
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
          color: {
            formatter: (row) => {
              const onChange = () => {
                vm.$axios.patch(`/api/v1/labels/labels/${row.id}/`, { color: row.color })
              }
              return (
                <el-color-picker
                  v-model={row.color}
                  size='small'
                  onChange={onChange}
                />
              )
            }
          },
          actions: {
            formatterArgs: {
              extraActions: [
                {
                  title: this.$t('BindResource'),
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
      this.resDialogVisible = false
      this.$nextTick(() => {
        this.bindVisible = true
      })
    },
    handleDialogConfirm() {
      this.bindVisible = false
      this.$refs.GenericListPage.reloadTable()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-color-picker__trigger {
  width: 30px;
  height: 30px;
  display: block
}

</style>
