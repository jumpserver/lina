import { createSourceIdCache } from '@/api/common'

export function getResourceId(item, valueKey = 'id') {
  if (item && typeof item === 'object') {
    // Prefer the configured key / real identity fields first.
    // Do not fall back to item.value before id/pk: Node.value is a display name.
    const byKey = valueKey ? item[valueKey] : undefined
    if (byKey !== undefined && byKey !== null && byKey !== '') {
      return byKey
    }
    const byId = item.id ?? item.pk
    if (byId !== undefined && byId !== null && byId !== '') {
      return byId
    }
    // Select2 / summary option shape: { value, label/name }
    if (item.value !== undefined && item.value !== null && item.value !== '') {
      return item.value
    }
    return undefined
  }
  return item
}

export function normalizeResourceValue(value, valueKey) {
  const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value]
  return values
    .map((item) => getResourceId(item, valueKey))
    .filter((item) => item !== undefined && item !== null && item !== '')
}

function isPlainId(item) {
  return item === null || item === undefined || typeof item !== 'object'
}

export function resourceValueNeedsNormalize(value, valueKey = 'id') {
  const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value]
  return values.some((item) => !isPlainId(item))
}

export default {
  props: {
    summaryCountOnly: {
      type: Boolean,
      default: false
    },
    summaryNameLimit: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      selectedSummaryItems: [],
      summaryLoadedCount: 0,
      summaryLoading: false,
      summaryRequestVersion: 0,
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
      return !this.summaryCountOnly && this.summaryLoadedCount < this.selectedValue.length
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
  mounted() {
    // 详情回填的对象列表在挂载时规范化为主键并写回表单
    const external = this.modelValue !== undefined ? this.modelValue : this.value
    this.syncSelectedValue(external)
  },
  methods: {
    getSelectedValueSignature(value) {
      return JSON.stringify(value.map((item) => String(item)))
    },
    cacheSummaryResources(resources) {
      if (this.summaryCountOnly) {
        return
      }
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
      if (this.summaryCountOnly) {
        return []
      }
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
      this.summaryRequestVersion += 1
      this.summaryLoading = false
      this.summaryLoadedCount = 0
      this.selectedSummaryItems = []
      if (!this.summaryCountOnly) {
        this.loadNextSummaryBatch()
      }
    },
    normalizeSummaryResponse(response) {
      return Array.isArray(response) ? response : response?.results || []
    },
    async fetchSummaryResources(ids) {
      if (ids.length === 0 || !this.resourceUrl) {
        return []
      }
      const { spm } = await createSourceIdCache(ids)
      const response = await this.$axios.get(this.resourceUrl, {
        params: {
          spm,
          fields_size: 'mini',
          limit: ids.length,
          offset: 0
        }
      })
      return this.normalizeSummaryResponse(response)
    },
    async loadNextSummaryBatch() {
      if (!this.summaryHasMore || this.summaryLoading) {
        return
      }

      const requestVersion = this.summaryRequestVersion
      const start = this.summaryLoadedCount
      const end = Math.min(start + this.normalizedSummaryNameLimit, this.selectedValue.length)
      const batchIds = this.selectedValue.slice(start, end)
      const missingIds = batchIds.filter(
        (resourceId) => !this.summaryResourceCache.has(String(resourceId))
      )

      this.summaryLoading = true
      try {
        if (missingIds.length > 0) {
          const resources = await this.fetchSummaryResources(missingIds)
          if (requestVersion !== this.summaryRequestVersion) {
            return
          }
          this.cacheSummaryResources(resources)
        }
        if (requestVersion !== this.summaryRequestVersion) {
          return
        }
        this.summaryLoadedCount = end
        this.syncSelectedSummaryItems()
      } catch {
        // Keep this batch pending so a later downward scroll can retry it.
      } finally {
        if (requestVersion === this.summaryRequestVersion) {
          this.summaryLoading = false
        }
      }
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
      // API 回填多为对象列表；写回主键数组，避免 PUT 时仍带对象或丢 id
      if (resourceValueNeedsNormalize(value, this.valueKey)) {
        const externalIds = normalizeResourceValue(value, this.valueKey)
        const sameAsExternal =
          externalIds.length === payload.length &&
          externalIds.every((item, index) => String(item) === String(payload[index]))
        if (sameAsExternal) {
          this.$emit('input', payload)
          this.$emit('update:modelValue', payload)
          this.$emit('update:model-value', payload)
        }
      }
    },
    removeSummaryResource(value) {
      if (this.isDisabled) {
        return
      }
      const normalizedValue = String(value)
      const removedIndex = this.selectedValue.findIndex((item) => String(item) === normalizedValue)
      const payload = this.selectedValue.filter((item) => String(item) !== normalizedValue)
      if (removedIndex > -1 && removedIndex < this.summaryLoadedCount) {
        this.summaryLoadedCount -= 1
      }
      this.summaryLoadedCount = Math.min(this.summaryLoadedCount, payload.length)
      this.summaryRequestVersion += 1
      this.summaryLoading = false
      this.skippedSummaryValueSignature = this.getSelectedValueSignature(payload)
      this.updateSelectedValue(payload)
      this.syncSelectedSummaryItems()
    }
  }
}
