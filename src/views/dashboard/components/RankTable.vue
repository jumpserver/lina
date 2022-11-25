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
    <AutoDataTable class="table" :config="tableConfig" />
  </div>
</template>

<script>
import AutoDataTable from '@/components/AutoDataTable'

export default {
  components: {
    AutoDataTable
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
    columns: {
      type: Array,
      default: () => []
    },
    columnsMeta: {
      type: Object,
      default: () => ({})
    },
    config: {
      type: Object,
      default: () => ({})
    },
    options: {
      type: Array,
      default: () => [
        {
          label: '今天',
          value: 'today'
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
      select: 'today',
      tableConfig: {
        url: this.url,
        columns: [...new Set(['index', ...this.columns])],
        columnsMeta: {
          index: {
            label: '排名',
            width: 60,
            formatter: (row, column, value, index) => index + 1
          },
          ...this.columnsMeta
        },
        hasSelection: false,
        paginationSize: 10
      }
    }
  },
  created() {

  },
  methods: {
    onChange() {
      this.tableConfig.url = this.url + `?range=${this.select}`
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
.table {
  &>>> .el-table .el-table__header-wrapper thead {
    th, tr {
      height: 46px;
      background-color: #F5F6F7!important;
    }
  }
  &>>> .el-data-table .el-pagination {
  display: none;
}
}
</style>
