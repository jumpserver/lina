<template>
  <div class="box">
    <div style="margin-bottom: 12px;">
      <Title :config="config" />
    </div>
    <div class="content">
      <el-row type="flex" justify="space-between">
        <el-col v-for="item of items" :key="item.title" :md="8" :sm="12" :xs="12">
          <SummaryCard :title="item.title" :body="item.body" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import SummaryCard from '../components/SummaryCard'

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
    return {
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: 20px;
  background: #FFFFFF;
  .content {
    .el-col {
      padding-left: 16px;
      border-left: 1px solid #EFF0F1;
      &:first-child {
        padding-left: 0;
        border-left: none;
      }
    }
    .sub {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: #646A73;
    }
    .num {
      font-style: normal;
      font-weight: 500;
      font-size: 24px;
      cursor: pointer;
    }
  }
}
</style>
