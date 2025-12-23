<template>
  <div>
    <Dialog
      v-if="visible"
      v-model:visible="iVisible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="$tc('Report')"
      top="35vh"
      width="80%"
      @close="loading = true"
    >
      <span v-if="loading" v-loading="loading" class="loading" />
      <iframe title="dialog" :src="url" style="border: none" @load="onIframeLoad" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import vModelMixin from '@/utils/vue/vModelMixin'
export default {
  mixins: [vModelMixin('visible')],
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
  emits: ['update:visible'],
  data() {
    return {
      loading: true
    }
  },
  mounted() {},
  beforeMount() {},
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
