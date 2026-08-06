import _ from 'lodash'

const LABEL_API = '/api/v1/labels/labels/'
const LABEL_LIMIT = 200
const SEARCH_DEBOUNCE = 300

export default {
  data() {
    return {
      keyLoading: false,
      valueLoading: false,
      labelOptions: [],
      remoteValueOptions: [],
      activeKey: '',
      keyQuery: '',
      valueQuery: '',
      keyRequestId: 0,
      valueRequestId: 0,
      labelSelectorResetting: false
    }
  },
  computed: {
    labelSelectorVisible() {
      return true
    },
    filteredKeyOptions() {
      return this.labelOptions
    },
    activeKeyOption() {
      return this.labelOptions.find((option) => option.value === this.activeKey)
    },
    localValueOptions() {
      return this.decorateLabelValueOptions(this.activeKeyOption?.values || [])
    },
    filteredValueOptions() {
      return this.valueQuery.trim() ? this.remoteValueOptions : this.localValueOptions
    }
  },
  watch: {
    keyQuery() {
      if (!this.labelSelectorResetting && this.labelSelectorVisible) {
        this.debouncedSearchKeys()
      }
    },
    valueQuery() {
      if (this.labelSelectorResetting || !this.labelSelectorVisible || !this.activeKey) return

      this.cancelLabelValueSearch()
      if (this.valueQuery.trim()) {
        this.debouncedSearchValues()
      }
    }
  },
  created() {
    this.debouncedSearchKeys = _.debounce(
      () => this.getLabelOptions(this.keyQuery),
      SEARCH_DEBOUNCE
    )
    this.debouncedSearchValues = _.debounce(
      () => this.getValueOptions(this.activeKey, this.valueQuery),
      SEARCH_DEBOUNCE
    )
  },
  beforeUnmount() {
    this.cancelLabelSelectorRequests()
  },
  methods: {
    decorateLabelValueOptions(options) {
      return options
    },
    normalizeLabelListResponse(data) {
      const results = Array.isArray(data) ? data : data?.results
      return Array.isArray(results) ? results : []
    },
    buildLabelOptions(labels) {
      const groupedLabels = _.groupBy(labels, 'name')
      return _.sortBy(
        Object.entries(groupedLabels).map(([key, values]) => ({
          value: key,
          label: key,
          values: _.uniqBy(
            _.sortBy(
              values.map((label) => ({
                value: label.value,
                label: label.value,
                labelData: label
              })),
              'label'
            ),
            'value'
          )
        })),
        'label'
      )
    },
    cancelLabelKeySearch() {
      this.keyRequestId += 1
      this.debouncedSearchKeys?.cancel()
      this.keyLoading = false
    },
    cancelLabelValueSearch() {
      this.valueRequestId += 1
      this.debouncedSearchValues?.cancel()
      this.valueLoading = false
      this.remoteValueOptions = []
    },
    cancelLabelSelectorRequests() {
      this.cancelLabelKeySearch()
      this.cancelLabelValueSearch()
    },
    resetLabelSelectorSearch() {
      this.labelSelectorResetting = true
      this.cancelLabelSelectorRequests()
      this.keyQuery = ''
      this.valueQuery = ''
      this.$nextTick(() => {
        this.labelSelectorResetting = false
      })
    },
    async getLabelOptions(query = '') {
      const requestId = ++this.keyRequestId
      this.keyLoading = true
      return this.$axios
        .get(LABEL_API, {
          params: {
            limit: LABEL_LIMIT,
            ...(query.trim() && { name__icontains: query.trim() })
          }
        })
        .then((data) => {
          if (requestId !== this.keyRequestId) return

          const labels = this.normalizeLabelListResponse(data).slice(0, LABEL_LIMIT)
          this.labelOptions = this.buildLabelOptions(labels)
          const nextActiveKey = this.labelOptions.some((item) => item.value === this.activeKey)
            ? this.activeKey
            : this.labelOptions[0]?.value || ''

          if (!nextActiveKey || nextActiveKey !== this.activeKey) {
            this.cancelLabelValueSearch()
            this.activeKey = nextActiveKey
            this.valueQuery = ''
          }
        })
        .finally(() => {
          if (requestId === this.keyRequestId) {
            this.keyLoading = false
          }
        })
    },
    async getValueOptions(key, query = '') {
      const requestId = ++this.valueRequestId
      if (!key || !query.trim()) {
        this.remoteValueOptions = []
        this.valueLoading = false
        return
      }

      this.valueLoading = true
      return this.$axios
        .get(LABEL_API, {
          params: {
            limit: LABEL_LIMIT,
            name: key,
            value__icontains: query.trim()
          }
        })
        .then((data) => {
          if (requestId !== this.valueRequestId) return

          const labels = this.normalizeLabelListResponse(data).slice(0, LABEL_LIMIT)
          this.remoteValueOptions = _.uniqBy(
            _.sortBy(
              labels.map((label) => ({
                value: label.value,
                label: label.value,
                labelData: label
              })),
              'label'
            ),
            'value'
          )
        })
        .finally(() => {
          if (requestId === this.valueRequestId) {
            this.valueLoading = false
          }
        })
    },
    selectKey(key) {
      this.cancelLabelValueSearch()
      this.activeKey = key
      this.valueQuery = ''
    }
  }
}
