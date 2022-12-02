<template>
  <div class="box">
    <div class="head">
      <Title :config="config" />
      <SwitchDate @change="onChange" />
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      class="table"
    >
      <el-table-column :label="$tc('dashboard.ranking')">
        <template v-slot="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="i in config.columns"
        :key="i.prop"
        :prop="i.prop"
        :label="i.label"
      />
    </el-table>
  </div>
</template>

<script>
import Title from './Title.vue'
import SwitchDate from './SwitchDate.vue'

export default {
  components: {
    Title,
    SwitchDate
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tableData: [],
      tableUrl: this.config.url + `&days=1`
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.$axios.get(this.tableUrl).then(res => {
        this.tableData = this.config.data ? res?.[this.config.data] : res
      })
    },
    onChange(val) {
      this.tableUrl = this.config.url + `&days=${val}`
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-top: 16px;
  padding: 20px;
  background: #fff;
  .head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
>>> .el-table th, .el-table tr {
  background-color: #F5F6F7!important;
}
</style>
