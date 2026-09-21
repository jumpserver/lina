<template>
  <div class="task-log-window">
    <el-tabs
      v-if="tabs.length"
      v-model="activeTab"
      class="task-log-tabs"
      closable
      @tab-remove="closeTab"
    >
      <el-tab-pane v-for="tab in tabs" :key="tab.url" :name="tab.url">
        <template #label>
          <span class="task-log-label" :title="tab.taskId || tab.url">
            <el-icon class="task-log-icon" aria-hidden="true"><Document /></el-icon>
            <span class="task-log-title">{{ tab.label }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <div v-if="tabs.length" class="task-log-content">
      <!-- Keep each page mounted so switching tabs preserves its log stream and scroll position. -->
      <iframe
        v-for="tab in tabs"
        v-show="activeTab === tab.url"
        :key="tab.url"
        :src="tab.url"
        :title="tab.label"
      />
    </div>
    <el-empty v-else :description="$t('NoData')" />
  </div>
</template>

<script>
export default {
  name: 'TaskLogWindow',
  data() {
    return {
      tabs: [],
      activeTab: ''
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        this.openTab(query.url)
      }
    }
  },
  methods: {
    openTab(rawUrl) {
      if (typeof rawUrl !== 'string' || !rawUrl) return
      let url
      try {
        url = new URL(rawUrl, window.location.origin)
      } catch {
        return
      }
      // Log pages are served by this JumpServer instance, including custom activity URLs.
      if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) {
        return
      }
      const task = url.pathname.match(/\/ops\/([^/]+)\/task\/([^/]+)\/log\/?$/)
      const taskId = task?.[2] || ''
      const type = url.searchParams.get('type') || task?.[1] || ''
      if (task && !url.searchParams.has('type')) url.searchParams.set('type', type)
      url.searchParams.sort()
      const href = url.href
      if (!this.tabs.some((tab) => tab.url === href)) {
        this.tabs.push({
          url: href,
          taskId,
          label: taskId ? `${type} · ${taskId.slice(0, 8)}` : this.$t('CeleryTaskLog')
        })
      }
      this.activeTab = href
    },
    closeTab(name) {
      const index = this.tabs.findIndex((tab) => tab.url === name)
      if (index === -1) return
      this.tabs.splice(index, 1)
      if (this.activeTab === name) {
        this.activeTab = this.tabs[index]?.url || this.tabs[index - 1]?.url || ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.task-log-window {
  --task-log-background: var(--el-bg-color, #fff);
  --task-log-accent: var(--el-color-primary, #1ab394);

  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--task-log-background);

  :deep(.el-empty) {
    flex: 1;
  }
}

.task-log-tabs {
  --el-tabs-header-height: 38px;

  flex: none;
  min-width: 0;
  padding: 8px 8px 0;
  background: var(--el-fill-color-light, #f5f7fa);
  box-shadow: inset 0 -1px var(--el-border-color-light, #e4e7ed);

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap) {
    margin-bottom: 0;

    &::after {
      display: none;
    }
  }

  :deep(.el-tabs__nav) {
    gap: 4px;
    border: 0;
  }

  :deep(.el-tabs__nav .el-tabs__item) {
    width: clamp(174px, 24vw, 220px);
    justify-content: flex-start;
    gap: 10px;
    margin: 0;
    padding: 0 10px 0 12px;
    border: 1px solid transparent;
    border-bottom: 0;
    border-radius: 6px 6px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 400;
    transition:
      background-color 0.15s,
      color 0.15s;

    &:hover {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color, #f0f2f5);
    }

    &.is-active {
      color: var(--task-log-accent);
      background: var(--task-log-background);
      border-color: var(--el-border-color-light, #e4e7ed);
      box-shadow: inset 0 2px var(--task-log-accent);

      .task-log-icon {
        color: var(--task-log-accent);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--task-log-accent);
      outline-offset: -4px;
    }

    .is-icon-close {
      flex: 0 0 20px;
      width: 20px;
      height: 20px;
      margin: 0;
      padding: 0;
      border-radius: 4px;
      color: var(--el-text-color-placeholder);
      font-size: 12px;
      transition:
        background-color 0.15s,
        color 0.15s;

      &:hover {
        color: var(--el-text-color-primary);
        background: var(--el-fill-color-dark, #ebedf0);
      }
    }
  }

  :deep(.el-tabs__nav-prev),
  :deep(.el-tabs__nav-next) {
    height: var(--el-tabs-header-height);
    line-height: var(--el-tabs-header-height);
    border-radius: 4px;
    color: var(--el-text-color-secondary);

    &:not(.is-disabled):hover {
      color: var(--task-log-accent);
      background: var(--el-fill-color, #f0f2f5);
    }

    &.is-disabled {
      color: var(--el-text-color-disabled);
    }
  }

  :deep(.el-tabs__active-bar),
  :deep(.el-tabs__content) {
    display: none;
  }
}

.task-log-label {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0;
}

.task-log-icon {
  flex: none;
  font-size: 15px;
}

.task-log-title {
  overflow: hidden;
  font-family: Monaco, Consolas, 'Lucida Console', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-log-content {
  flex: 1;
  min-height: 0;
  background: var(--task-log-background);

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: var(--task-log-background);
  }
}
</style>
