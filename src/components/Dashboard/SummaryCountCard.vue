<template>
  <div class="box">
    <div class="head">
      <Title :config="config" />
    </div>
    <div class="content">
      <SummaryCard
        v-for="item of items"
        :key="item.title"
        v-bind="item.body"
        :title="item.title"
        class="summary-card"
      />
    </div>
  </div>
</template>

<script>
import Title from './Title.vue'
import SummaryCard from '@/components/Cards/SummaryCard'

export default {
  components: { Title, SummaryCard },
  props: {
    config: {
      type: Object,
      default: () => {
        return {
          title: '',
          tip: ''
        }
      }
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: var(--space-4, 16px);
  background: var(--surface-panel, #fff);
  border: 1px solid var(--color-border, var(--N200));
  border-radius: var(--radius-card, 8px);

  .head {
    margin-bottom: var(--space-3, 12px);
  }

  .content {
    display: flex;
    justify-content: space-between;
    padding: 0;

    .summary-card {
      padding-left: var(--space-4, 16px);
      border-left: 1px solid var(--N200);

      &:first-child {
        padding-left: 0;
        border-left: none;
      }
    }
  }
}
</style>
