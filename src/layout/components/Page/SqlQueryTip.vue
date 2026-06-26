<template>
  <!--
    调试用 SQL 计数条。不用 el-alert（其内部布局会撑出一块多余高度、且不易左对齐），
    改为一个紧凑的、左对齐的纯 div 单行条，右侧自带关闭按钮。
  -->
  <div v-if="showSqlQueryCounter && !noContent" class="sql-query-tip">
    <div class="sql-query-tip__tags">
      <el-tag
        v-for="item in sqlQueryCounter || []"
        :key="item.url"
        :type="getType(item)"
        size="small"
        class="sql-query-tip__tag"
      >
        {{ item.url }}: <b>{{ item.count }}</b>
      </el-tag>
    </div>
    <el-icon class="sql-query-tip__close" :title="$t('Close')" @click="handleClose">
      <Close />
    </el-icon>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SqlQueryTip',
  data() {
    return {
      loading: true,
      licenseData: {}
    }
  },
  computed: {
    ...mapGetters(['sqlQueryCounter', 'showSqlQueryCounter']),
    noContent() {
      return this.sqlQueryCounter.length === 0
    }
  },
  methods: {
    getType(item) {
      if (item.count > 10) {
        return 'danger'
      } else if (item.count > 5) {
        return 'warning'
      } else {
        return 'success'
      }
    },
    handleClose() {
      this.$store.dispatch('common/showSqlQueryCounter', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.sql-query-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 28px;
  padding: 4px 12px;
  box-sizing: border-box;
  background-color: #f3f3f4;
}

.sql-query-tip__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  flex: 1 1 auto;
  min-width: 0;
}

.sql-query-tip__close {
  flex: 0 0 auto;
  font-size: 14px;
  color: #909399;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
}
</style>
