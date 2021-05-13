<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :span="8">
        <QuickActions type="primary" :actions="quickActions" />
        <RelationCard ref="RelationCard" type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuickActions from '@/components/QuickActions/index'
import ListTable from '@/components/ListTable'
import RelationCard from '@/components/RelationCard'
import { ChoicesFormatter } from '@/components/TableFormatters'

export default {
  name: 'AssetList',
  components: {
    QuickActions,
    ListTable,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/assets/assets/?admin_user__id=${this.object.id}`,
        columns: [
          'hostname', 'ip', 'admin_user_display', 'connectivity'
        ],
        columnsMeta: {
          admin_user_display: {
            label: this.$t('assets.AdminUser')
          },
          connectivity: {
            label: this.$t('assets.Reachable'),
            formatter: ChoicesFormatter,
            formatterArgs: {
              iconChoices: {
                0: 'fa-times text-danger',
                1: 'fa-check text-primary',
                2: 'fa-circle text-warning'
              },
              typeChange: function(val) {
                return val.status
              },
              hasTips: true
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: true,
        hasCreate: false,
        hasSearch: true,
        hasMoreActions: false
      },
      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('assets.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/assets/admin-users/${this.object.id}/connective/`
              ).then(res => {
                window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ],
      nodeRelationConfig: {
        icon: 'fa-info',
        title: this.$t('assets.ReplaceNodeAssetsAdminUser'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        performAdd: (items) => {
          const data = []
          const relationUrl = `/api/v1/assets/admin-users/${this.object.id}/nodes/`
          items.map(v => {
            data.push(v.value)
          })
          return this.$axios.patch(relationUrl, { nodes: data }).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        },
        onAddSuccess: () => {
          this.$refs.RelationCard.$refs.select2.clearSelected()
          this.$refs.ListTable.reloadTable()
        }
      }
    }
  },
  methods: {

  }
}
</script>

<style lang='less' scoped>

</style>
