<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="15" :sm="24">
        <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
        <AutoDetailCard :fields="detailFields" :object="object" :title="$tc('TaskDetail')" :url="url" />
      </el-col>
      <el-col :md="9" :sm="24">
        <QuickActions :actions="quickEditActions" type="primary" />
        <QuickActions :actions="quickExecuteActions" type="primary" />
        <RelationCard
          ref="StrategyRelation"
          v-perms="'xpack.change_strategy'"
          style="margin-top: 15px"
          type="info"
          v-bind="strategyRelationConfig"
        />
      </el-col>
    </el-row>
    <Dialog
      :title="$tc('Timer')"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :visible.sync="showTimer"
      :show-buttons="false"
    >
      <TimingPanel :object="object" :visible.sync="showTimer" />
    </Dialog>
  </div>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { toSafeLocalDateStr } from '@/utils/common'
import RelationCard from '@/components/Cards/RelationCard'
import QuickActions from '@/components/QuickActions'
import TimingPanel from '@/views/assets/Cloud/Account/components/TimingPanel'
import { openTaskPage } from '@/utils/jms'
import Dialog from '@/components/Dialog'

export default {
  name: 'CloudAccountDetail',
  components: {
    Dialog,
    TimingPanel,
    QuickActions,
    RelationCard,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showTimer: false,
      url: `/api/v1/xpack/cloud/accounts/${this.object.id}/`,
      excludes: ['attrs', 'task'],
      quickEditActions: [
        {
          title: this.$t('ReleaseAssets'),
          type: 'switcher',
          attrs: {
            model: this.object.task.release_assets,
            tip: this.$t('ReleaseAssetsHelpTips'),
            type: 'primary',
            disabled: !this.hasEditPerm()
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/`,
                { 'release_assets': val }
              ).then(res => {
                this.$message.success(this.$t('UpdateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('UpdateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('IpType'),
          type: 'updateSelect',
          attrs: {
            model: this.object.task.sync_ip_type,
            type: 'primary',
            multiple: false,
            clearable: false,
            showSelect: true,
            options: [
              { label: this.$t('PublicIp'), value: 1 },
              { label: this.$t('PrivateIp'), value: 0 }
            ],
            disabled: !this.hasEditPerm()
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/`,
                { 'sync_ip_type': val }
              ).then(res => {
                this.$message.success(this.$t('UpdateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$t('UpdateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
      quickExecuteActions: [
        {
          title: this.$t('RunTaskManually'),
          attrs: {
            showTip: !this.object.task?.id,
            tip: this.$t('ExecCloudSyncErrorMsg'),
            type: 'primary',
            label: this.$t('Execute'),
            disabled: !this.$hasPerm('xpack.add_syncinstancetaskexecution')
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/run/`
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        },
        {
          title: this.$t('Timer'),
          attrs: {
            model: this.object.task,
            type: 'primary',
            disabled: !this.hasEditPerm(),
            label: this.$t('Modify')
          },
          callbacks: {
            click: function(val) {
              this.showTimer = true
            }.bind(this)
          }
        }
      ],
      strategyRelationConfig: {
        icon: 'fa-info',
        title: this.$t('Strategy'),
        objectsAjax: {
          url: '/api/v1/xpack/cloud/strategies/',
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        },
        select2Config: {
          quickAddCallback: () => {
            window.open(this.$router.resolve({ name: 'CloudStrategyCreate' }).href, '_blank')
          }
        },
        hasObjectsId: this.object?.task?.strategy?.map(i => i.id) || [],
        performAdd: (items) => {
          const newData = []
          const value = this.$refs.StrategyRelation.iHasObjects
          value.map(v => {
            newData.push(v.value)
          })
          const relationUrl = `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/`
          items.map(v => {
            newData.push(v.value)
          })
          return this.$axios.patch(relationUrl, { strategy: newData })
        },
        performDelete: (item) => {
          const itemId = item.value
          const newData = []
          const value = this.$refs.StrategyRelation.iHasObjects
          value.map(v => {
            if (v.value !== itemId) {
              newData.push(v.value)
            }
          })
          const relationUrl = `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/`
          return this.$axios.patch(relationUrl, { strategy: newData })
        }
      },
      detailFields: [
        {
          key: this.$t('Strategy'),
          value: this.object?.task?.strategy?.map(item => item.name).join(', ')
        },
        {
          key: this.$t('Timer'),
          value: this.object?.task?.is_periodic
        },
        {
          key: this.$t('Region'),
          value: this.object.task?.regions,
          formatter(row, value) {
            return (<div>{
              value?.map((content) => {
                return <div>{ content }</div>
              })}
            </div>)
          }
        },
        {
          key: this.$t('ReleaseAssets'),
          value: this.object?.task.release_assets
        },
        {
          key: this.$t('DateLastSync'),
          value: this.object?.task?.date_last_sync ? toSafeLocalDateStr(this.object?.task.date_created) : ''
        },
        {
          key: this.$t('DateCreated'),
          value: this.object?.task.date_created ? toSafeLocalDateStr(this.object?.task.date_created) : ''
        },
        'comment'
      ]
    }
  },
  methods: {
    hasEditPerm() {
      return this.$hasPerm('xpack.change_account') && this.$hasPerm('xpack.change_syncinstancetask')
    }
  }
}
</script>

<style scoped>

</style>

