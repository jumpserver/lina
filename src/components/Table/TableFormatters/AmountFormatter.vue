<template>
  <DetailFormatter :col="col" :row="row">
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
          <div v-for="item of items" :key="getKey(item)" class="detail-item">
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
          title: ''
        }
      }
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {})
    return {
      formatterArgs: formatterArgs,
      data: formatterArgs.async ? [] : (this.cellValue || []),
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
        return [this.$t('common.tree.Loading') + '...']
      }
      const getItem = this.formatterArgs.getItem || (item => item.name)
      let data = []
      if (Array.isArray(this.data)) {
        data = this.data.map(item => getItem(item)) || []
      } else {
        // object {key: [value]}
        data = Object.entries(this.data).map(([key, value]) => {
          const item = { key: key, value: value }
          return getItem(item)
        }) || []
      }
      data = data.filter(Boolean)
      return data
    },
    showItems() {
      return this.amount !== 0 && this.amount !== ''
    }
  },
  async mounted() {
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
  methods: {
    getKey(item) {
      const id = Math.random().toString(36).substring(16)
      return id + item
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
      this.data = transform(response)
      this.asyncGetDone = true
    }
  }
}
</script>
<style lang="scss" scoped>
.detail-content {
  padding: 5px 10px;
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

.detail-item:first-child {
  //border-top: 1px solid #EBEEF5;
}
</style>
