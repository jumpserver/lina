<template>
  <div>
    <div>
      <el-button
        size="mini"
        type="primary"
        @click="onOpenDialog"
      >
        {{ $tc('common.View') }}
        <span>({{ $tc('setting.LockedIP', ipCounts ) }})</span>
      </el-button>
    </div>
    <Dialog
      :visible.sync="visible"
      :title="title"
      width="40%"
      :show-cancel="false"
      :show-confirm="false"
      :destroy-on-close="true"
      v-bind="$attrs"
      v-on="$listeners"
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
      default: function() {
        return this.$t('setting.BlockedIPS')
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
  created() {
    this.getLockedIp()
  },
  methods: {
    getLockedIp() {
      this.$axios.get('/api/v1/settings/security/block-ip/').then(res => {
        this.ipCounts = res.count
      })
    },
    onOpenDialog() {
      this.visible = true
    }
  }
}
</script>

<style scoped>
</style>
