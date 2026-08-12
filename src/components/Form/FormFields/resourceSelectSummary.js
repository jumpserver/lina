export function getResourceId(item, valueKey) {
  if (item && typeof item === 'object') {
    return item[valueKey] ?? item.value ?? item.id
  }
  return item
}

export function normalizeResourceValue(value, valueKey) {
  const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value]
  return values
    .map((item) => getResourceId(item, valueKey))
    .filter((item) => item !== undefined && item !== null && item !== '')
}

export default {
  props: {
    summaryNameLimit: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      selectedSummaryItems: [],
      summaryLoadedCount: 0,
      summaryResourceCache: new Map(),
      skippedSummaryValueSignature: ''
    }
  },
  computed: {
    displayResourceName() {
      return this.resourceName || ''
    },
    normalizedSummaryNameLimit() {
      return Math.max(1, Math.floor(this.summaryNameLimit || 20))
    },
    summaryHasMore() {
      return this.summaryLoadedCount < this.selectedValue.length
    },
    summaryText() {
      if (this.selectedValue.length === 0) {
        return this.$t('ResourceSelectEmpty', { resource: this.displayResourceName })
      }
      return this.summaryCountText
    },
    summaryCountText() {
      return this.$t('ResourceSelectSelectedCount', {
        count: this.selectedValue.length,
        resource: this.displayResourceName
      })
    }
  },
  watch: {
    selectedValue: {
      deep: true,
      immediate: true,
      handler() {
        this.cacheSummaryResources(this.externalValue)
        const signature = this.getSelectedValueSignature(this.selectedValue)
        if (signature === this.skippedSummaryValueSignature) {
          this.skippedSummaryValueSignature = ''
          return
        }
        this.skippedSummaryValueSignature = ''
        this.resetSelectedSummaryItems()
      }
    },
    normalizedSummaryNameLimit() {
      this.resetSelectedSummaryItems()
    }
  },
  methods: {
    getSelectedValueSignature(value) {
      return JSON.stringify(value.map((item) => String(item)))
    },
    cacheSummaryResources(resources) {
      const values = Array.isArray(resources) ? resources : resources ? [resources] : []
      values.forEach((item) => {
        if (!item || typeof item !== 'object') {
          return
        }
        const resourceId = getResourceId(item, this.valueKey)
        const name = String(item.name || '').trim()
        if (resourceId === undefined || resourceId === null || resourceId === '' || !name) {
          return
        }
        this.summaryResourceCache.set(String(resourceId), { value: resourceId, name })
      })
    },
    getSelectedSummaryResources() {
      return this.selectedValue
        .map((id) => this.summaryResourceCache.get(String(id)))
        .filter(Boolean)
    },
    syncSelectedSummaryItems() {
      this.selectedSummaryItems = this.selectedValue
        .slice(0, this.summaryLoadedCount)
        .map((id) => this.summaryResourceCache.get(String(id)))
        .filter(Boolean)
    },
    resetSelectedSummaryItems() {
      this.summaryLoadedCount = 0
      this.selectedSummaryItems = []
      this.loadNextSummaryBatch()
    },
    loadNextSummaryBatch() {
      if (!this.summaryHasMore) {
        return
      }
      this.cacheSummaryResources(this.externalValue)
      this.summaryLoadedCount = Math.min(
        this.summaryLoadedCount + this.normalizedSummaryNameLimit,
        this.selectedValue.length
      )
      this.syncSelectedSummaryItems()
    },
    updateSelectedValue(value) {
      const payload = [...value]
      this.selectedValue = payload
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
      this.$emit('change', payload)
    },
    syncSelectedValue(value) {
      this.cacheSummaryResources(value)
      const payload = normalizeResourceValue(value, this.valueKey)
      const unchanged =
        payload.length === this.selectedValue.length &&
        payload.every((item, index) => String(item) === String(this.selectedValue[index]))
      if (!unchanged) {
        this.selectedValue = payload
      }
    },
    removeSummaryResource(value) {
      if (this.isDisabled) {
        return
      }
      const normalizedValue = String(value)
      const payload = this.selectedValue.filter((item) => String(item) !== normalizedValue)
      this.summaryLoadedCount = Math.min(this.summaryLoadedCount, payload.length)
      this.skippedSummaryValueSignature = this.getSelectedValueSignature(payload)
      this.updateSelectedValue(payload)
      this.syncSelectedSummaryItems()
    }
  }
}
