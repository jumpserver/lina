<template>
  <el-drawer
    class="ticket-type-drawer"
    :model-value="visible"
    :title="$t('TicketSelectType')"
    size="700px"
    body-class="ticket-type-drawer__body"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div v-loading="loading" class="ticket-type-content">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
      <el-row v-if="plugins.length" :gutter="20">
        <el-col v-for="(plugin, index) in plugins" :key="plugin.type" :xs="24" :sm="12" :md="8">
          <el-card
            class="ticket-type-item"
            :style="{ borderLeftColor: colors[index % colors.length] }"
            shadow="never"
            role="button"
            tabindex="0"
            @click="$emit('select-type', plugin)"
            @keydown.enter.prevent="$emit('select-type', plugin)"
            @keydown.space.prevent="$emit('select-type', plugin)"
          >
            <svg-icon :icon-class="iconFor(plugin.type)" class="ticket-type-icon" />
            <span class="ticket-type-name">{{ typeLabel(plugin) }}</span>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-else-if="!loading && !error" :description="$t('NoData')" />
    </div>
  </el-drawer>
</template>

<script>
import { getTicketTypeLabel } from '../const'

const icons = {
  apply_asset: 'assets',
  view_secret: 'password',
  file_transfer: 'file-transfer',
  download_replay: 'download',
  change_secret: 'change-password'
}

export default {
  name: 'TicketTypeDrawer',
  props: {
    visible: { type: Boolean, default: false }
  },
  emits: ['update:visible', 'select-type'],
  data() {
    return {
      loading: true,
      error: '',
      plugins: [],
      colors: ['#1c84c6', '#23c6c8', '#1ab394', '#f8ac59', '#783887', '#fc6554']
    }
  },
  async created() {
    try {
      const plugins = await this.$axios.get('/api/v1/tickets/ticket-types/')
      this.plugins = plugins.filter((plugin) => plugin.self_service)
    } catch (error) {
      this.error = error.response?.data?.detail || error.message
    } finally {
      this.loading = false
    }
  },
  methods: {
    typeLabel(plugin) {
      return getTicketTypeLabel({ value: plugin.type, label: plugin.label }, this.$t)
    },
    iconFor(type) {
      return icons[type] || 'ticket'
    }
  }
}
</script>

<style lang="scss">
.el-drawer.ticket-type-drawer .el-drawer__body.ticket-type-drawer__body {
  padding: 0;
  overflow-y: auto;
}
</style>

<style lang="scss" scoped>
.ticket-type-content {
  min-height: 140px;
  padding: 20px 30px;
}
.ticket-type-item {
  width: 100%;
  margin: 5px 0;
  border: 1px solid var(--color-border);
  border-left: 4px solid;
  cursor: pointer;
}
.ticket-type-item:hover,
.ticket-type-item:focus-visible {
  border-color: var(--el-color-primary);
  border-left-color: var(--el-color-primary) !important;
}
.ticket-type-item:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
.ticket-type-item :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px;
}
.ticket-type-icon {
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
}
.ticket-type-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
