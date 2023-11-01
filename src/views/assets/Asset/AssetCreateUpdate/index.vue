<template>
  <div>
    <component
      :is="component"
      v-if="component"
      :action="action"
      :platform-id="platform.id"
      :row="row"
      @close="onClose"
    />
  </div>
</template>

<script>
import HostCreateUpdate from './HostCreateUpdate.vue'
import DatabaseCreateUpdate from './DatabaseCreateUpdate.vue'
import CloudCreateUpdate from './CloudCreateUpdate.vue'
import WebCreateUpdate from './WebCreateUpdate.vue'
import DeviceCreateUpdate from './DeviceCreateUpdate.vue'
import CustomCreateUpdate from './CustomCreateUpdate.vue'

export default {
  name: 'WebCreateUpdate',
  components: {
    HostCreateUpdate,
    DatabaseCreateUpdate,
    CloudCreateUpdate,
    WebCreateUpdate,
    DeviceCreateUpdate,
    CustomCreateUpdate
  },
  props: {
  },
  data() {
    return {
      category: '',
      component: '',
      platform: { id: 0 },
      row: {},
      action: '',
      components: {
        host: HostCreateUpdate,
        database: DatabaseCreateUpdate,
        cloud: CloudCreateUpdate,
        web: WebCreateUpdate,
        device: DeviceCreateUpdate,
        custom: CustomCreateUpdate
      }
    }
  },
  mounted() {
    this.$eventBus.$on('assetCreateUpdate', (platform, action, { url, row }) => {
      this.platform = platform
      this.category = platform.category.value
      this.component = this.components[this.category]
      this.row = row
      this.action = action
      setTimeout(() => this.$eventBus.$emit('showCreateUpdateDrawer', action, { url, row }), 100)
    })
  },
  beforeDestroy() {
    this.$eventBus.$off('assetCreateUpdate')
  },
  methods: {
    onClose() {
      console.log('On closed draw')
      this.row = {}
      this.component = ''
    }
  }
}
</script>
