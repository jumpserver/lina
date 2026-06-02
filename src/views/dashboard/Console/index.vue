<template>
  <Page>
    <div v-if="$hasPerm('rbac.view_console')" class="dashboard-home">
      <Announcement class="dashboard-announcement" />
      <ConsoleReport :nav="false" :only-charts="true" />
    </div>
    <Page403 v-else />
  </Page>
</template>

<script>
import { Announcement } from '@/components'
import { Page } from '@/layout/components'
import Page403 from '@/views/403'
import ConsoleReport from '@/views/reports/console/index.vue'

export default {
  name: 'Dashboard',
  components: {
    Page,
    Announcement,
    Page403,
    ConsoleReport
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
}

.dashboard-announcement {
  :deep(.announcement) {
    margin-bottom: 0;
    border: 1px solid rgba(64, 158, 255, 0.22);
    border-radius: var(--radius-card, 8px);
    background: rgba(64, 158, 255, 0.08);
    color: var(--color-info);

    .el-alert__title,
    .el-alert__description,
    .el-alert__close-btn {
      color: var(--color-info);
    }
  }
}
</style>
