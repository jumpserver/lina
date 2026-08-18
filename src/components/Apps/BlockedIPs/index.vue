<template>
  <div>
    <div>
      <el-button size="small" type="primary" @click="onOpenDialog">
        {{ $tc('View') }}
        <span>({{ $t('LockedIP', { count: ipCounts }) }})</span>
      </el-button>
    </div>
    <Dialog
      v-bind="$attrs"
      v-model:visible="visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :show-confirm="false"
      :title="dialogTitle"
      width="40%"
      @update:visible="$emit('update:visible', $event)"
    >
      <BlockedIPList />
    </Dialog>
  </div>
</template>

<script>
import { Dialog } from '@/components'
import BlockedIPList from '@/components/Apps/BlockedIPs/BlockedIPList'

export default {
  componentName: 'BlockedIPs',
  components: {
    BlockedIPList,
    Dialog
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: function () {
        return ''
      }
    },
    url: {
      type: String,
      default: `/api/v1/assets/platform-automation-methods/`
    }
  },
  data() {
    return {
      remoteMeta: {},
      visible: false,
      form: this.value,
      ipCounts: 0,
      config: {
        url: this.url,
        hasSaveContinue: false,
        hasButtons: true,
        fields: [],
        fieldsMeta: {}
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.title || this.$t('BlockedIPS')
    }
  },
  created() {
    this.getLockedIp()
  },
  methods: {
    getLockedIp() {
      this.$axios.get('/api/v1/settings/security/block-ip/').then((res) => {
        this.ipCounts = res.count
      })
    },
    onOpenDialog() {
      this.visible = true
    }
  }
}
</script>

<style scoped></style>
