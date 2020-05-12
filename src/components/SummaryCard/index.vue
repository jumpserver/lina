<template>
  <el-col :span="6">
    <IBox v-bind="$attrs" :title="card.title" :label="card.label">
      <div class="ibox-content">
        <h1 class="no-margins">
          <el-link class="total-count" type="success" :href="card.totalCount.url">{{ card.totalCount.count }}</el-link>
        </h1>
        <small>{{ card.totalCount.describe }}</small>
      </div>
    </IBox>
  </el-col>
</template>

<script>
import { IBox } from '@/components'

export default {
  name: 'SummaryCard',
  components: {
    IBox
  },
  props: {
    card: {
      type: Object,
      default() {
        return {
          title: '',
          label: {
            type: '',
            title: ''
          },
          totalCount: {
            count: '',
            url: '',
            describe: ''
          }
        }
      }
    }
  }
}
</script>

<style scoped>
 .total-count {
    color: #428bca;
    text-decoration: none;
    font-weight: 100;
    font-size: 30px;
  }
  .no-margins {
    margin: 0 !important;
  }
</style>
