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
import { setUrlParam } from '@/utils/common/index'

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
  display: flex;
  width: 100%;
  margin-bottom: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--N200);
  border-radius: var(--radius-card);
  background: var(--surface-panel);
  box-shadow: none;

  &.shrink {
    padding: 0;
    margin-bottom: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .quick-filter-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
    min-width: 0;

    .summary-zone {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      padding-top: 0;
    }

    .summary-block {
      .active {
        :deep(.no-margins .num) {
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
      flex-wrap: wrap;
      gap: var(--space-3) var(--space-6);

      h5 {
        flex: 0 0 auto;
        position: relative;
        min-width: 56px;
        margin: 0;
        padding-right: var(--space-2);
        color: var(--N500);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        line-height: 28px;
        display: inline-block;
        cursor: default;
        user-select: none;
        white-space: nowrap;
      }

      h5::after {
        content: "";
        position: absolute;
        top: 7px;
        right: 0;
        width: 1px;
        height: 14px;
        background: var(--N200);
      }

      .item-zone {
        min-width: 0;
        margin: 0;

        > div {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          min-width: 0;
        }
      }

      .item {
        display: inline-flex;
        align-items: center;
        height: 28px;
        margin-right: 0;
        padding: 0 var(--space-2);
        border: 1px solid transparent;
        border-radius: var(--radius-control);
        color: var(--N700);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-regular);
        line-height: 26px;
        cursor: pointer;
        transition: color var(--duration-fast) var(--ease-standard),
          background-color var(--duration-fast) var(--ease-standard),
          border-color var(--duration-fast) var(--ease-standard);

        i {
          visibility: hidden;
          margin-left: var(--space-1);
        }

        &.active {
          border-color: rgba(26, 179, 148, 0.22);
          background: rgba(26, 179, 148, 0.08);
          color: var(--color-primary);

          i {
            visibility: visible;
          }
        }

        &:hover {
          border-color: var(--N200);
          background: var(--N50);
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  min-width: 0;
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
