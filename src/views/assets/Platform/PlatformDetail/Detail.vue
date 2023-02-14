<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
      <IBox :title="$tc('assets.Protocols')">
        <ProtocolSelector
          v-if="protocolChoices"
          v-model="object.protocols"
          :choices="protocolChoices"
          :readonly="object['internal']"
        />
        <el-button
          v-if="!object.internal"
          size="small"
          style="margin-top: 10px"
          type="primary"
          @click="updateProtocols"
        >
          {{ $t('common.Update') }}
        </el-button>
      </IBox>
    </el-col>
    <PlatformDetailUpdateDialog
      v-if="visible"
      :object="object"
      :show-fields="fields"
      :visible.sync="visible"
    />
  </el-row>
</template>

<script>
import { IBox } from '@/components'
import AutoDetailCard from '@/components/DetailCard/auto'
import QuickActions from '@/components/QuickActions'
import PlatformDetailUpdateDialog from './PlatformDetailUpdateDialog'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'

export default {
  name: 'Detail',
  components: {
    IBox,
    QuickActions,
    AutoDetailCard,
    ProtocolSelector,
    PlatformDetailUpdateDialog
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
      ],
      protocolChoices: null
    }
  },
  computed: {},
  async mounted() {
    await this.getTypeConstraints()
  },
  methods: {
    updateProtocols() {
      const url = `/api/v1/assets/platforms/${this.object.id}/`
      this.$axios.patch(url, { protocols: this.object.protocols }).then(() => {
        this.$message.success(this.$tc('common.UpdateSuccess'))
      })
    },
    async getTypeConstraints() {
      const category = this.object.category.value
      const type = this.object.type.value
      const url = `/api/v1/assets/categories/constraints/?category=${category}&type=${type}`
      const constraints = await this.$axios.get(url)
      this.protocolChoices = constraints['protocols']
    },
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
        }
      ]

      return quickActions
    }
  }
}
</script>

<style lang='less' scoped>

</style>
