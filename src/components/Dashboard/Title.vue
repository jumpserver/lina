<template>
  <div class="content">
    <span class="title">{{ config.title }}</span>
    <el-tooltip
      v-if="hasTip"
      :content="config.tip"
      :open-delay="500"
      effect="dark"
      placement="top"
    >
      <i class="fa fa-exclamation-circle icon" />
    </el-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    hasTip: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);

  .title {
    color: var(--N900);
    font-size: var(--font-size-lg, 16px);
    font-weight: var(--font-weight-semibold, 600);
    line-height: var(--line-height-lg, 24px);
  }

  .icon {
    color: var(--N400);
    font-size: var(--icon-size-base, 16px);
    cursor: pointer;
  }

  .time {
    font-style: normal;
    font-weight: 400;
    font-size: var(--font-size-xs, 12px);
    margin-left: var(--space-2, 8px);
    color: var(--N500);
  }
}

</style>
