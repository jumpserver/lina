<template>
  <div>
    <TwoCol>
      <template>
        <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      </template>
      <template #right>
        <QuickActions
          v-if="object.id"
          :actions="quickActions"
          :title="$tc('ConvenientOperate')"
          type="primary"
        />
      </template>
    </TwoCol>
    <DiffDetail ref="DetailDialog" :title="$tc('OperateLog')" />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import DiffDetail from '@/components/Dialog/DiffDetail'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    QuickActions,
    AutoDetailCard,
    DiffDetail
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
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
  computed: {}
}
</script>

<style lang="scss" scoped>
</style>
