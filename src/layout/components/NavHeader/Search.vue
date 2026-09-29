<template>
  <span ref="root" class="global-search">
    <!-- 搜索触发按钮 -->
    <div class="search-trigger" @click="openPanel">
      <el-input
        v-model="search"
        :placeholder="$t('Search')"
        :prefix-icon="searchIcon"
        class="search-input jms-input-spacing"
        readonly
        @keydown.esc.prevent="closePanel"
        @clear="clearSearch"
      >
        <template #suffix>
          <span class="search-shortcut">{{ shortcutText }}</span>
        </template>
      </el-input>
    </div>

    <!-- 搜索模态框 -->
    <el-dialog
      v-model="isOpen"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :append-to-body="true"
      :show-close="false"
      :aria-label="$t('Search')"
      class="search-modal"
      header-class="search-modal-header"
      modal-class="search-modal-overlay"
      body-class="search-modal-body"
      width="640px"
      @close="closePanel"
    >
      <div class="search-modal-content">
        <!-- 搜索框 -->
        <div class="search-input-wrapper">
          <el-input
            ref="panelSearchInput"
            v-model="search"
            :placeholder="$t('Search')"
            :clearable="true"
            :prefix-icon="searchIcon"
            class="search-panel-input jms-input-spacing"
            @input="onInput"
            @keydown.enter.prevent="onEnter"
          />
          <button
            class="search-dismiss"
            type="button"
            :aria-label="$t('Close')"
            @click="closePanel"
          >
            Esc
          </button>
        </div>

        <!-- 搜索结果内容 -->
        <div class="search-results">
          <div v-if="loading" class="section loading">{{ $t('Loading') }}...</div>

          <template v-if="showHistory">
            <div class="section-title">
              <span>{{ $t('History') }}</span>
              <el-link class="clear-history-btn" @click="clearHistory">
                {{ $t('Clear') }}
              </el-link>
            </div>
            <ul class="list">
              <li
                v-for="(item, index) in history"
                :key="'h-' + index"
                class="item"
                @click="applyHistory(item)"
              >
                <el-icon class="icon"><Timer /></el-icon>
                <span class="label">{{ item.q }}</span>
                <el-icon class="go"><ArrowRight /></el-icon>
              </li>
            </ul>
          </template>

          <template v-if="routeSuggestions.length">
            <div class="section-title">{{ $t('Routes') }}</div>
            <ul class="list">
              <li
                v-for="route in routeSuggestions"
                :key="'r-' + route.name + route.path"
                class="item"
                @click="navigateRoute(route)"
              >
                <el-icon class="icon"><LocationInformation /></el-icon>
                <span class="label">{{ route.title || route.name || route.path }}</span>
                <span class="sub">{{ route.path }}</span>
              </li>
            </ul>
          </template>

          <template v-if="options.length">
            <div v-for="group in options" :key="'g-' + group.label" class="section">
              <div class="section-title">{{ group.label }}</div>
              <ul class="list">
                <li
                  v-for="item in group.options"
                  :key="item.value"
                  class="item"
                  @click="handleSearch(item)"
                >
                  <Icon :icon="iconMap[item.model] || 'el-icon-document'" class="icon" />
                  <span class="label">{{ item.name }}</span>
                  <span class="sub">{{ item.content }}</span>
                </li>
              </ul>
            </div>
          </template>

          <div v-if="search && !loading && isEmpty" class="section empty">
            {{ $t('NoData') }}
          </div>

          <div v-if="!search && history.length === 0" class="section placeholder">
            <div class="placeholder-content">
              <div class="supported-types">
                <div class="types-title">{{ $t('SupportedTypes') }}:</div>
                <div class="types-list">
                  <span v-for="(icon, type) in iconMap" :key="type" class="type-item">
                    <Icon :icon="icon" class="type-icon" />
                    {{ $t(type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </span>
</template>

<script>
import Icon from '@/components/Widgets/Icon/index.vue'
import { ObjectLocalStorage } from '@/utils/common/objectLocalStorage'
import { Search as SearchIcon } from '@element-plus/icons-vue'
import _ from 'lodash'
import { markRaw } from 'vue'
import { mapGetters } from 'vuex'

export default {
  name: 'Search',
  components: {
    Icon
  },
  data() {
    return {
      search: '',
      loading: false,
      options: [],
      isOpen: false,
      history: [],
      routeSuggestions: [],
      routes: [],
      iconMap: {
        Account: 'accounts',
        Asset: 'assets',
        User: 'user-o',
        UserGroup: 'user-group',
        AssetPermission: 'permission'
      },
      searchIcon: markRaw(SearchIcon),
      historyStore: new ObjectLocalStorage('globalSearchHistory')
    }
  },
  computed: {
    ...mapGetters(['viewRoutes']),
    isEmpty() {
      return !this.routeSuggestions.length && this.options.length === 0
    },
    showHistory() {
      return this.history.length > 0 && !this.search
    },
    shortcutText() {
      return this.isMac ? '⌘K' : 'Ctrl+K'
    },
    isMac() {
      return navigator.platform.toUpperCase().indexOf('MAC') >= 0
    }
  },
  mounted() {
    this.loadHistory()
    this.buildRouteSuggestions()
    this.bindKeyboardShortcut()
  },
  beforeUnmount() {
    this.unbindKeyboardShortcut()
  },
  methods: {
    openPanel() {
      this.isOpen = true
      this.buildRouteSuggestions()
      this.$nextTick(() => {
        this.$refs.panelSearchInput?.focus()
      })
    },
    closePanel() {
      this.isOpen = false
    },
    onInput() {
      this.openPanel()
      this.debouncedQuery()
    },
    clearSearch() {
      this.search = ''
      this.options = []
      this.buildRouteSuggestions()
    },
    onEnter() {
      if (this.options.length > 0) {
        this.handleSearch(this.options[0].options[0])
      }
    },
    debouncedQuery: _.debounce(function () {
      this.searchQuery(this.search)
    }, 300),
    async searchQuery(q) {
      if (!q) {
        this.options = []
        return
      }
      this.loading = true
      const url = '/api/v1/search/?q=' + q
      try {
        const res = await this.$axios.get(url)
        let options = res || []
        options = _.groupBy(res, 'model_label')
        this.options = Object.keys(options).map((key) => ({
          label: key,
          options: options[key]
        }))
      } catch (error) {
        console.error('Search error:', error)
        this.options = []
      } finally {
        this.loading = false
      }
    },
    handleSearch(item) {
      const route = {
        name: item.model + 'Detail',
        params: { id: item.id }
      }
      this.addToHistory(this.search)
      this.$router.push(route)
      this.closePanel()
    },
    navigateRoute(route) {
      this.$router.push(route.path)
      this.closePanel()
    },
    filterRouteSuggestions(q) {
      if (!q) {
        this.routeSuggestions = []
        return
      }
      this.routeSuggestions = this.routes
        .filter((r) => {
          const title = r.title || r.name || r.path
          return (
            title.toLowerCase().includes(q.toLowerCase()) ||
            r.path.toLowerCase().includes(q.toLowerCase())
          )
        })
        .slice(0, 5)
    },
    buildRouteSuggestions() {
      if (this.routes.length > 0) {
        return
      }
      const allRoutes = this.viewRoutes
      const flat = []
      const walk = (routes, parentPath = '') => {
        for (const r of routes) {
          const path = parentPath + r.path
          if (r.path && r.path !== '/' && !r.hidden) {
            flat.push({
              name: r.name,
              path: path,
              title: r.meta?.title
            })
          }

          if (r.children && r.children.length) {
            walk(r.children, path)
          }
        }
      }
      walk(allRoutes)
      this.routes = flat
    },
    loadHistory() {
      this.history = (this.historyStore.get('list') || []).filter((i) => i.q)
    },
    addToHistory(q) {
      const entry = { q: q }
      const list = this.historyStore.get('list') || []
      const next = [entry, ...list.filter((i) => i.q !== entry.q)].slice(0, 10)
      this.historyStore.set('list', next)
      this.history = next
    },
    applyHistory(h) {
      this.search = h.q
      this.onInput()
    },
    clearHistory() {
      this.historyStore.set('list', [])
      this.history = []
    },
    bindKeyboardShortcut() {
      document.addEventListener('keydown', this.handleKeyboardShortcut)
    },
    unbindKeyboardShortcut() {
      document.removeEventListener('keydown', this.handleKeyboardShortcut)
    },
    handleKeyboardShortcut(event) {
      // 检查是否按下了正确的快捷键
      const isCorrectKey = event.key === 'k' || event.key === 'K'
      const isCorrectModifier = this.isMac ? event.metaKey : event.ctrlKey

      if (isCorrectKey && isCorrectModifier) {
        // 阻止默认行为
        event.preventDefault()

        // 如果当前有输入框聚焦，不触发搜索
        const activeElement = document.activeElement
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true')

        if (!isInputFocused) {
          this.openPanel()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.global-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 220px;
  height: 40px;
  padding: 5px 0;
  min-width: 220px;
  margin-right: 5px;

  .search-trigger {
    display: flex;
    align-items: center;
    width: 100%;
    height: 28px;
    line-height: 1;
    cursor: pointer;

    .search-input {
      --jms-input-padding-block: 0;
      --jms-input-padding-inline: 12px;

      width: 100%;
      height: 28px;
      pointer-events: none;

      :deep(.el-input__wrapper) {
        min-height: 28px;
        height: 28px;
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        border: none;
        box-shadow: inset 0 0 0 1px transparent;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      :deep(.el-input__inner) {
        height: 100%;
        line-height: 1;
        background: transparent;
        border: unset;
        cursor: pointer;

        &::placeholder {
          color: #fff;
          opacity: 0.7;
        }
      }

      :deep(.el-input__prefix),
      :deep(.el-input__suffix),
      :deep(.el-input__suffix-inner) {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      :deep(.el-input__prefix-inner) {
        display: flex;
        align-items: center;
      }

      :deep(.el-input__prefix-inner > :last-child) {
        margin-right: 8px;
      }

      :deep(.el-input__icon),
      :deep(.el-icon) {
        color: #fff;
        font-size: 15px;
        line-height: 1;
      }
    }

    &:hover {
      .search-input :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.14);
      }
    }

    .search-shortcut {
      color: rgba(255, 255, 255, 0.6);
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      user-select: none;
      pointer-events: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 18px;
      line-height: 1;
    }
  }
}

@media screen and (max-width: 992px) {
  .global-search {
    width: 36px;
    min-width: 36px;
    margin-right: 0;

    .search-trigger .search-input {
      --jms-input-padding-inline: 10px;

      :deep(.el-input__inner),
      :deep(.el-input__suffix) {
        display: none;
      }

      :deep(.el-input__prefix) {
        position: static;
        width: 100%;
      }

      :deep(.el-input__prefix-inner > :last-child) {
        margin-right: 0;
      }
    }
  }
}
</style>

<style lang="scss">
.el-overlay-dialog .search-modal.el-dialog {
  --el-dialog-padding-primary: 0;

  max-width: 100%;
  margin: 0 auto;
  border: 1px solid var(--panel-border-color, var(--el-border-color));
  border-radius: 8px;
  box-shadow:
    0 18px 48px rgba(31, 41, 51, 0.18),
    0 4px 12px rgba(31, 41, 51, 0.08);
  overflow: hidden;
  background: var(--el-bg-color, #fff);
}

.search-modal-overlay {
  background: rgba(31, 41, 51, 0.32);
  overflow-y: auto;

  .el-overlay-dialog {
    display: flex;
    align-items: flex-start;
    padding: clamp(24px, 12vh, 96px) 16px 24px;
    box-sizing: border-box;
    overflow-y: auto;
  }
}

.search-modal-header {
  display: none;
}

.search-modal {
  .search-modal-content {
    display: flex;
    flex-direction: column;
    max-height: min(560px, calc(100dvh - 160px));
    background: var(--el-bg-color, #fff);
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;
    min-height: 56px;
    padding: 0 18px;
    border-bottom: 1px solid var(--panel-border-color, var(--el-border-color));
  }

  .search-panel-input {
    --jms-input-padding-block: 0;
    --jms-input-padding-inline: 0;

    flex: 1;
    min-width: 0;

    .el-input__wrapper {
      min-height: 54px;
      padding: 0;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
    }

    .el-input__inner {
      height: 54px;
      font-size: 15px;
      color: var(--color-text-primary);
      border: 0;
      box-shadow: none;

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }
    }

    .el-input__prefix-inner > :last-child {
      margin-right: 10px;
    }

    .el-input__icon {
      font-size: 17px;
      color: var(--color-primary);
    }
  }

  .search-dismiss {
    flex: 0 0 auto;
    padding: 3px 6px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font: inherit;
    font-size: 11px;
    line-height: 1.2;
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }

  .search-results {
    min-height: 0;
    overflow-y: auto;
    padding: 8px 0 12px;
    scrollbar-color: var(--el-border-color-darker) transparent;
    scrollbar-width: thin;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 30px;
    padding: 6px 20px 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 600;

    .clear-history-btn {
      padding: 2px 0;
      color: var(--el-text-color-secondary);
      font-size: 12px;

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  .list {
    margin: 0;
    padding: 0 0 4px;
    list-style: none;

    .item {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 42px;
      margin: 2px 10px;
      padding: 6px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background: var(--el-color-primary-light-9);
      }

      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 26px;
        width: 26px;
        height: 26px;
        border-radius: 4px;
        background: var(--el-fill-color-light);
        color: var(--color-primary);
        font-size: 14px;
      }

      .label {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        color: var(--color-text-primary);
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sub {
        flex: 0 1 38%;
        min-width: 0;
        overflow: hidden;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .go {
        flex: 0 0 auto;
        color: var(--el-text-color-placeholder);
        font-size: 13px;
      }
    }
  }

  .loading,
  .empty {
    padding: 28px 20px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    text-align: center;
  }

  .section.placeholder {
    padding: 18px 20px 20px;

    .supported-types {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .types-title {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-weight: 600;
    }

    .types-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .type-item {
      display: inline-flex;
      align-items: center;
      padding: 6px 9px;
      border: 1px solid var(--panel-border-color, var(--el-border-color));
      border-radius: 4px;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-regular);
      font-size: 12px;

      .type-icon {
        margin-right: 6px;
        color: var(--color-primary);
        font-size: 14px;
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .search-modal-overlay .el-overlay-dialog {
    padding: 16px 12px;
  }

  .search-modal .search-modal-content {
    max-height: calc(100dvh - 32px);
  }

  .search-modal .list .item .sub {
    display: none;
  }
}
</style>
