<template>
  <el-col :span="6">
    <IBox v-bind="$attrs" :title="card.title" :label="card.label">
      <div class="ibox-content">
        <h1 class="no-margins">
          <a href="card.totalCountUrl"><span>{{ card.totalCount }}</span></a>
        </h1>
        <small>{{ card.totalCountDescribe }}</small>
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
          totalCount: '',
          totalCountUrl: '',
          totalCountDescribe: ''
        }
      }
    }
  }
}
</script>

<style scoped>
  a {
    color: #428bca;
    text-decoration: none;
    font-weight: 100;
    font-size: 30px;
  }
  .no-margins {
    margin: 0 !important;
  }
</style>
