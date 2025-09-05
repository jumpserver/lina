<template>
  <span ref="root" class="global-search">
    <!-- 原始搜索框触发器 -->
    <div class="search-trigger" @click="openPanel">
      <el-input
        ref="searchInput"
        v-model="search"
        :placeholder="$t('Search')"
        class="search-input"
        prefix-icon="el-icon-search"
        readonly
        @focus="openPanel"
        @keydown.esc.prevent="closePanel"
        @clear="clearSearch"
      />
    </div>

    <!-- 浮动搜索面板 - 使用 Vue 2 原生方式渲染到 #app 下 -->
    <div v-if="isOpen" ref="floatingPanel" class="floating-panel" @mousedown.stop>
      <!-- 面板内的搜索框 -->
      <div class="panel-search-input">
        <input
          ref="panelSearchInput"
          v-model="search"
          :placeholder="$t('Search')"
          class="panel-search-input-field"
          @input="onInput"
          @keydown.esc.prevent="closePanel"
          @keydown.enter.prevent="onEnter"
        >
      </div>

      <!-- 搜索结果内容 -->
      <div class="panel-content">
        <div v-if="loading" class="section loading">{{ $t('Loading') }}...</div>

        <template v-if="showHistory">
          <div class="section-title">{{ $t('History') }}</div>
          <ul class="list">
            <li
              v-for="(item, index) in filteredHistory"
              :key="'h-' + index"
              class="item"
              @click="applyHistory(item)"
            >
              <i class="el-icon-time icon" />
              <span class="label">{{ item.query }}</span>
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
                <i :class="iconMap[item.model] || 'el-icon-document'" class="icon" />
                <span class="label">{{ item.label }}</span>
                <span class="sub">{{ item.content }}</span>
              </li>
            </ul>
          </div>
        </template>

        <div v-if="!loading && isEmpty" class="section empty">
          {{ $t('NoData') }}
        </div>
      </div>
    </div>
  </span>
</template>

<script>
import { toTitleCase, ObjectLocalStorage } from '@/utils/common'
// import Icon from '@/components/Widgets/Icon'
import { mapGetters } from 'vuex'

