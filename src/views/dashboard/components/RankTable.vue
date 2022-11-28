<template>
  <div class="box">
    <div class="head">
      <span class="title">
        {{ title }}
        <el-tooltip
          v-if="note"
          effect="dark"
          :content="note"
          placement="top"
        >
          <i class="fa fa-exclamation-circle icon" />
        </el-tooltip>
        <i v-else class="fa fa-exclamation-circle icon" />
      </span>
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
      <el-table-column :label="'排名'">
        <template v-slot="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="i in columns"
        :key="i.prop"
        :prop="i.prop"
        :label="i.label"
      >
        {{ i.prop }}
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    note: {
      type: String,
      default: ''
    },
    data: {
      type: String,
      default: () => ''
    },
    columns: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => [
        {
          label: '今天',
          value: '1'
        },
        {
          label: '近7天',
          value: '7'
        },
        {
          label: '近30天',
          value: '30'
        }
      ]
    }
  },
  data() {
    return {
      select: '1',
      tableData: [],
      tableUrl: this.url + `&days=1`
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$axios.get(this.tableUrl).then(res => {
        this.tableData = this.data ? res?.[this.data] : res
      })
    },
    onChange() {
      this.tableUrl = this.url + `&days=${this.select}`
      this.init()
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
    .title {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 26px;
      color: #1F2329;
    }
    .icon {
      color: #BBBFC4;
      cursor: pointer;
    }
    .switch {
      background: #EFF0F1;
      border-radius: 4px;
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
