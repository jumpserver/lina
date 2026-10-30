<template>
  <MCPUserClients v-if="object.id" :key="object.id" :user-id="object.id" />
</template>

<script>
import MCPUserClients from '@/components/Apps/MCPUserClients'

export default {
  components: { MCPUserClients },
  props: {
    object: { type: Object, required: true }
  }
}
</script>
