<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="15" :sm="24">
        <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      </el-col>
      <el-col :md="9" :sm="24">
        <QuickActions
          v-if="object.id"
          :actions="quickActions"
          :title="$tc('ConvenientOperate')"
          type="primary"
        />
      </el-col>
    </el-row>
    <DiffDetail ref="DetailDialog" :title="$tc('OperateLog')" />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import DiffDetail from '@/components/Dialog/DiffDetail'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    AutoDetailCard,
    DiffDetail
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
          title: this.$t('ChangeField'),
          attrs: {
            type: 'primary',
            label: this.$t('Detail')
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/audits/operate-logs/${this.object.id}/?type=action_detail`
              ).then(res => {
                this.$refs.DetailDialog.show(res.diff)
              })
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

<style lang="scss" scoped>
</style>
