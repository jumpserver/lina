<template>
  <DetailFormatter :col="col" :row="row" :prevant-click="formatterArgs.preventClick">
    <template>
      <el-popover
        :disabled="!showItems"
        :open-delay="500"
        :title="title"
        placement="top-start"
        trigger="hover"
        width="400"
        @show="getAsyncItems"
      >
        <div class="detail-content">
          <div v-for="[index, item] of Object.entries(items)" :key="getKey(item, index)" class="detail-item">
            <span class="detail-item-name">{{ item }}</span>
          </div>
        </div>
        <span slot="reference">{{ amount }}</span>
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
          },
          async: false,
          ajax: {},
          title: '',
          preventClick: false,
          onClick: null
        }
      }
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {})
    return {
      formatterArgs: formatterArgs,
      listData: formatterArgs.async ? [] : (this.cellValue || []),
      onClick: formatterArgs.onClick,
      amount: '',
      asyncGetDone: false
    }
  },
  computed: {
    title() {
      return this.formatterArgs.title || this.col.label.replace('amount', '').replace('数量', '')
    },
    cellValueToRemove() {
      return this.formatterArgs.cellValueToRemove || []
    },
    items() {
      if (this.formatterArgs.async && !this.asyncGetDone) {
        return [this.$t('Loading') + '...']
      }
      const getItem = this.formatterArgs.getItem || (item => item.name)

      let data = []

      if (Array.isArray(this.listData)) {
        data = this.listData.map(item => getItem(item)).filter(Boolean)
      } else if (this.listData && typeof this.listData === 'object') {
        data = Object.entries(this.listData).map(([key, value]) => {
          const item = { key: key, value: value }
          return getItem(item)
        }).filter(Boolean)
      }

      return data
    },
    showItems() {
      return this.amount !== 0 && this.amount !== ''
    }
  },
  watch: {
    cellValue: {
      handler(newValue) {
        // listData 需要重新赋值一遍 items 重新计算
        this.listData = newValue
        this.computeAmount()
      }
    }
  },
  async mounted() {
    this.computeAmount()
  },
  methods: {
    computeAmount() {
      if (this.formatterArgs.async) {
        this.amount = this.cellValue
      } else {
        let cellValue = []
        if (Array.isArray(this.cellValue)) {
          cellValue = this.cellValue
        } else {
          // object {key: [value]}
          cellValue = Object.keys(this.cellValue)
        }

        this.amount = (cellValue?.filter(value => !this.cellValueToRemove.includes(value)) || []).length
      }
    },
    getKey(item, index) {
      return index + item
    },
    getDefaultUrl() {
      const url = new URL(this.url, location.origin)
      url.pathname += this.row.id + '/'
      return url.pathname
    },
    async getAsyncItems() {
      if (!this.formatterArgs.async) {
        return
      }
      if (this.asyncGetDone) {
        return
      }
      const url = this.formatterArgs.ajax.url || this.getDefaultUrl()
      const params = this.formatterArgs.ajax.params || {}
      const transform = this.formatterArgs.ajax.transform || (resp => resp[this.col.prop.replace('_amount', '')])
      const response = await this.$axios.get(url, { params: params })
      this.listData = transform(response)
      this.asyncGetDone = true
    }
  }
}
</script>
<style lang="scss" scoped>
.detail-content {
  padding: 5px 10px;
  max-height: 60vh;
  min-height: 200px;
  overflow-y: auto;
}

.detail-item {
  border-bottom: 1px solid var(--color-border);
  padding: 5px 0;
  margin-bottom: 0;

  &:hover {
    background-color: #F5F7FA;
  }
}

::v-deep .detail {
  padding: 0 5px;
}

.detail-item:first-child {
  //border-top: 1px solid #EBEEF5;
}
</style>
