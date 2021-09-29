<template>
  <el-card shadow="never">
    <div slot="header" class="summary-header">
      <span class="header-title">{{ title }}</span>
    </div>
    <slot>
      <h1 class="no-margins">
        <span v-if="body.disabled" class="disabled-link">{{ body.count }}</span>
        <router-link v-else :to="body.route">
          <span>{{ body.count }}</span>
        </router-link>
      </h1>
      <small>{{ body.comment }}</small>
    </slot>
  </el-card>
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
  .pull-right {
    float: right !important;
  }

  .header-title {
    font-size: 14px;
    margin: 0 0 7px;
    font-weight: 600;
  }

  .right-side >>> .el-tag {
    font-weight: 600;
    padding: 3px 8px;
    text-shadow: none;
    line-height: 1;
  }

  h1 {
    font-size: 30px;
    font-weight: 100;
  }

  .el-card__body {
    background-color: #ffffff;
    color: inherit;
    padding: 15px 20px 20px 20px !important;
    border-color: #e7eaec;
    border-image: none;
    border-style: solid solid none;
    border-width: 1px 0;
  }
  .no-margins {
    margin: 0 !important;
  }

  .disabled-link {
    color: #428bca;
  }
</style>
