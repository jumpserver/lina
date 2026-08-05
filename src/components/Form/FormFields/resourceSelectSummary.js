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
      default: 3
    }
  },
  data() {
    return {
      selectedNames: [],
      summaryRequestVersion: 0
    }
  },
  computed: {
    displayResourceName() {
      return this.resourceName || ''
    },
    normalizedSummaryNameLimit() {
      return Math.max(1, Math.floor(this.summaryNameLimit || 3))
    },
    selectedNamesText() {
      return this.selectedNames.join(', ')
    },
    summaryText() {
      if (this.selectedValue.length === 0) {
        return this.$t('ResourceSelectEmpty', { resource: this.displayResourceName })
      }
      if (this.selectedNames.length === 0) {
        return this.$t('ResourceSelectSelectedCount', {
          count: this.selectedValue.length,
          resource: this.displayResourceName
        })
      }
      return this.$t('ResourceSelectSelectedSummary', {
        names: this.selectedNamesText,
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
        this.loadSelectedNames()
      }
    },
    resourceUrl() {
      this.loadSelectedNames()
    },
    normalizedSummaryNameLimit() {
      this.loadSelectedNames()
    }
  },
  methods: {
    getEmbeddedSelectedNames() {
      const values = Array.isArray(this.externalValue) ? this.externalValue : [this.externalValue]
      const selectedIds = new Set(this.selectedValue.map((id) => String(id)))
      const names = []
      for (const item of values) {
        const resourceId = getResourceId(item, this.valueKey)
        if (!item || typeof item !== 'object' || !selectedIds.has(String(resourceId))) {
          continue
        }
        const name = String(item.name || '').trim()
        if (name && !names.includes(name)) {
          names.push(name)
        }
        if (names.length >= this.normalizedSummaryNameLimit) {
          break
        }
      }
      return names
    },
    async loadSelectedNames() {
      const requestVersion = ++this.summaryRequestVersion
      const limit = Math.min(this.selectedValue.length, this.normalizedSummaryNameLimit)
      const embeddedNames = this.getEmbeddedSelectedNames()
      this.selectedNames = embeddedNames.slice(0, limit)

      if (limit === 0 || embeddedNames.length >= limit || !this.resourceUrl || !this.$axios) {
        return
      }

      try {
        const { spm } = await createSourceIdCache([...this.selectedValue])
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
        const names = [...embeddedNames]
        for (const row of rows) {
          const name = String(row?.name || '').trim()
          if (name && !names.includes(name)) {
            names.push(name)
          }
          if (names.length >= limit) {
            break
          }
        }
        this.selectedNames = names.slice(0, limit)
      } catch (_) {
        if (requestVersion === this.summaryRequestVersion) {
          this.selectedNames = embeddedNames.slice(0, limit)
        }
      }
    }
  }
}
