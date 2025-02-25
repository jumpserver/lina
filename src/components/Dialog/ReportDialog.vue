<template>
  <div>
    <Dialog
      v-if="iVisible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('Report')"
      :visible.sync="iVisible"
      top="35vh"
      width="80%"
      @close="loading=true"
    >
      <span v-if="loading" v-loading="loading" class="loading" />
      <iframe title="dialog" :src="url" style="border: none;" @load="onIframeLoad" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'ReportDialog',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true
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
  mounted() {
  },
  beforeMount() {
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
