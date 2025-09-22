<template>
  <div class="asset-select">
    <div class="asset-list">
      <ul>
        <li v-for="(item, index) in selectAssetRows" :key="index">
          <div class="icon-zone">
            <img :src="getPlatformLogo(item)" alt="icon" class="asset-icon">
          </div>
          <span class="asset-name">{{ item.name }}</span>
        </li>
      </ul>
    </div>
    <el-button
      class="select-btn"
      type="primary"
      @click="handleClick"
    >
      请选择资产
    </el-button>

    <AssetSelectDialog
      v-if="dialogVisible"
      ref="dialog"
      :base-node-url="baseNodeUrl"
      :base-url="baseUrl"
      :tree-setting="treeSetting"
      :tree-url-query="treeUrlQuery"
      :value="value"
      :visible.sync="dialogVisible"
      v-bind="$attrs"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import AssetSelectDialog from '@/components/Apps/AssetSelect/dialog.vue'
import { loadPlatformIcon } from '@/utils/jms/index'

export default {
  componentName: 'SelectJobAssetDialog',
  components: { AssetSelectDialog },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/assets/assets/'
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    baseNodeUrl: {
      type: String,
      default: '/api/v1/assets/nodes/'
    },
    treeUrlQuery: {
      type: Object,
      default: () => {
      }
    },
    value: {
      type: Array,
      default: () => []
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectAssetRows: []
    }
  },
  methods: {
    handleClick() {
      this.dialogVisible = true
    },
    handleConfirm(valueSelected, rowsAdd) {
      console.log(valueSelected, rowsAdd)
      if (valueSelected === undefined) {
        return
      }
      this.$emit('select', valueSelected)
      this.selectAssetRows = rowsAdd
      // this.addRowsToSelect(rowsAdd)
      // this.onInputChange(valueSelected)
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    getPlatformLogo(platform) {
      return loadPlatformIcon(platform.name, platform.type.value)
    },
    onInputChange(val) {
      this.$emit('change', val)
    },
    addToSelect(options, row) {
      const selectOptionsHas = options.find(item => item.value === row.id)
      // 如果select2的options中没有，那么可能无法显示正常的值
      if (selectOptionsHas === undefined) {
        const option = {
          label: `${row.name}(${row.address})`,
          value: row.id
        }
        options.push(option)
      }
    },
    addRowsToSelect(rows) {
      const outSelectOptions = this.$refs.select2.options
      for (const row of rows) {
        this.addToSelect(outSelectOptions, row)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select {
  display: flex;
  height: 100%;
  flex-direction: column;

  .asset-list {

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        padding: 5px 10px;
        color: var(--color-primary-dark-3);
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 6px;

        .icon-zone {
          width: 1.5em;
          height: 1.5em;

          .asset-icon {
            height: 100%;
            width: 100%;
            vertical-align: -0.2em;
            fill: currentColor;
          }
        }

        .asset-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .select-btn {
    justify-content: center;
    align-items: center;
    margin: auto;
  }
}

.el-select {
  width: 100%;
}

.page ::v-deep .page-heading {
  display: none;
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0 0 0 3px;

  .tree-table {
    .left {
      padding: 5px 0;

      .ztree {
        height: 100%;
      }
    }

    .right {
      .transition-box {
        padding-left: 0;
      }
    }

    .mini {
      padding-top: 8px;
      width: 1px;
    }

    .transition-box {
      padding: 10px 5px;
    }
  }
}

.page ::v-deep .treebox {
  height: inherit !important;
}
</style>
