<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
    </el-col>
    <PlatformDetailUpdateDialog v-if="visible" :visible.sync="visible" :fields="fields" />
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import PlatformDetailUpdateDialog from './PlatformDetailUpdateDialog'

export default {
  name: 'Detail',
  components: {
    DetailCard,
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
    const myFields = {
      AccountEnabled: ['su_enabled', 'su_method'],
      ProtocolsEnabled: ['protocols_enabled', 'protocols'],
      AutoEnabled: ['automation']
    }

    return {
      visible: false,
      fields: ['domain_enabled'],
      quickActions: this.setQuickActions(myFields)
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.BasePlatform'),
          value: this.object.base
        },
        {
          key: this.$t('assets.Charset'),
          value: this.object.charset
        },
        {
          key: this.$t('assets.Meta'),
          value: JSON.stringify(this.object.meta)
        },
        {
          key: this.$t('assets.Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  methods: {
    setQuickActions(fields = []) {
      const vm = this
      const { object } = this
      const quickActions = [
        {
          title: this.$t('assets.DomainEnabled'),
          type: 'switcher',
          attrs: {
            label: this.$t('common.Update'),
            model: object['domain_enabled'],
            disabled: (object.internal || !vm.$hasPerm('assets.change_platform'))
          },
          callbacks: Object.freeze({
            change: (val) => {
              const data = { domain_enabled: val }
              this.$axios.patch(
                `/api/v1/assets/platforms/${this.object.id}/`, data).then(res => {
                this.$message.success(this.$t('common.updateSuccessMsg'))
              })
            }
          })
        }
      ]

      for (const [key, value] of Object.entries(fields)) {
        const option = {
          title: this.$t(`assets.${key}`),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update'),
            disabled: (object.internal || !vm.$hasPerm('assets.change_platform'))
          },
          callbacks: Object.freeze({
            click: () => {
              this.fields = value
              this.visible = !this.visible
            }
          })
        }
        quickActions.push(option)
      }

      return quickActions
    }
  }
}
</script>

<style lang='less' scoped>

</style>
