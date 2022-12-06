<template>
  <div class="content">
    <span class="title">{{ config.title }}</span>
    <el-tooltip
      v-if="config.tip"
      effect="dark"
      :content="config.tip"
      placement="top"
    >
      <i class="fa fa-exclamation-circle icon" />
    </el-tooltip>
    <i v-else class="fa fa-exclamation-circle icon" />
    <span v-if="config.time" class="time">更新时间：{{ config.time }}</span>
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default: () => ({})
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
  display: inline-block;
  .title {
    font-weight: 500;
    font-size: 16px;
    color: #1F2329;
  }
  .icon {
    color: #BBBFC4;
    font-size: 16px;
    cursor: pointer;
  }
  .time {
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    margin-left: 8px;
    color: #8F959E;
  }
}

</style>
