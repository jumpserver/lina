<template>
  <div>
    <el-table
      v-loading="loading"
      :data="tabledata"
    >
      <el-table-column
        v-if="hasSelect"
        type="selection"
        align="center"
        header-align="center"
      />
      <el-table-column
        v-for="col of columns"
        :key="col.props"
        :label="col.label"
      >
        <template slot-scope="scope">
          <el-button v-if="col.nextroute" type="text" size="small" style="font-size:14px" @click="$router.push({name: col.nextroute, params: { id: scope.row.id }})">{{ scope.row[col.key] }}</el-button>
          <span v-else>{{ scope.row[col.key] }}</span>
        </template>
      </el-table-column>
      <slot name="action" />
    </el-table>
    <el-pagination
      style="text-align:center;margin-top:20px;"
      :current-page="current_page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="page_size"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
// import ElDataTableColumn from '@/components/el-data-table/components/el-data-table-column'
export default {
  components: {
    // ElDataTableColumn
  },
  props: {
    getData: {
      type: Function,
      default: () => []
    },
    hasSelect: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tabledata: [],
      loading: false,
      page_size: 10,
      current_page: 1,
      total: 0
    }
  },
  created() {
    this.get(this.current_page, this.page_size, this.offset)
  },
  methods: {
    handleSizeChange(val) {
      this.offset = (this.current_page - 1) * val
      this.page_size = val
      this.get(this.current_page, val, this.offset)
    },
    handleCurrentChange(val) {
      this.offset = (val - 1) * this.page_size
      this.current_page = val
      this.get(val, this.page_size, this.offset)
    },
    get(draw, limit, offset) {
      this.loading = true
      this.getData({ draw, limit, offset }, { row: 1 }).then(response => {
        console.log(response)
        this.tabledata = response.results
        this.total = response.count
        this.loading = false
      })
    }

  }
}
</script>

<style>

</style>
