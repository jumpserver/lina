import { createSourceIdCache } from '@/api/common'

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
      summaryRequestVersion: 0,
      skippedSummaryValueSignature: '',
      pendingSummaryItemIds: new Set()
    }
  },
  computed: {
    displayResourceName() {
      return this.resourceName || ''
    },
    normalizedSummaryNameLimit() {
      return Math.max(1, Math.floor(this.summaryNameLimit || 20))
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
        const signature = this.getSelectedValueSignature(this.selectedValue)
        if (signature === this.skippedSummaryValueSignature) {
          this.skippedSummaryValueSignature = ''
          return
        }
        this.skippedSummaryValueSignature = ''
        this.loadSelectedSummaryItems()
      }
    },
    resourceUrl() {
      this.loadSelectedSummaryItems()
    },
    normalizedSummaryNameLimit() {
      this.loadSelectedSummaryItems()
    }
  },
  methods: {
    getSelectedValueSignature(value) {
      return JSON.stringify(value.map((item) => String(item)))
    },
    getEmbeddedSelectedItems(limit) {
      const values = Array.isArray(this.externalValue) ? this.externalValue : [this.externalValue]
      const selectedIds = new Set(this.selectedValue.slice(0, limit).map((id) => String(id)))
      const items = []
      const addedIds = new Set()
      for (const item of values) {
        const resourceId = getResourceId(item, this.valueKey)
        const normalizedId = String(resourceId)
        if (
          !item ||
          typeof item !== 'object' ||
          !selectedIds.has(normalizedId) ||
          addedIds.has(normalizedId)
        ) {
          continue
        }
        const name = String(item.name || '').trim()
        if (name) {
          items.push({ value: resourceId, name })
          addedIds.add(normalizedId)
        }
        if (items.length >= limit) {
          break
        }
      }
      return items
    },
    orderSelectedItems(items, limit) {
      const itemsById = new Map(items.map((item) => [String(item.value), item]))
      return this.selectedValue
        .map((id) => itemsById.get(String(id)))
        .filter(Boolean)
        .slice(0, limit)
    },
    async loadSelectedSummaryItems() {
      const requestVersion = ++this.summaryRequestVersion
      const limit = Math.min(this.selectedValue.length, this.normalizedSummaryNameLimit)
      const summaryValues = this.selectedValue.slice(0, limit)
      const embeddedItems = this.getEmbeddedSelectedItems(limit)
      this.selectedSummaryItems = this.orderSelectedItems(embeddedItems, limit)

      if (limit === 0 || embeddedItems.length >= limit || !this.resourceUrl || !this.$axios) {
        return
      }

      try {
        const { spm } = await createSourceIdCache(summaryValues)
        const url = new URL(this.resourceUrl, location.origin)
        const queryParams =
          typeof this.queryParams === 'function' ? this.queryParams() : this.queryParams
        const response = await this.$axios.get(url.pathname, {
          params: {
            ...Object.fromEntries(url.searchParams),
            ...(queryParams || {}),
            fields_size: 'mini',
            limit,
            spm
          }
        })
        if (requestVersion !== this.summaryRequestVersion) {
          return
        }
        const rows = Array.isArray(response) ? response : response?.results || []
        const items = [...embeddedItems]
        const addedIds = new Set(items.map((item) => String(item.value)))
        for (const row of rows) {
          const resourceId = getResourceId(row, this.valueKey)
          const normalizedId = String(resourceId)
          const name = String(row?.name || '').trim()
          if (name && !addedIds.has(normalizedId)) {
            items.push({ value: resourceId, name })
            addedIds.add(normalizedId)
          }
          if (items.length >= limit) {
            break
          }
        }
        this.selectedSummaryItems = this.orderSelectedItems(items, limit)
      } catch (_) {
        if (requestVersion === this.summaryRequestVersion) {
          this.selectedSummaryItems = this.orderSelectedItems(embeddedItems, limit)
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
      const payload = normalizeResourceValue(value, this.valueKey)
      const unchanged =
        payload.length === this.selectedValue.length &&
        payload.every((item, index) => String(item) === String(this.selectedValue[index]))
      if (!unchanged) {
        this.selectedValue = payload
      }
    },
    getNextSummaryValue(value) {
      const loadedIds = new Set(this.selectedSummaryItems.map((item) => String(item.value)))
      return value.find((item) => {
        const normalizedId = String(item)
        return !loadedIds.has(normalizedId) && !this.pendingSummaryItemIds.has(normalizedId)
      })
    },
    async loadSingleSummaryItem(value) {
      if (value === undefined || value === null || value === '') {
        return
      }
      const normalizedId = String(value)
      this.pendingSummaryItemIds.add(normalizedId)
      try {
        const url = new URL(this.resourceUrl, location.origin)
        const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
        const queryParams =
          typeof this.queryParams === 'function' ? this.queryParams() : this.queryParams
        const row = await this.$axios.get(`${pathname}${encodeURIComponent(value)}/`, {
          params: {
            ...Object.fromEntries(url.searchParams),
            ...(queryParams || {}),
            fields_size: 'mini'
          }
        })
        const isStillSelected = this.selectedValue.some(
          (item) => String(item) === normalizedId
        )
        const isAlreadyLoaded = this.selectedSummaryItems.some(
          (item) => String(item.value) === normalizedId
        )
        const name = String(row?.name || '').trim()
        if (!isStillSelected || isAlreadyLoaded || !name) {
          return
        }
        const limit = Math.min(this.selectedValue.length, this.normalizedSummaryNameLimit)
        this.selectedSummaryItems = this.orderSelectedItems(
          [...this.selectedSummaryItems, { value, name }],
          limit
        )
      } catch (_) {
        // 摘要补位失败不影响表单值，下一次完整同步时会重新加载。
      } finally {
        this.pendingSummaryItemIds.delete(normalizedId)
      }
    },
    removeSummaryResource(value) {
      if (this.isDisabled) {
        return
      }
      const normalizedValue = String(value)
      const payload = this.selectedValue.filter((item) => String(item) !== normalizedValue)
      this.summaryRequestVersion += 1
      this.selectedSummaryItems = this.selectedSummaryItems.filter(
        (item) => String(item.value) !== normalizedValue
      )
      this.skippedSummaryValueSignature = this.getSelectedValueSignature(payload)
      this.updateSelectedValue(payload)
      this.loadSingleSummaryItem(this.getNextSummaryValue(payload))
    }
  }
}