export default {
  name: 'Search',
  components: {
    // Icon
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
      historyStore: new ObjectLocalStorage('global-search-history')
    }
  },
  computed: {
    ...mapGetters([
      'viewRoutes'
    ]),
    isEmpty() {
      return !this.search && !this.history.length && !this.routeSuggestions.length
    },
    showHistory() {
      return this.history.length > 0 && (!this.search || this.filteredHistory.length > 0)
    },
    filteredHistory() {
      if (!this.search) return this.history
      return this.history.filter(h => h.query.toLowerCase().includes(this.search.toLowerCase()))
    }
  },
  watch: {
    isOpen(val) {
      this.$emit('search-open', val)
      if (val) {
        this.$nextTick(() => {
          this.movePanelToApp()
        })
      }
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.onClickOutside)
    this.loadHistory()
    this.buildRouteSuggestions()
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.onClickOutside)
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
    onClickOutside(e) {
      const root = this.$refs.root
      const panel = this.$refs.floatingPanel
      if (root && !root.contains(e.target) && panel && !panel.contains(e.target)) {
        this.closePanel()
      }
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
    async searchQuery(query) {
      if (query.length < 2) {
        this.options = []
        return
      }
      this.loading = true
      const url = '/api/v1/search/?q=' + query
      let options = []
      let res = []

      try {
        res = await this.$axios.get(url)
      } catch (error) {
        console.error(error)
        return
      } finally {
        this.loading = false
      }

      options = _.groupBy(res, 'model_label')
      options = Object.entries(options).map(([key, value]) => ({
        label: key,
        options: value.map(item => ({
          value: item.id,
          label: item.name,
          content: item.content?.replaceAll(';', ' '),
          ...item
        }))
      }))
      this.options = options
    },
    debouncedQuery: _.debounce(function() {
      const q = this.search?.trim()
      if (!q) {
        this.options = []
        return
      }
      this.searchQuery(q)
      this.filterRouteSuggestions(q)
    }, 250),
    onEnter() {
      // 优先进入第一条远程结果，其次路由建议，其次历史
      const firstRemote = this.options?.[0]?.options?.[0]
      if (firstRemote) return this.handleSearch(firstRemote)
      const firstRoute = this.routeSuggestions?.[0]
      if (firstRoute) return this.navigateRoute(firstRoute)
      const firstHistory = this.filteredHistory?.[0]
      if (firstHistory) return this.applyHistory(firstHistory)
      this.closePanel()
    },
    handleSearch(item) {
      const route = {}
      route['name'] = toTitleCase(item.model) + 'Detail'
      route['params'] = { id: item.id }
      this.$router.push(route)
      this.saveHistory({ type: 'remote', query: this.search })
      this.closePanel()
    },
    buildRouteSuggestions() {
      console.log('Build route suggestions')
      if (this.routes.length > 0) {
        return
      }
      const allRoutes = this.viewRoutes
      const flat = []
      const walk = (rs, parentPath = '') => {
        for (const r of rs) {
          const path = r.path?.startsWith('/') ? r.path : `${parentPath}/${r.path || ''}`

          console.log('Path: ', path, r)
          if (r.meta?.showInSearch) {
            flat.push({
              name: r.name,
              path,
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
    filterRouteSuggestions(q) {
      this.routeSuggestions = this.routes.filter(r => {
        const title = r.title ? r.title.toLowerCase() : ''
        return title.includes(q)
      })
    },
    navigateRoute(r) {
      if (r.name) this.$router.push({ name: r.name })
      else this.$router.push({ path: r.path })
      this.saveHistory({ type: 'route', query: r.title || r.name || r.path })
      this.closePanel()
    },
    loadHistory() {
      const list = this.historyStore.get('list', []) || []
      this.history = Array.isArray(list) ? list : []
    },
    saveHistory(entry) {
      const list = this.historyStore.get('list', []) || []
      const next = [
        {
          query: String(entry.query || '').slice(0, 200),
          type: entry.type,
          ts: Date.now()
        },
        ...list.filter(i => i.query !== entry.query)
      ].slice(0, 10)
      this.historyStore.set('list', next)
      this.history = next
    },
    applyHistory(h) {
      this.search = h.query
      this.onInput()
    },
    movePanelToApp() {
      const panel = this.$refs.floatingPanel
      if (!panel) return

      const app = document.getElementById('app')
      if (!app) return

      // 将面板移动到 #app 下
      app.appendChild(panel)

      // 设置面板样式
      panel.style.position = 'fixed'
      panel.style.top = '8px'
      panel.style.left = '50%'
      panel.style.transform = 'translateX(-50%)'
      panel.style.zIndex = '9999'
      panel.style.width = '600px'
      panel.style.maxWidth = '90vw'
    }
  }
}
</script>

<style lang="scss">
.global-search {
  position: relative;
  width: 200px;
  height: 40px;
  padding: 5px 0;
  min-width: 200px;

  .search-trigger {
    .search-input {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      cursor: pointer;

      ::v-deep .el-input__inner {
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
      }

      ::v-deep .el-input__inner::placeholder {
        color: #fff;
        opacity: 0.7;
      }
    }
  }

  .floating-panel {
    position: fixed !important;
    z-index: 99999 !important;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border: 1px solid #e0e0e0;
    width: 70%;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;

    .panel-search-input {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;

      .search-input {
        background-color: #f8f9fa;

        ::v-deep .el-input__inner {
          background: transparent;
          border: none;
          color: #333;
        }

        ::v-deep .el-input__inner::placeholder {
          color: #999;
        }
      }
    }

    .panel-content {
      max-height: 60vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  .section-title {
    padding: 3px 16px;
    font-size: 12px;
    line-height: 30px;
    color: #999;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;

    .item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;

      .label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sub {
        color: #999;
        font-size: 12px;
        margin-left: auto;
      }
    }
  }

  .loading,
  .empty {
    padding: 16px;
    color: #999;
    text-align: center;
  }

  .search-panel-enter-active,
  .search-panel-leave-active {
    transition: opacity 0.2s;
  }

  .search-panel-enter,
  .search-panel-leave-to {
    opacity: 0;
  }
}

/* 浮动搜索面板样式 */
.floating-panel {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  width: 70%;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  max-height: 80vh;
  overflow: hidden;

  .panel-search-input {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;

    .panel-search-input-field {
      width: 100%;
      height: 40px;
      border: none;
      outline: none;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 0 16px;
      font-size: 16px;
      font-weight: 400;
      color: #333;
      transition: all 0.2s ease;

      &:focus {
        background: #fff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
      }

      &::placeholder {
        color: #999;
        opacity: 0.8;
      }
    }
  }

  .panel-content {
    max-height: 60vh;
    overflow-y: auto;

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

  .section-title {
    padding: 12px 24px 8px;
    font-size: 12px;
    line-height: 1.5;
    color: #909399;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #fafbfc;
    border-bottom: 1px solid #f0f0f0;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;

    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f8f9fa;

      .icon {
        height: 20px;
        line-height: 20px;
        flex-shrink: 0;
        color: #666;
        font-size: 16px;
        font-weight: 400;
      }

      &:hover {
        background: #f8f9fa;
      }

      &:last-child {
        border-bottom: none;
      }

      .icon {
        color: var(--color-primary, #409eff);
      }

      .label {
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        color: #303133;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sub {
        font-size: 12px;
        line-height: 20px;
        color: #909399;
        max-width: 200px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        flex-shrink: 0;
      }

      .go {
        color: #c0c4cc;
        font-size: 12px;
        flex-shrink: 0;
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
}
</style>
