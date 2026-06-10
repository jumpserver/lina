<template>
  <div class="el-page">
    <el-pagination
      v-if="hasPagination"
      v-bind="{
        ...normalizedExtraPaginationAttrs,
        currentPage: paginationCurrentPage,
        pageSize: paginationPageSize,
        background: paginationBackground,
        layout: paginationLayout,
        pageSizes: paginationSizes,
        total: total || 0,
        'onUpdate:current-page': handleCurrentChange,
        'onUpdate:page-size': handleSizeChange,
        onCurrentChange: handleCurrentChange,
        onSizeChange: handleSizeChange
      }"
    />
  </div>
</template>

<script>
const defaultFirstPage = 1

export default {
  name: 'Pagination',
  components: {},
  props: {
    hasPagination: {
      type: Boolean,
      default: true
    },
    firstPage: {
      type: Number,
      default: defaultFirstPage
    },
    pageSizeKey: {
      type: String,
      default: 'limit'
    },
    pageKey: {
      type: String,
      default: 'offset'
    },
    page: {
      type: Number,
      default: 1
    },
    noPaginationSize: {
      type: Number,
      default: -1
    },
    paginationSize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    },
    paginationSizes: {
      type: Array,
      default: () => [10, 20, 30, 40, 50, 100]
    },
    paginationBackground: {
      type: Boolean,
      default: true
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    extraPaginationAttrs: {
      type: Object,
      default: () => {
      }
    },
    transformQuery: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      size: this.paginationSize || this.paginationSizes[0]
    }
  },
  computed: {
    paginationCurrentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.handleCurrentChange(val)
      }
    },
    paginationPageSize: {
      get() {
        return this.size
      },
      set(val) {
        this.handleSizeChange(val)
      }
    },
    normalizedExtraPaginationAttrs() {
      const attrs = { ...(this.extraPaginationAttrs || {}) }
      if ('small' in attrs) {
        if (attrs.small && !attrs.size) {
          attrs.size = 'small'
        }
        delete attrs.small
      }
      return attrs
    }
  },
  methods: {
    handleSizeChange(val) {
      if (this.size === val) return
      this.size = val
      this.$emit('update:page-size', val)
      this.$emit('sizeChange', val)
    },
    handleCurrentChange(val) {
      if (this.page === val) return
      this.$emit('update:current-page', val)
      this.$emit('currentSizeChange', val)
    },
    getPageQuery(currentPage, pageSize) {
      // 构造query对象
      let query = {}
      query[this.pageSizeKey] = this.hasPagination
        ? pageSize
        : this.noPaginationSize

      const offset = (currentPage - 1) * pageSize
      query[this.pageKey] = offset
      if (this.transformQuery) {
        query = this.transformQuery(query)
      }
      return query
    }
  }
}
</script>

<style scoped>
:deep(.el-pagination) {
  text-align: right;
}

:deep(.el-pagination__total) {
  float: left;
}
</style>
