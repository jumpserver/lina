<template>
  <span ref="root" class="global-search">
    <!-- 搜索触发按钮 -->
    <div class="search-trigger" @click="openPanel">
      <el-input
        v-model="search"
        :placeholder="$t('Search')"
        :prefix-icon="searchIcon"
        class="search-input"
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
      class="search-modal"
      header-class="search-modal-header"
      modal-class="search-modal-overlay"
      body-class="search-modal-body"
      width="70%"
      top="5px"
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
            class="search-panel-input"
            @input="onInput"
            @keydown.enter.prevent="onEnter"
          />
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

          <div v-if="search && isEmpty" class="section empty">
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
import { ObjectLocalStorage } from '@/utils/common'
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
    height: 30px;
    line-height: 1;
    cursor: pointer;

    .search-input {
      width: 100%;
      height: 30px;
      pointer-events: none;

      :deep(.el-input__wrapper) {
        height: 30px;
        padding: 0 12px;
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        border: none !important;
        box-shadow: inset 0 0 0 1px transparent !important;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      :deep(.el-input__inner) {
        height: 100%;
        line-height: 1;
        background: transparent;
        border: unset !important;
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

      :deep(.el-input__prefix-inner > :last-child) {
        margin-right: 0;
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

</style>

<style lang="scss">
body .v-modal {
  opacity: 0.3;
}

.search-modal.el-dialog {
  --el-dialog-padding-primary: 0;
  padding: 0 !important;
  margin: 5px auto 0 !important;
  width: 70% !important;
  max-width: min(1280px, calc(100vw - 48px));
  max-height: calc(100vh - 40px);
  border-radius: 6px;
  box-shadow: 0 0 8px 4px #00000014;
  overflow: hidden;
  background: #fff;
}

.search-modal-overlay {
  overflow-y: auto;

  .el-overlay-dialog {
    display: block;
    overflow-y: auto;
  }
}

.search-modal-header {
  display: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.search-modal-body {
  padding: 0 !important;
}

.search-modal-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #fff;
  height: 70vh;
}

.search-input-wrapper {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;

  .search-panel-input {
    width: 100% !important;

    &.el-input {
      width: 100% !important;
    }

    .el-input__wrapper {
      width: 100%;
      min-height: 32px;
      height: 32px;
      padding: 0 12px;
      border-radius: 0;
      border: 1px solid var(--el-border-color) !important;
      box-shadow: none !important;
      box-sizing: border-box;

      &.is-focus {
        border-color: var(--el-color-primary) !important;
        box-shadow: none !important;
      }
    }

    .el-input__inner {
      min-height: 30px;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      background: transparent;
    }

    .el-input__prefix,
    .el-input__suffix,
    .el-input__prefix-inner,
    .el-input__suffix-inner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 30px;
      height: 30px;
      border: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    .el-input__suffix {
      padding-left: 0;
    }

    .el-input__clear,
    .el-input__icon {
      border: 0 !important;
      box-shadow: none !important;
    }
  }
}

.search-results {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 140px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 6px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .clear-history-btn {
    padding: 4px;
    border: none;
    border-radius: 4px;
    background: none;
    color: red;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f5f5;
      color: #f56c6c;
    }
  }
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;

  .item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 24px;
    border-bottom: 1px solid #f8f9fa;
    cursor: pointer;
    transition: all 0.2s ease;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: transparent;
      transition: background 0.2s ease;
    }

    &:hover {
      background: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }

    .icon {
      margin-right: 12px;
      font-size: 14px;
      font-weight: 400;
    }

    .label {
      flex: 1;
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .sub {
      width: 40%;
      margin-left: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 0;
      text-align: right;
      color: #909399;
      font-size: 12px;
    }

    .go {
      flex-shrink: 0;
      color: #c0c4cc;
      font-size: 12px;
    }
  }
}

.loading,
.empty {
  padding: 32px 24px;
  color: #909399;
  text-align: center;
  font-size: 14px;
}

.section.placeholder {
  padding: 32px 24px;

  .placeholder-content {
    text-align: center;
  }

  .supported-types {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .types-title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .types-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .type-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 13px;
    color: #666;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      color: #333;
    }

    .type-icon {
      margin-right: 6px;
      font-size: 14px;
      color: #409eff;
    }
  }
}
</style>
