<template>
  <div v-show="isExpand">
    <div
      v-if="(filters && filters.length > 0) || (summary && summary.length > 0)"
      :class="isExpand ? 'expand': 'shrink' "
      class="quick-filter"
    >
      <div v-show="isExpand" class="quick-filter-wrap">
        <div v-if="filters" class="quick-filter-zone">
          <div v-for="category in iFilters" :key="category.label" class="item-zone">
            <div>
              <h5>{{ category.label }}</h5>
              <div class="filter-options">
                <span
                  v-for="option in category.options"
                  :key="option.label"
                  :class="option.active ? 'active' : ''"
                  class="item"
                  @click="handleFilterClick(option)"
                >
                  {{ option.label }}
                  <span v-if="option.hasCount">
                    <span>({{ option.count }})</span>
                  </span>
                  <!--                  <i class="el-icon-circle-check" />-->
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="summary" class="summary-zone">
          <span v-for="item of iSummary" :key="item.title" class="summary-block">
            <SummaryCard
              :class="item.active ? 'active' : ''"
              :count="item.count"
              :title="item.title"
              @click="handleFilterClick(item)"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SummaryCard from '@/components/Cards/SummaryCard/index.vue'
import { setUrlParam } from '@/utils/common'

export default {
  name: 'QuickFilter',
  components: { SummaryCard },
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    summary: {
      type: Array,
      default: null
    },
    expand: {
      type: Boolean,
      default: true
    },
    tableUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      iFilters: [],
      iSummary: [],
      filtered: {},
      activeFilters: [],
      reCount: false
    }
  },
  computed: {
    isExpand: {
      set(val) {
        this.$emit('update:expand', val)
      },
      get() {
        return this.expand
      }
    }
  },
  watch: {
    tableUrl() {
      this.generateCount()
    }
  },
  mounted() {
    this.iFilters = this.cleanFilters()
    this.iSummary = this.cleanSummary()
    this.generateCount()
  },
  methods: {
    async generateCount() {
      this.iFilters.forEach(category => {
        category.options.forEach(option => {
          if (option.hasCount) {
            option.count = null
            this.getCount(option)
          }
        })
      })

      this.iSummary.forEach(item => {
        item.count = null
        this.getCount(item)
      })
    },
    async getCount(item) {
      if (item.count || item.count === 0) {
        return item.count
      }
      if (!item.filter) {
        return '-'
      }
      let url = this.tableUrl
      for (const [k, v] of Object.entries({ ...item.filter, limit: 1 })) {
        url = setUrlParam(url, k, v)
      }
      const res = await this.$axios.get(url, { raw: 1 })
      item.count = res.data.count
      return item.count
    },
    cleanSummary() {
      if (!this.summary) {
        return []
      }
      return this.summary.map(item => {
        return {
          category: 'summary',
          label: item.title,
          ...item,
          count: null,
          filter: item.filter || {},
          active: false
        }
      })
    },
    cleanFilters() {
      if (!this.filters) {
        return []
      }
      return this.filters.map(category => {
        return {
          ...category,
          options: category.options.map(option => {
            return {
              category: category.label,
              ...option,
              active: false,
              filter: option.filter || {}
            }
          })
        }
      })
    },
    toggle() {
      this.isExpand = !this.isExpand
    },
    handleFilterClick(option) {
      if (!option.active) {
        this.activeFilters = this.activeFilters.filter(item => {
          const conflict = Object.keys(item.filter).some(key => {
            return Object.keys(option.filter).includes(key)
          })
          if (conflict) {
            item.active = false
          }
          return !conflict
        })
        this.activeFilters.push(option)
      } else {
        this.activeFilters = this.activeFilters.filter(item => {
          return item.label !== option.label && item.category !== option.category
        })
      }
      option.active = !option.active
      this.filtered = this.activeFilters.reduce((acc, item) => {
        return { ...acc, ...item.filter }
      }, {})
      this.$emit('filter', this.filtered)
    }
  }
}
</script>
<style lang='scss' scoped>
.quick-filter {
  background: white;
  padding: 10px 10px 10px 20px;
  margin-bottom: 10px;
  display: flex;
  place-content: stretch flex-end;
  justify-content: center;
  align-content: stretch;
  box-shadow: 0 1px 1px 0 rgba(54, 58, 80, .32);

  &.shrink {
    background: inherit;
    padding: 0;
    margin-bottom: 0;
    box-shadow: none;
  }

  .quick-filter-wrap {
    display: inline-block;
    width: calc(100% - 70px);

    .summary-zone {
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
    }

    .summary-block {
      .active {
        ::v-deep .no-margins .num {
          color: var(--color-primary);

          &::after {
            content: "\e720";
            font-family: element-icons !important;
            font-size: 13px;
            line-height: 1;
          }
        }
      }
    }

    .quick-filter-zone {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap; /* 允许 item-zone 换行 */
      gap: 10px;

      h5 {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 12px;
        margin-bottom: .5rem;
        line-height: 1.2;
        display: inline-block;
      }

      .item-zone {
        margin-right: 30px;
        margin-bottom: 5px;
      }

      .item {
        display: inline-block;
        margin-right: 8px;
        color: #303133;
        font-size: 12px;
        cursor: pointer;

        &::after {
          content: "";
          margin-left: 4px;
          margin-bottom: 2px;
          vertical-align: middle;
          width: 1px; /* 分割线宽度 */
          height: 8px; /* 分割线高度 */
          background-color: var(--color-icon-primary); /* 分割线颜色 */
          display: inline-block;
        }

        &:last-child::after {
          display: none;
        }

        i {
          visibility: hidden;
          margin-left: -3px;
        }

        &.active {
          color: var(--color-primary);

          i {
            visibility: visible;
          }
        }

        &:hover {
          color: var(--color-primary);
        }
      }

      ul {
        list-style: none outside none;
        margin-block-start: 0;
        padding-left: 0;
      }
    }
  }
}

.filter-options {
  display: block;
}

.expand-bar-wrap {
  margin: auto 0;
  min-width: 60px;

  .expand-bar {
    float: right;
    display: block;
    cursor: pointer;

    i {
      padding: 5px;

      &.shrink {
        transform: rotate(180deg);
      }
    }
  }
}

</style>
