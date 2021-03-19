<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :span="8">
        <QuickActions type="primary" :actions="quickActions" />
        <AssetRelationCard ref="assetSelect" type="primary" style="margin-top: 15px" v-bind="assetRelationConfig" />
        <RelationCard type="info" style="margin-top: 15px" v-bind="nodeRelationConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QuickActions from '@/components/QuickActions/index'
import RelationCard from '@/components/RelationCard'
import AssetRelationCard from '@/components/AssetRelationCard'
import ListTable from '@/components/ListTable'
import { ActionsFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'AssetList',
  components: {
    QuickActions,
    RelationCard,
    AssetRelationCard,
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: `/api/v1/assets/system-users-assets-relations/?systemuser=${this.object.id}`,
        columns: [
          {
            prop: 'asset_display',
            label: this.$t('assets.Hostname')
          },
          {
            prop: 'systemuser_display',
            label: this.$t('assets.SystemUsers')
          },
          {
            prop: 'id',
            label: this.$t('common.Action'),
            align: 'center',
            width: 150,
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: false,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'Push',
                  title: this.$t('common.Push'),
                  type: 'primary',
                  can: this.object.auto_push,
                  callback: ({ row }) => {
                    const theUrl = `/api/v1/assets/system-users/${vm.object.id}/tasks/`
                    const data = { action: 'push', assets: [row.asset] }
                    this.$axios.post(theUrl, data).then(resp => {
                      window.open(`/#/ops/celery/task/${resp.task}/log/`, '', 'width=900,height=600')
                    })
                  }
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  type: 'danger',
                  can: !this.$store.getters.currentOrgIsRoot,
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/system-users-assets-relations/${val.row.id}/`).then(() => {
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasLeftActions: true,
        hasBulkDelete: false,
        hasImport: false,
        hasExport: true,
        hasCreate: false,
        hasSearch: true,
        hasMoreActions: false,
        moreActionsTitle: this.$t('common.More'),
        moreActionsType: 'primary',
        extraMoreActions: [
          {
            title: this.$t('common.PushSelected'),
            name: 'PushSelected',
            can({ selectedRows }) {
              return selectedRows.length > 0 && vm.object.auto_push
            },
            callback: this.bulkPushCallback.bind(this)
          },
          {
            title: this.$t('assets.TestAssetsConnective'),
            name: 'TestSelected',
            can({ selectedRows }) {
              return selectedRows.length > 0
            },
            callback: this.bulkTestCallback.bind(this)
          }
        ]
      },
      nodeRelationConfig: {
        icon: 'fa-info',
        title: this.$t('perms.addNodeToThisPermission'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        hasObjectsId: [],
        hasObjects: [],
        performAdd: (items) => {
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              systemuser: objectId,
              node: v.value
            }
          })
          if (data.length === 0) {
            return this.$message.error(this.$t('assets.UnselectedNodes'))
          }
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/?systemuser=${objectId}&node=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      },
      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Test')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'test' }
              ).then(res => {
                window.open(`/#/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.PushSystemUserNow'),
          attrs: {
            type: 'primary',
            disabled: !vm.object.auto_push,
            label: this.$t('common.Push')
          },
          callbacks: {
            click: function({ row }) {
              const theUrl = `/api/v1/assets/system-users/${vm.object.id}/tasks/`
              const data = { action: 'push' }
              this.$axios.post(theUrl, data).then(resp => {
                window.open(`/#/ops/celery/task/${resp.task}/log/`, '', 'width=900,height=600')
              })
            }.bind(this)
          }
        }
      ],
      assetRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('xpack.ChangeAuthPlan.AddAsset'),
        disabled: this.$store.getters.currentOrgIsRoot,
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/assets/system-users-assets-relations/`
          const data = [

          ]
          items.map(v =>
            data.push({
              asset: v,
              systemuser: this.object.id
            })
          )
          if (data.length === 0) {
            return this.$message.error(this.$t('assets.UnselectedAssets'))
          }
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (items, that) => {
          this.$log.debug('AssetSelect value', that.assets)
          this.$message.success(this.$t('common.updateSuccessMsg'))
          vm.$refs.ListTable.reloadTable()
          that.$refs.assetSelect.$refs.select2.clearSelected()
        }
      }
    }
  },
  methods: {
    bulkPushCallback({ selectedRows }) {
      const theUrl = `/api/v1/assets/system-users/${this.object.id}/tasks/`
      const assets = selectedRows.map((v) => {
        return v.asset
      })
      const data = { action: 'push', assets: assets }
      this.$axios.post(theUrl, data).then(resp => {
        window.open(`/#/ops/task/task/${resp.task}/log/`, '', 'width=900,height=600')
      })
    },
    bulkTestCallback({ selectedRows }) {
      const theUrl = `/api/v1/assets/system-users/${this.object.id}/tasks/`
      const assets = selectedRows.map((v) => {
        return v.asset
      })
      const data = { action: 'test', assets: assets }
      this.$axios.post(theUrl, data).then(resp => {
        window.open(`/#/ops/task/task/${resp.task}/log/`, '', 'width=900,height=600')
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
