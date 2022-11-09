<template>
  <DetailFormatter :row="row" :col="col">
    <template>
      <el-popover
        placement="top-start"
        :title="title"
        width="400"
        trigger="hover"
        :disabled="!showItems"
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
import BaseFormatter from './base'
export default {
  name: 'AmountFormatter',
  components: {
    DetailFormatter
  },
  extends: BaseFormatter,
  data() {
    return {
      formatterArgsNew: {
        showItems: true,
        getItem(item) {
          return item.name
        }
      }
    }
  },
  computed: {
    title() {
      return this.formatterArgs.title || ''
    },
    items() {
      const getItem = this.formatterArgs.getItem || function(item) { return item.name }
      return this.cellValue.map(item => getItem(item))
    },
    showItems() {
      return this.formatterArgs.showItems !== false && this.cellValue.length > 0
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
