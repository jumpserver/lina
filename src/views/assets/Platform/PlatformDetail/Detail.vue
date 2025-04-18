<template>
  <TwoCol>
    <template>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
      <IBox :title="$tc('Protocols')">
        <ProtocolSelector
          v-if="protocolChoices"
          v-model="object.protocols"
          :choices="protocolChoices"
          :readonly="!canEdit"
        />
        <el-button
          v-if="canEdit"
          size="small"
          style="margin-top: 10px"
          type="primary"
          @click="updateProtocols"
        >
          {{ $t('Update') }}
        </el-button>
      </IBox>
      <PlatformDetailUpdateDialog
        v-if="visible"
        :object="object"
        :show-fields="fields"
        :visible.sync="visible"
      />
    </template>
  </TwoCol>
</template>

<script>
import { IBox } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import QuickActions from '@/components/Common/QuickActions'
import PlatformDetailUpdateDialog from './PlatformDetailUpdateDialog'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    IBox,
    QuickActions,
    AutoDetailCard,
    ProtocolSelector,
    PlatformDetailUpdateDialog
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      fields: ['gateway_enabled'],
      quickActions: [],
      url: `/api/v1/assets/platforms/${this.object.id}/`,
      detailFields: [
        'id', 'name', 'charset', 'internal',
        {
          key: this.$t('Type'),
          value: `${this.object.category?.label}/${this.object.type?.label}`
        },
        'su_method', 'date_created', 'date_updated',
        'created_by', 'updated_by', 'comment'
      ],

      protocolChoices: null,
      constraints: {},
      canEdit: !this.object['internal'] && this.$hasPerm('assets.change_platform')
    }
  },
  computed: {},
  async mounted() {
    await this.getTypeConstraints()
    await this.setQuickActions()
  },
  methods: {
    updateProtocols() {
      const url = `/api/v1/assets/platforms/${this.object.id}/`
      this.$axios.patch(url, { protocols: this.object.protocols }).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    },
    async getTypeConstraints() {
      const category = this.object.category.value
      const type = this.object.type.value
      const url = `/api/v1/assets/categories/constraints/?category=${category}&type=${type}`
      const constraints = await this.$axios.get(url)
      this.protocolChoices = constraints['protocols']
      this.constraints = constraints
    },
    async setQuickActions() {
      const { object } = this
      const quickActions = [
        {
          title: this.$t('EnableGateway'),
          type: 'switch',
          attrs: {
            label: this.$t('Update'),
            model: object['gateway_enabled'],
            disabled: !this.canEdit || this.constraints['gateway_enabled'] === false
          },
          callbacks: Object.freeze({
            change: (val) => {
              const data = { gateway_enabled: val }
              this.$axios.patch(
                `/api/v1/assets/platforms/${object.id}/`, data).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('SuEnabled'),
          type: 'switch',
          attrs: {
            model: object['su_enabled'],
            disabled: !this.canEdit || this.constraints['su_enabled'] === false
          },
          callbacks: Object.freeze({
            change: (val) => {
              const data = { su_enabled: val }
              this.$axios.patch(
                `/api/v1/assets/platforms/${object.id}/`, data).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              })
            }
          })
        },
        {
          title: this.$t('SyncProtocolToAsset'),
          attrs: {
            type: 'primary',
            label: this.$t('Sync'),
            disabled: !this.canEdit
          },
          callbacks: Object.freeze({
            click: () => {
              const data = { platform_id: this.object.id }
              this.$axios.post(
                '/api/v1/assets/assets/sync-platform-protocols/', data).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              })
            }
          })
        }
      ]
      this.quickActions = quickActions
    }
  }
}
</script>

<style lang='less' scoped>

</style>
