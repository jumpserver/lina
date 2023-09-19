<template>
  <DetailFormatter :col="col" :row="row">
    <template>
      <el-popover
        :disabled="!showItems"
        :title="title"
        placement="top-start"
        trigger="hover"
        width="400"
      >
        <div class="detail-content">
          <div v-for="item of items" :key="getKey(item)" class="detail-item">
            <span class="detail-item-name">{{ item }}</span>
          </div>
        </div>
        <span slot="reference">{{ items && items.length }}</span>
      </el-popover>
    </template>
  </DetailFormatter>
</template>

<script>
import DetailFormatter from './DetailFormatter.vue'
import BaseFormatter from './base.vue'

export default {
  name: 'AmountFormatter',
  components: {
    DetailFormatter
  },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          showItems: true,
          getItem(item) {
            return item.name
          }
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {})
    }
  },
  computed: {
    title() {
      return this.formatterArgs.title || ''
    },
    items() {
      const getItem = this.formatterArgs.getItem || (item => item.name)
      let data = this.cellValue?.map(item => getItem(item)) || []
      data = data.filter(Boolean)
      return data
    },
    showItems() {
      return this.formatterArgs.showItems !== false && this.cellValue?.length > 0
    }
  },
  methods: {
    getKey(item) {
      const id = Math.random().toString(36).substring(2)
      return id + item
    }
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
}

</style>
