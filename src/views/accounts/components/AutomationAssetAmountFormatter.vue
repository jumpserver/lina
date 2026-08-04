<script>
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import { getAutomationAssets } from './automation'

export default {
  name: 'AutomationAssetAmountFormatter',
  extends: AmountFormatter,
  data() {
    return {
      automationAssetsRequestId: 0
    }
  },
  mounted() {
    this.refreshAutomationAssets()
  },
  methods: {
    async refreshAutomationAssets() {
      const requestId = ++this.automationAssetsRequestId
      try {
        const assets = await getAutomationAssets(this.$axios, this.cellValue, this.row.nodes)
        if (requestId !== this.automationAssetsRequestId) {
          return
        }
        this.listData = assets
        this.amount = assets.length
      } catch (error) {
        this.$log.error('Failed to get automation assets', error)
      }
    }
  }
}
</script>
