<template>
  <span ref="root" class="search" :class="{ 'is-open': isOpen }">
    <div class="search-input">
      <el-input
        ref="searchInput"
        v-model="search"
        :placeholder="$t('Search')"
        class="search-input"
        prefix-icon="el-icon-search"
        clearable
        @focus="openPanel"
        @input="onInput"
        @keydown.esc.prevent="closePanel"
        @keydown.enter.prevent="onEnter"
        @clear="clearSearch"
      />
    </div>

    <transition name="el-zoom-in-top">
      <div v-show="isOpen" class="panel" :style="panelStyle" @mousedown.stop>
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
                <Icon class="icon" :icon="iconMap[item.model]" />
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
    </transition>
  </span>
</template>

<script>
import { toTitleCase, ObjectLocalStorage } from '@/utils/common'
import Icon from '@/components/Widgets/Icon'
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
      historyStore: new ObjectLocalStorage('global-search-history'),
      history: [],
      routeSuggestions: [],
      panelStyle: {},
      routes: [],
      iconMap: {
        'Account': 'accounts',
        'Asset': 'assets',
        'User': 'user-o',
        'UserGroup': 'user-group',
        'AssetPermission': 'permission'
      }
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
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.onClickOutside)
    this.loadHistory()
    window.addEventListener('resize', this.repositionPanel)
    window.addEventListener('scroll', this.repositionPanel, true)
    this.buildRouteSuggestions()
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.onClickOutside)
    window.removeEventListener('resize', this.repositionPanel)
    window.removeEventListener('scroll', this.repositionPanel, true)
  },
  methods: {
    openPanel() {
      this.isOpen = true
      this.buildRouteSuggestions()
      this.$nextTick(this.repositionPanel)
    },
    closePanel() {
      this.isOpen = false
    },
    onClickOutside(e) {
      const root = this.$refs.root
      if (root && !root.contains(e.target)) this.closePanel()
    },
    onInput() {
      this.openPanel()
      this.debouncedQuery()
    },
    repositionPanel() {
      if (!this.isOpen) return
      const el = this.$refs.searchInput
      if (!el) return

      // 直接使用 el-input 组件的根元素
      const rect = el.$el.getBoundingClientRect()
      const minWidth = 360
      const maxWidth = Math.min(window.innerWidth - 20, 720)
      const width = Math.max(minWidth, Math.min(maxWidth, rect.width))
      // 右对齐：从 input 的右边缘向左展开
      let left = rect.right - width
      // 确保不会超出屏幕左边界
      if (left < 10) {
        left = 10
      }
      this.panelStyle = {
        position: 'fixed',
        top: rect.bottom + 9 + 'px',
        left: left + 'px',
        width: width + 'px'
      }
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
      console.log('All routes: ', allRoutes)
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
    }
  }
}
</script>

<style scoped lang="scss">
.search {
  position: relative;
  width: 200px; /* 固定宽度，与 input 保持一致 */
  height: 40px;
  padding: 5px 0;
  min-width: 200px;

  &.is-open {
    width: calc(100vw - 850px);
  }

  .search-input {
    height: 30px;
    line-height: 30px;
    // width: 200px; /* 固定宽度，避免布局变化 */
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 1px;

    ::v-deep .el-input__inner {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 14px;
      height: 30px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    ::v-deep .el-input__inner::placeholder {
      color: #fff;
      opacity: 0.7;
    }

    ::v-deep .el-input__prefix {
      color: #fff;
      font-size: 16px;
    }

    ::v-deep .el-input__suffix {
      color: #fff;
    }
  }

  .panel {
    position: fixed; /* 确保使用 fixed 定位 */
    z-index: 9999; /* 提高 z-index 值 */
    background: #fff;
    color: var(--text-primary);
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    max-height: 80vh;
    min-height: 200px;
    overflow: auto;
    width: 600px;
    padding: 8px 0;

    .section-title {
      padding: 6px 12px 2px 15px;
      font-size: 13px;
      line-height: 2;
      color: #909399;
      font-weight: 500;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;

      .item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 16px;
        cursor: pointer;

        .icon {
          height: 30px;
          line-height: 30px;
        }

        ::v-deep {
          .icon, .svg-icon {
            color: #000;
            font-size: 13px;
            font-weight: 300;
          }
        }

        &:hover {
          background: #f5f7fa;
        }

        .icon {
          color: var(--color-primary);
        }

        .label {
          font-size: 14px;
          font-weight: 400;
          line-height: 30px;
          color: #303133;
          max-width: 55%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sub {
          margin-left: auto;
          font-size: 12px;
          line-height: 30px;
          color: #909399;
          max-width: 50%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 40%;
          float: right;
        }

        .go {
          margin-left: auto;
          color: #c0c4cc;
        }
      }
    }

    .loading,
    .empty {
      padding: 12px;
      color: #909399;
    }
  }
}
</style>
