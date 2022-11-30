<template>
  <div class="box">
    <div class="head">
      <Title :config="config" />
      <span>
        <el-radio-group
          v-model="select"
          class="switch"
          size="mini"
          @change="onChange"
        >
          <el-radio-button v-for="i in options" :key="i.value" :label="i.value">
            {{ i.label }}
          </el-radio-button>
        </el-radio-group>
      </span>
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

export default {
  components: {
    Title
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
    const defaultOptions = [
      {
        label: this.$t('dashboard.Today'),
        value: '1'
      },
      {
        label: this.$t('dashboard.Last7Days'),
        value: '7'
      },
      {
        label: this.$t('dashboard.Last30Days'),
        value: '30'
      }
    ]
    return {
      select: '1',
      tableData: [],
      options: this.config.options || defaultOptions,
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
    onChange() {
      this.tableUrl = this.config.url + `&days=${this.select}`
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
    .switch {
      background: #EFF0F1;
      border-radius: 4px;
      padding: 0 4px;
      &>>> .el-radio-button {
        .el-radio-button__inner {
          border: none;
          color: #8F959E;
          background: #EFF0F1;
        }
        &.is-active {
          border-radius: 4px;
          padding: 4px 0;
          .el-radio-button__inner {
            color: var(--color-primary);
            background-color: #FFF;
            border-radius: 4px;
          }
        }
      }
      &>>> .el-radio-button__orig-radio:checked+.el-radio-button__inner {
        box-shadow: none;
      }
    }
  }
}
>>> .el-table th, .el-table tr {
  background-color: #F5F6F7!important;
}
</style>
