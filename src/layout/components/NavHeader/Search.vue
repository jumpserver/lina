<template>
  <span ref="root" class="global-search">
    <!-- 搜索触发按钮 -->
    <div class="search-trigger" @click="openPanel">
      <el-input
        v-model="search"
        :placeholder="$t('Search')"
        class="search-input"
        readonly
        prefix-icon="el-icon-search"
        @keydown.esc.prevent="closePanel"
        @clear="clearSearch"
      >
        <template slot="suffix">
          <span class="search-shortcut">{{ shortcutText }}</span>
        </template>
      </el-input>
    </div>

    <!-- 搜索模态框 -->
    <el-dialog
      :visible.sync="isOpen"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :append-to-body="true"
      custom-class="search-modal"
      width="70%"
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
            size="large"
            prefix-icon="el-icon-search"
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
                <i class="el-icon-time icon" />
                <span class="label">{{ item.q }}</span>
                <i class="el-icon-arrow-right go" />
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
                <i class="el-icon-location-outline icon" />
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

<script lang="jsx">
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { ObjectLocalStorage } from '@/utils/common'
import Icon from '@/components/Widgets/Icon/index.vue'

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
        'Account': 'accounts',
        'Asset': 'assets',
        'User': 'user-o',
        'UserGroup': 'user-group',
        'AssetPermission': 'permission'
      },
      historyStore: new ObjectLocalStorage('globalSearchHistory')
    }
  },
  computed: {
    ...mapGetters([
      'viewRoutes'
    ]),
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
  beforeDestroy() {
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
    debouncedQuery: _.debounce(function() {
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
        this.options = Object.keys(options).map(key => ({
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
      this.routeSuggestions = this.routes.filter(r => {
        const title = r.title || r.name || r.path
        return title.toLowerCase().includes(q.toLowerCase()) || r.path.toLowerCase().includes(q.toLowerCase())
      }).slice(0, 5)
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
      this.history = (this.historyStore.get('list') || []).filter(i => i.q)
    },
    addToHistory(q) {
      const entry = { q: q }
      const list = this.historyStore.get('list') || []
      const next = [
        entry,
        ...list.filter(i => i.q !== entry.q)
      ].slice(0, 10)
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
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.contentEditable === 'true'
        )

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
  width: 200px;
  height: 40px;
  padding: 5px 0;
  min-width: 200px;
  margin-right: 5px;

  .search-trigger {
    height: 30px;
    line-height: 1;

    .search-input {
      height: 30px;
      line-height: 1;
      background-color: rgba(5, 5, 5, 0.1);
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }

      ::v-deep {
        .el-input__inner {
          height: 30px;
          line-height: 1;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;

          &::placeholder {
            color: #fff;
            opacity: 0.7;
          }
        }

        .el-input__prefix .el-input__icon {
          font-size: 15px;
          line-height: 32px;
        }

        .el-input__suffix {
          display: flex;
          align-items: center;
          height: 100%;
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
}

/* 搜索模态框全局样式 */
::v-deep .search-modal {
  &.el-dialog {
    position: fixed;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    max-height: calc(100vh - 10px);
    max-width: calc(100vw - 10px);
    border-radius: 5px;
    box-shadow: 0 0 8px 4px #00000014;

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__header {
      display: none;
    }
  }
}

::v-deep body .v-modal {
  opacity: 0.3;
}

::v-deep .search-modal-content {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

::v-deep .search-input-wrapper {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  // background: #fff;

  .el-input {
    .el-input__inner {
      font-size: 14px;
      height: 34px;
      line-height: 34px;
    }
  }
}

::v-deep .search-results {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  /* 自定义滚动条 */
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

::v-deep .section-title {
  padding: 12px 24px 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .clear-history-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: red;

    &:hover {
      background: #f5f5f5;
      color: #f56c6c;
    }

    .clear-icon {
      font-size: 14px;
      color: red;
    }
  }
}

::v-deep .list {
  list-style: none;
  margin: 0;
  padding: 0;

  .item {
    display: flex;
    align-items: center;
    padding: 8px 24px;
    cursor: pointer;
    border-bottom: 1px solid #f8f9fa;
    transition: all 0.2s ease;
    position: relative;

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
      // color: var(--color-primary, #409eff);
      margin-right: 12px;
      font-size: 14px;
      font-weight: 400;
    }

    .label {
      flex: 1;
      font-size: 14px;
      color: #333;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 60%;
    }

    .sub {
      color: #909399;
      font-size: 12px;
      margin-left: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 0;
      width: 40%;
      text-align: right;
    }

    .go {
      color: #c0c4cc;
      font-size: 12px;
      flex-shrink: 0;
    }
  }
}

::v-deep .loading,
::v-deep .empty {
  padding: 32px 24px;
  color: #909399;
  text-align: center;
  font-size: 14px;
}

::v-deep .section.placeholder {
  padding: 32px 24px;

  .placeholder-content {
    text-align: center;

    .supported-types {
      margin-bottom: 24px;

      .types-title {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .types-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;

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
    }
  }
}
</style>
