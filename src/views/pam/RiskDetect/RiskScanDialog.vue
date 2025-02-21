<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('Detecting')"
    :visible.sync="iVisible"
    top="35vh"
    width="80%"
    @close="loading=true"
  >
    <span v-if="loading" v-loading="loading" class="loading" />
    <iframe :src="url" frameborder="0" @load="onIframeLoad" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
export default {
  name: 'RiskScanDialog',
  components: { Dialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    asset: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      url: `/api/v1/accounts/check-account-executions/adhoc/?asset_id=${this.asset}`
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    onIframeLoad() {
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
iframe {
  width: 100%;
  height: 500px;
}
</style>
