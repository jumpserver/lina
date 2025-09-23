<template>
  <div class="asset-select">
    <el-card>
      <div slot="header" class="clearfix">
        <span>已选资产({{ selectAssets.length }})</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="handleClick"
        >
          请选择资产
        </el-button>
      </div>
      <div class="asset-list">
        <el-checkbox-group
          v-model="selectAssets"
          @change="onCheckboxChange"
        >
          <el-checkbox v-for="(item) in selectAssetRows" :key="item.id" :label="item.id">
            <div class="icon-zone">
              <img :src="getPlatformLogo(item)" alt="icon" class="asset-icon">
            </div>
            <span :title="item.name" class="asset-name">{{ item.name }}</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </el-card>

    <AssetSelectDialog
      v-if="dialogVisible"
      ref="dialog"
      :base-node-url="baseNodeUrl"
      :base-url="baseUrl"
      :tree-setting="treeSetting"
      :tree-url-query="treeUrlQuery"
      :value="selectAssets"
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
      selectAssetRows: [],
      selectAssets: []
    }
  },
  methods: {
    handleClick() {
      this.dialogVisible = true
    },
    handleConfirm(valueSelected, rowsAdd) {
      if (valueSelected === undefined) {
        return
      }
      this.$emit('select', valueSelected)
      rowsAdd.forEach(item => {
        if (!this.selectAssetRows.find(i => i.id === item.id)) {
          this.selectAssetRows.push(item)
        }
      })
      this.selectAssets = valueSelected
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    getPlatformLogo(platform) {
      return loadPlatformIcon(platform.name, platform.type.value)
    },
    onCheckboxChange(value) {
      this.selectAssets = value
      this.$emit('change', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select {
  display: flex;
  flex-direction: column;
  background: #fff;
  color: var(--color-border);

  ::v-deep {
    .el-card {
      flex: 1;

    }

    .el-card__body {
      height: calc(100vh - 200px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px 16px;
    }

    .el-checkbox {
      width: 100%;
      display: flex;
      padding: 3px 0;
      margin-right: 0;
      align-items: center;

      .el-checkbox__label {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 6px;
        padding-right: 20px;
      }
    }
  }

  .asset-list {
    margin: auto;

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
