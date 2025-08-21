<template>
  <div>
    <TwoCol>
      <template>
        <AutoDetailCard
          :excludes="excludes"
          :object="object"
          :url="url"
        />
        <AutoDetailCard :fields="detailFields" :object="object" :title="$tc('TaskDetail')" :url="url" />
      </template>
      <template #right>
        <QuickActions :actions="quickEditActions" type="primary" />
        <QuickActions :actions="quickExecuteActions" :title="$t('Sync')" type="primary" />
        <RelationCard
          ref="StrategyRelation"
          v-perms="'xpack.change_strategy'"
          style="margin-top: 15px"
          type="info"
          v-bind="strategyRelationConfig"
        />
      </template>
    </TwoCol>
    <Dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :show-buttons="false"
      :title="$tc('Timer')"
      :visible.sync="showTimer"
    >
      <TimingPanel :object="object" :visible.sync="showTimer" />
    </Dialog>
  </div>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { toSafeLocalDateStr } from '@/utils/common/time'
import RelationCard from '@/components/Cards/RelationCard'
import { QuickActions } from '@/components'
import TimingPanel from '@/views/assets/Cloud/Account/components/TimingPanel'
import { openTaskPage } from '@/utils/jms/index'
import Dialog from '@/components/Dialog'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'CloudAccountDetail',
  components: {
    TwoCol,
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
          title: this.$t('IPType'),
          type: 'updateSelect',
          attrs: {
            model: this.object.task.sync_ip_type,
            type: 'primary',
            multiple: false,
            clearable: false,
            showSelect: true,
            options: [
              { label: this.$t('PublicIP'), value: 1 },
              { label: this.$t('PrivateIP'), value: 0 }
            ],
            disabled: !this.hasEditPerm()
          },
          callbacks: {
            change: function(val) {
              this.updateTaskData({ 'sync_ip_type': val })
            }.bind(this)
          }
        },
        {
          title: this.$t('ReleaseAssets'),
          type: 'switch',
          attrs: {
            model: this.object.task.release_assets,
            disabled: !this.hasEditPerm()
          },
          callbacks: {
            change: function(val) {
              this.updateTaskData({ 'release_assets': val })
            }.bind(this)
          }
        },
        {
          title: this.$t('IsAlwaysUpdate'),
          type: 'switch',
          attrs: {
            showTip: true,
            tip: this.$t('IsAlwaysUpdateHelpTip'),
            model: this.object.task.is_always_update,
            disabled: !this.hasEditPerm()
          },
          callbacks: {
            change: function(val) {
              this.updateTaskData({ 'is_always_update': val })
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
          title: this.$t('TimerExecution'),
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
        title: this.$t('Strategy'),
        objectsAjax: {
          url: `/api/v1/xpack/cloud/strategies/?category=${this.object.category}`,
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
          value: this.object.task?.regions_display,
          formatter(row, value) {
            return (<div>{
              value?.map((content) => {
                return <div>{content}</div>
              })}
            </div>)
          }
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
    },
    updateTaskData(data) {
      this.$axios.patch(
        `/api/v1/xpack/cloud/sync-instance-tasks/${this.object.task.id}/`,
        data
      ).then(res => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(err => {
        this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
      })
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-card__body {
  padding: 10px 20px 20px 20px;

  .el-form {
    margin-top: unset;
  }
}
</style>
