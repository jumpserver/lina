<template>
  <div>
    <Dialog
      :visible="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('AccountDiscover')"
      top="35vh"
      width="960px"
      @close="loading = true"
      @update:visible="$emit('update:visible', $event)"
    >
      <div v-loading="loading">
        <iframe :src="url" style="border: none" title="dialog" @load="onIframeLoad" />
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'AccountDiscoverDialog',
  components: {
    Dialog
  },
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
  emits: ['update:visible'],
  data() {
    return {
      loading: true,
      showLoading: true
    }
  },
  computed: {
    url: {
      get() {
        return `/api/v1/accounts/gather-account-executions/adhoc/?asset_id=${this.asset}`
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

.loading {
  margin-top: 20px;
  display: block;
}
</style>
