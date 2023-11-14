<template>
  <Dialog title="绑定资源" top="80px" v-bind="$attrs" width="760px" v-on="$listeners">
    <div style="padding: 0 20px 20px">
      <el-row>
        <div class="label-zone">
          <label class="type-label" for="">类型: </label>
        </div>
        <el-select v-model="select2.value" class="select2" placeholder="请选择" @change="handleChangeType">
          <el-option-group
            v-for="group in select2.options"
            :key="group.label"
            :label="group.label"
          >
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
          <label class="table-label" for="">选择资源: </label>
        </div>
        <krryPaging ref="pageTransfer" class="transfer" v-bind="pagingTransfer" />
      </el-row>
    </div>
  </Dialog>
</template>

<script>
import krryPaging from '@/components/Libs/Krry/paging/index.vue'
import { getUserList } from '@/api/users'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'BindDrawer',
  components: { Dialog, krryPaging },
  data() {
    const vm = this
    return {
      select2Done: false,
      select2: {
        value: '',
        options: [],
        multiple: false
      },
      pagingTransfer: {
        pageSize: 10,
        filterable: true,
        async: true,
        dataList: [],
        getPageData: async function(pageIndex, pageSize) {
          const limit = pageSize
          const offset = (pageIndex - 1) * pageSize
          const params = {
            'limit': limit,
            'offset': offset,
            'fields_size': 'mini'
          }
          if (!vm.select2.value) {
            return
          }
          const data = await this.$axios.get(`/api/v1/labels/resource-types/${vm.select2.value}/resources/`, { params })
          const results = data['results'].map(item => {
            return { id: item.id, label: item.name }
          })
          return results
        },
        getSearchData: async function(keyword, pageIndex, pageSize) {
          const limit = pageSize
          const offset = (pageIndex - 1) * pageSize
          const params = {
            'limit': limit,
            'offset': offset,
            'oid': 'ROOT',
            'search': keyword
          }
          const data = await getUserList(params)
          const results = data['results'].map(item => {
            return { id: item.id, label: _.escape(`${item.name}(${item.username})`) }
          })
          return results
        },
        selectedData: [],
        showClearBtn: true
      },
      table: {
        tableConfig: {
          url: '/api/v1/assets/assets/',
          columns: ['id', 'name'],
          columnsShow: {
            default: ['id', 'name'],
            min: ['id', 'name']
          },
          columnsMeta: {
            name: {
              formatter: (row, col) => {
                return row.name
              }
            }
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasRightActions: false
        }
      }
    }
  },
  mounted() {
    this.getResourceTypes()
  },
  methods: {
    handleChangeType() {
      this.$refs.pageTransfer.getData(1)
    },
    async getResourceTypes() {
      const resourceTypes = await this.$axios.get('/api/v1/labels/resource-types/')
      const grouped = _.groupBy(resourceTypes, 'app_label')
      const options = []
      for (const [app, types] of Object.entries(grouped)) {
        const children = []
        for (const type of types) {
          children.push({
            value: type.id,
            label: type.name + '(' + type.app_label + '.' + type.model + ')'
          })
        }
        options.push({
          label: app,
          options: children
        })
      }
      console.log(options)
      this.select2.options = options
    }
  }
}
</script>

<style lang='scss' scoped>
.table {
  margin: 20px;
}

.type-label {
  width: 200px;
  display: block;
}

.select2 {
  width: 300px;
}

.el-row {
  margin: 20px 0;
}

.label-zone {
  margin-bottom: 8px;
}

</style>
