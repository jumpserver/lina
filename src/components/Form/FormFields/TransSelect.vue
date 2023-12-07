<template>
  <div>
    <Select2
      ref="select2"
      v-model="iValue"
      v-bind="select2"
      @initialized="handleSelectInitialed"
      @input="onInputChange"
      v-on="$listeners"
      @focus.stop.prevent="handleFocus"
    />
    <Dialog v-if="showTransfer" :title="title" :visible.sync="showTransfer" width="730px" @confirm="handleTransConfirm">
      <krryPaging v-if="selectInitialized" ref="pageTransfer" class="transfer" v-bind="pagingTransfer" />
    </Dialog>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'
import krryPaging from '@/components/Libs/Krry/paging/index.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'TransSelect',
  components: { krryPaging, Select2, Dialog },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      required: true
    },
    transformOption: {
      type: Function,
      default: null
    },
    ajax: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    const vm = this
    const transformOption = vm.transformOption || vm.ajax.transformOption || ((item) => {
      return { label: item.name, value: item.id }
    })
    const getPageData = async({ pageIndex, pageSize, keyword }) => {
      const limit = pageSize
      const offset = (pageIndex - 1) * pageSize
      const params = {
        'limit': limit,
        'offset': offset,
        'fields_size': 'mini'
      }
      if (keyword) {
        params['search'] = keyword
      }
      const url = vm.url
      const data = await this.$axios.get(url, { params })
      return data['results'].map(item => {
        const n = transformOption(item)
        return { id: n.value, label: n.label }
      })
    }
    return {
      showTransfer: false,
      title: 'Select',
      selectInitialized: false,
      select2: {
        options: [],
        multiple: true,
        ajax: {
          url: this.url || this.ajax.url,
          transformOption: transformOption
        }
      },
      transferLoading: false,
      pagingTransfer: {
        pageSize: 100,
        filterable: true,
        async: true,
        dataList: [],
        getPageData: function(pageIndex, pageSize) {
          return getPageData({ pageIndex, pageSize })
        },
        getSearchData: async function(keyword, pageIndex, pageSize) {
          return getPageData({ keyword, pageIndex, pageSize })
        },
        selectedData: [],
        showClearBtn: true
      }
    }
  },
  computed: {
    iValue: {
      get() {
        let value = this.value
        if (!value || value.length === 0) {
          return []
        }
        if (typeof value[0] === 'object') {
          value = value.map(item => {
            return item.id
          })
        }
        return _.uniq(value)
      },
      set(val) {
        console.log('Value changed: ', val)
        this.$emit('input', _.uniq(val))
      }
    }
  },
  methods: {
    onInputChange(val) {
      this.$emit('input', val)
    },
    handleFocus() {
      console.log('SHow transfer ')
      this.$refs.select2.selectRef.blur()
      this.pagingTransfer.selectedData = this.$refs.select2.iOptions.map(item => {
        return { id: item.value, label: item.label }
      }).filter(item => {
        return this.iValue.includes(item.id)
      })
      console.log('Selected data: ', this.pagingTransfer.selectedData)
      this.showTransfer = true
    },
    handleSelectInitialed() {
      console.log('Options: ')
      this.selectInitialized = true
    },
    handleTransConfirm() {
      const selectedData = this.$refs.pageTransfer.checkedData
      const options = selectedData.map(item => {
        return { value: item.id, label: item.label }
      })
      this.select2.options = options
      this.$emit('input', options.map(item => item.value))
      this.showTransfer = false
    }
  }
}
</script>

<style scoped>

</style>
