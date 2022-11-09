<template>
  <DetailFormatter>
    <template>
      <el-popover
        placement="top-start"
        :title="title"
        width="400"
        trigger="hover"
        :disabled="cellValue.length === 0"
      >
        <div class="detail-content">
          <div v-for="item of items" :key="item" class="detail-item">
            <span class="detail-item-name">{{ item }}</span>
          </div>
        </div>
        <span slot="reference">{{ cellValue.length }}</span>
      </el-popover>
    </template>
  </DetailFormatter>
</template>

<script>
import DetailFormatter from './DetailFormatter'
export default {
  name: 'AmountFormatter',
  components: {
    DetailFormatter
  },
  extends: DetailFormatter,
  data() {
    return {
    }
  },
  computed: {
    title() {
      return this.formatterArgs.title || ''
    },
    items() {
      const getItem = this.formatterArgs.getItem || function(item) { return item.name }
      return this.cellValue.map(item => getItem(item))
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.detail-content {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;
}
.detail-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 5px 0;
  margin-bottom: 0;

  &:hover {
     background-color: #F5F7FA;
  }

  .detail-item-name {
  }
}

</style>
