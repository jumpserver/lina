<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="14" :sm="24">
        <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
      </el-col>
      <el-col :md="10" :sm="24">
        <QuickActions
          v-if="object.id"
          :actions="quickActions"
          :title="this.$tc('common.ConvenientOperate')"
          type="primary"
        />
      </el-col>
    </el-row>
    <OperateLogDetailDialog
      ref="DetailDialog"
    />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/DetailCard/auto'
import OperateLogDetailDialog from './DetailDialog'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    AutoDetailCard,
    OperateLogDetailDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/audits/operate-logs/${this.object.id}`,
      detailFields: [
        'id', 'user', 'remote_addr', 'resource',
        'resource_type_display', 'datetime'
      ],
      quickActions: [
        {
          title: this.$t('audits.ChangeField'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Detail')
          },
          callbacks: {
            click: function() {
              this.$refs.DetailDialog.show(this.object.id)
            }.bind(this)
          }
        }
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped lang="scss">
</style>
