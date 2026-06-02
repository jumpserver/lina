<template>
  <div class="sql-debug-tip" :class="{ hidden: !showSqlQueryCounter || noContent }">
    <el-alert
      v-show="showSqlQueryCounter && !noContent"
      class="container sql"
      closable
      :show-icon="false"
      type="info"
      @close="handleClose"
    >
      <el-tag
        v-for="item in sqlQueryCounter || []"
        :key="item.url"
        :type="getType(item)"
        size="small"
        style="margin-right: 5px"
      >
        {{ item.url }}: <b>{{ item.count }}</b>
      </el-tag>
    </el-alert>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SqlQueryTip',
  computed: {
    ...mapGetters([
      'sqlQueryCounter',
      'showSqlQueryCounter'
    ]),
    noContent() {
      return this.sqlQueryCounter.length === 0
    }
  },
  methods: {
    getType(item) {
      if (item.count > 10) {
        return 'danger'
      }
      if (item.count > 5) {
        return 'warning'
      }
      return 'success'
    },
    handleClose() {
      this.$store.dispatch('common/showSqlQueryCounter', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.sql-debug-tip {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 28px;
  padding: 0 var(--space-4);

  &.hidden {
    visibility: hidden;
  }
}

.container {
  position: relative;
  min-height: 28px;
  padding: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none;

  :deep(.el-alert__content) {
    min-width: 0;
    overflow: hidden;
    padding-right: 24px;
    line-height: 1;
  }

  :deep(.el-alert__description) {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    margin: 0;
  }

  :deep(.el-alert__close-btn) {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--N500);
    cursor: pointer;
  }

  :deep(.el-tag) {
    flex: 0 0 auto;
    margin-right: 0 !important;
  }
}
</style>
