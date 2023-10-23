<template>
  <div>
    <component :is="component" v-if="component" :platform-id="platform.id" @close="component = ''" />
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
  data() {
    return {
      category: '',
      component: '',
      platform: { id: 0 },
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
    this.$eventBus.$on('assetCreateUpdate', (platform, action, args) => {
      this.platform = platform
      this.category = platform.category.value
      this.component = this.components[this.category]
      setTimeout(() => {
        this.$eventBus.$emit('showCreateUpdateDrawer', action, args)
      }, 200)
    })
  }
}
</script>
