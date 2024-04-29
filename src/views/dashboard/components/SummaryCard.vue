<template>
  <div>
    <div class="summary-header">
      <span class="title">{{ title }}</span>
    </div>
    <slot>
      <h1 class="no-margins">
        <span v-if="body.disabled" class="num">
          {{ body.count }}
        </span>
        <router-link v-else :to="body.route">
          <span class="num disabled-link">{{ body.count }}</span>
        </router-link>
      </h1>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'SummaryCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    rightSideLabel: {
      type: Object,
      default: () => ({})
    },
    body: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped>
.summary-header {
  color: var(--el-icon-color);

  .title {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
  }
}

.no-margins {
  margin: 0 !important;

  .num {
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 40px;
    color: var(--el-text-color);
  }

  .disabled-link {
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
