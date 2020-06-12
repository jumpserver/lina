<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <AssetUserTable ref="ListTable" :url="assetUserUrl" :other-actions="otherActions" />
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
import { AssetUserTable } from '@/components'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    RelationCard,
    AssetUserTable,
    AssetRelationCard
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
      assetUserUrl: `/api/v1/assets/asset-users/?prefer_id=${this.object.id}&prefer=system_user&latest=1`,
      otherActions: [
        {
          name: 'Push',
          title: this.$t('common.Push'),
          can: () => vm.object.auto_push,
          callback: function({ row }) {
            const assetId = row.asset
            const username = row.username
            const theUrl = `/api/v1/assets/system-users/${vm.object.id}/tasks/?username=${username}`
            const data = { action: 'push', asset: assetId }
            this.$axios.post(theUrl, data).then(resp => {
              window.open(`/#/ops/celery/task/${resp.task}/log/`, '', 'width=900,height=600')
            })
          }
        }
      ],
      AutoPushConfig: {
        icon: 'fa-info',
        title: this.$t('assets.QuickUpdate'),
        url: `/api/v1/assets/system-users/${this.object.id}/`,
        content: [
          {
            name: this.$t('assets.AutoPush'),
            auto_push: this.object.auto_push
          }
        ]
      },
      assetRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('xpack.ChangeAuthPlan.AddAsset'),
        performAdd: (items, that) => {
          const relationUrl = `/api/v1/assets/system-users-assets-relations/`
          console.log(items)
          const data = [

          ]
          items.map(v =>
            data.push({
              asset: v,
              systemuser: this.object.id
            })
          )
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (items, that) => {
          this.$log.debug('AssetSelect value', that.assets)
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.$refs.ListTable.reloadTable()
          that.$refs.assetSelect.$refs.select2.clearSelected()
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
        }
      ],
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
          return this.$axios.post(relationUrl, data).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/?systemuser=${objectId}&node=${itemId}`
          return this.$axios.delete(relationUrl).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        }
      }
    }
  },
  computed: {
  },
  mounted() {
    this.getNodeList()
  },
  methods: {
    getNodeList() {
      this.$axios.get(
        `/api/v1/assets/system-users-nodes-relations/?systemuser=${this.object.id}&draw=1&limit=15&offset=0`
      ).then(data => {
        for (const x in data.results) {
          this.nodeRelationConfig.hasObjectsId.push(data.results[x].node)
          this.nodeRelationConfig.hasObjects.push({
            value: data.results[x].node,
            label: data.results[x].node_display
          })
        }
      }
      )
    }
  }
}
</script>

<style lang='less' scoped>

</style>
