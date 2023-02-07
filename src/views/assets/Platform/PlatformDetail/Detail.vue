<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
    <PlatformDetailUpdateDialog
      v-if="visible"
      :visible.sync="visible"
      :show-fields="fields"
      :object="object"
    />
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'
import QuickActions from '@/components/QuickActions'
import PlatformDetailUpdateDialog from './PlatformDetailUpdateDialog'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    QuickActions,
    PlatformDetailUpdateDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      fields: ['domain_enabled'],
      quickActions: this.setQuickActions(),
      url: `/api/v1/assets/platforms/${this.object.id}`,
      detailFields: [
        'name', 'charset',
        {
          key: this.$t('assets.Type'),
          value: `${this.object.category?.label}/${this.object.type?.label}`
        },
        'comment'
      ]
    }
  },
  computed: {
  },
  methods: {
    setQuickActions() {
      const vm = this
      const { object } = this
      const suEnabledDisabled = ['database', 'device']
      const quickActions = [
        {
          title: this.$t('assets.DomainEnabled'),
          type: 'switch',
          attrs: {
            label: this.$t('common.Update'),
            model: object['domain_enabled'],
            disabled: (object.internal || !vm.$hasPerm('assets.change_platform'))
          },
          callbacks: Object.freeze({
            change: (val) => {
              const data = { domain_enabled: val }
              this.$axios.patch(
                `/api/v1/assets/platforms/${object.id}/`, data).then(res => {
                this.$message.success(this.$tc('common.updateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t(`assets.AccountEnabled`),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update'),
            disabled: (
              suEnabledDisabled.includes(object.category?.value) ||
                object.internal || !vm.$hasPerm('assets.change_platform')
            )
          },
          callbacks: Object.freeze({
            click: () => {
              this.fields = ['su_enabled', 'su_method']
              this.visible = !this.visible
            }
          })
        },
        {
          title: this.$t(`assets.ProtocolsEnabled`),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update'),
            disabled: (object.internal || !vm.$hasPerm('assets.change_platform'))
          },
          callbacks: Object.freeze({
            click: () => {
              this.fields = ['protocols']
              this.visible = !this.visible
            }
          })
        }
      ]

      return quickActions
    }
  }
}
</script>

<style lang='less' scoped>

</style>
