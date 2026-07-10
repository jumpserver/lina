<template>
  <Dialog
    v-bind="$attrs"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :title="$tc('BindResource')"
    top="80px"
    width="768px"
    @cancel="handleCancel"
    @confirm="handleConfirm"
  >
    <div style="padding: 0 20px 20px">
      <el-row class="type-row jms-form-controls">
        <label class="type-label" for="">{{ $t('ResourceType') }}: </label>
        <el-select v-model="select2.value" class="select2" @change="handleChangeType">
          <el-option-group v-for="group in select2.options" :key="group.label" :label="group.label">
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-option-group>
        </el-select>
      </el-row>
      <el-row>
        <div class="label-zone">
          <label class="table-label" for="">{{ $t('SelectResource') }}: </label>
        </div>
        <krryPaging
          v-bind="pagingTransfer"
          v-if="!transferLoading"
          ref="pageTransfer"
          class="transfer"
        />
      </el-row>
    </div>
  </Dialog>
</template>

<script>
import krryPaging from '@/components/Libs/Krry/paging/index.vue'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'BindDrawer',
  components: { Dialog, krryPaging },
  props: {
    label: {
      type: Object,
      required: true
    }
  },
  data() {
    const vm = this
    const getPageData = async ({ pageIndex, pageSize, keyword }) => {
      const limit = pageSize
      const offset = (pageIndex - 1) * pageSize
      const params = {
        limit: limit,
        offset: offset,
        fields_size: 'mini'
      }
      if (keyword) {
        params['search'] = keyword
      }
      if (!vm.select2.value) {
        return
      }
      const url = `/api/v1/labels/resource-types/${vm.select2.value}/resources/`
      const data = await this.$axios.get(url, { params })
      return data['results'].map((item) => {
        return { id: item.id, label: item.name }
      })
    }
    return {
      select2: {
        value: '',
        options: [],
        multiple: false
      },
      transferLoading: false,
      pagingTransfer: {
        pageSize: 100,
        filterable: true,
        async: true,
        dataList: [],
        getPageData: function (pageIndex, pageSize) {
          return getPageData({ pageIndex, pageSize })
        },
        getSearchData: async function (keyword, pageIndex, pageSize) {
          return getPageData({ keyword, pageIndex, pageSize })
        },
        selectedData: [],
        showClearBtn: true,
        transferOnCheck: true
      }
    }
  },
  mounted() {
    this.getResourceTypes()
  },
  methods: {
    handleChangeType() {
      const url = `/api/v1/labels/labels/${this.label.id}/resource-types/${this.select2.value}/resources/`
      this.$axios.get(url).then((res) => {
        this.pagingTransfer.selectedData = res.map((item) => {
          return { id: item.id, label: item.name }
        })
      })
      this.$refs.pageTransfer.getData(1)
    },
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      const selectedData = this.$refs.pageTransfer.getSelectedData()
      const data = {
        res_ids: selectedData
      }
      const url = `/api/v1/labels/labels/${this.label.id}/resource-types/${this.select2.value}/resources/`
      this.$axios.put(url, data).then((res) => {
        setTimeout(() => {
          this.$message.success(this.$tc('BindSuccess'))
          this.$emit('bind-success')
        }, 100)
      })
    },
    async getResourceTypes() {
      const resourceTypes = await this.$axios.get('/api/v1/labels/resource-types/')
      const grouped = _.groupBy(resourceTypes, 'app_display')
      const options = []
      for (const [app, types] of Object.entries(grouped)) {
        const children = []
        for (const type of types) {
          children.push({
            value: type.id,
            label: type.name
          })
        }
        options.push({
          label: app,
          options: children
        })
      }
      this.select2.options = options
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  margin: 20px;
}

.el-row {
  margin: 20px 0;
}

// 资源类型行:label 在左,select 占满剩余宽度(右边缘与下方穿梭框对齐)
.type-row {
  display: flex;
  align-items: center;

  .type-label {
    margin-right: 12px;
    white-space: nowrap;
  }

  .select2 {
    flex: 1;
  }
}

.label-zone {
  margin-bottom: 8px;
}
</style>
