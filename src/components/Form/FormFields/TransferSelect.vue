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
    <Dialog
      v-if="showTransfer"
      :close-on-click-modal="false"
      :title="label"
      :visible.sync="showTransfer"
      class="the-dialog"
      width="730px"
      @cancel="handleTransCancel"
      @confirm="handleTransConfirm"
    >
      <krryPaging v-if="selectInitialized" ref="pageTransfer" class="transfer" v-bind="pagingTransfer" />
    </Dialog>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'
import krryPaging from '@/components/Libs/Krry/paging/index.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'TransferSelect',
  components: { krryPaging, Select2, Dialog },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
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
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    }
  },
  data() {
    const vm = this
    const transformOption = vm.transformOption || vm.ajax.transformOption || ((item) => {
      return { label: item.name, value: item.id }
    })
    const url = vm.url || vm.ajax.url
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
      const data = await this.$axios.get(url, { params })
      return data['results'].map(item => {
        const n = transformOption(item)
        return { id: n.value, label: n.label }
      })
    }
    return {
      showTransfer: false,
      selectInitialized: false,
      select2: {
        options: [],
        multiple: true,
        disabled: this.disabled,
        ajax: {
          url: url,
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
        this.emit(val)
      }
    }
  },
  methods: {
    emit(val) {
      const value = _.uniq(val)
      this.$emit('input', value)
    },
    onInputChange(val) {
      this.emit(val)
    },
    handleFocus() {
      this.$refs.select2.selectRef.blur()
      this.pagingTransfer.selectedData = this.$refs.select2.iOptions.map(item => {
        return { id: item.value, label: item.label }
      }).filter(item => {
        return this.iValue.includes(item.id)
      })
      this.showTransfer = true
    },
    handleSelectInitialed() {
      this.selectInitialized = true
    },
    handleTransCancel() {
      this.showTransfer = false
    },
    handleTransConfirm() {
      const selectedData = this.$refs.pageTransfer.selectListCheck
      const options = selectedData.map(item => {
        return { value: item.id, label: item.label }
      })
      this.select2.options = options
      this.emit(options.map(item => item.value))
      this.showTransfer = false
    }
  }
}
</script>

<style scoped>

</style>
