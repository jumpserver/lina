export default {
  data: () => ({
    resourceAvailability: null,
    availabilityLoading: false,
    availabilityFailed: false,
    availabilityRequest: 0,
    availabilityParams: {}
  }),
  beforeUnmount() {
    ++this.availabilityRequest
  },
  methods: {
    async loadResourceAvailability(type, orgId, selection = {}) {
      const request = ++this.availabilityRequest
      this.resourceAvailability = null
      this.availabilityFailed = false
      this.availabilityLoading = true
      this.availabilityParams = { type, orgId, selection }
      try {
        if (!orgId) return
        const result = await this.$axios.get(`/api/v1/tickets/ticket-types/${type}/options/`, {
          params: { field: 'availability', org_id: orgId, ...selection }
        })
        if (request === this.availabilityRequest) this.resourceAvailability = result
      } catch {
        if (request === this.availabilityRequest) this.availabilityFailed = true
      } finally {
        if (request === this.availabilityRequest) this.availabilityLoading = false
      }
    },
    retryResourceAvailability() {
      const { type, orgId, selection } = this.availabilityParams
      return this.loadResourceAvailability(type, orgId, selection)
    },
    validateAvailability() {
      if (this.availabilityLoading || this.availabilityFailed) {
        throw new Error(this.$t('TicketResourceLoadFailed'))
      }
    }
  }
}
