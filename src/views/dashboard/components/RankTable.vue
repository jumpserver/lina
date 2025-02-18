<template>
  <div class="box">
    <div class="head">
      <Title :config="config" />
      <SwitchDate @change="onChange" />
    </div>
    <el-table
      :data="tableData"
      class="table"
      style="width: 100%"
    >
      <el-table-column :label="$tc('Ranking')">
        <template #header>
          <el-tooltip :content="$t('Ranking')" placement="top" :open-delay="500">
            <span style="cursor: pointer;">{{ $t('Ranking') }}</span>
          </el-tooltip>
        </template>
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column
        v-for="i in config.columns"
        :key="i.prop"
        :prop="i.prop"
        :width="getColumnWidth(i)"
      >
        <template #header>
          <el-tooltip :content="i.label" placement="top" :open-delay="500">
            <span style="cursor: pointer;">{{ i.label }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
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
      default: () => {
      }
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    const days = localStorage.getItem('dashboardDays') || '7'
    return {
      tableData: [],
      tableUrl: this.config.url + `&days=${days}`
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getColumnWidth(column) {
      if (column.prop === 'total') {
        const locale = this.$i18n.locale
        switch (locale) {
          case 'en':
            return '120px'
          case 'pt-br':
            return '220px'
          default:
            return '100px'
        }
      }
    },
    getList() {
      this.$axios.get(this.tableUrl).then(res => {
        this.tableData = this.config.data ? res?.[this.config.data] : res
      })
    },
    onChange(val) {
      this.tableUrl = this.config.url + `&days=${val}`
      this.getList()
      localStorage.setItem('dashboardDays', val)
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

::v-deep .el-table td, .el-table th {
  padding: 5px 0;
}

::v-deep .el-table th, .el-table tr {
  background-color: #F5F6F7 !important;

}

::v-deep .el-table .cell {
  white-space: nowrap;
}
</style>
