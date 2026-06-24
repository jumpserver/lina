<template>
  <IBox v-bind="$attrs" :fa="icon" :title="title" :type="type" class="asset-relation-box the-box">
    <table class="CardTable" style="width: 100%; table-layout: fixed">
      <tbody>
        <tr>
          <td colspan="2">
            <AssetSelect
              ref="assetSelect"
              :can-select="canSelect"
              :disabled="disabled"
              class="asset-relation-card__select"
            />
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <el-button :disabled="disabled" :type="type" size="small" @click="addObjects">{{
              $t('Add')
            }}</el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import AssetSelect from '@/components/Apps/AssetSelect/index.vue'

export default {
  name: 'AssetRelationCard',
  components: {
    IBox,
    AssetSelect
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'primary'
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    },
    value: {
      type: [Array, Number, String],
      default: () => []
    },
    performAdd: {
      type: Function,
      default: (objects, that) => {}
    },
    onAddSuccess: {
      type: Function,
      default: (objects, that) => {}
    },
    canSelect: {
      type: Function,
      default(row, index) {
        return true
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    addObjects() {
      const objects = this.$refs.assetSelect.getSelectedValue()
      this.performAdd(objects, this).then(() => this.onAddSuccess(objects, this))
    }
  }
}
</script>

<style scoped>
b,
strong {
  font-weight: 700;
  font-size: 13px;
}

tr td {
  line-height: 1.4;
  padding: 8px 0;
  vertical-align: top;
}

.asset-relation-card__select {
  width: 100%;
}

.asset-relation-box :deep(.select2 .el-select__tags) {
  height: 28px;
  min-height: 28px;
  align-items: center;
}

.asset-relation-box :deep(.el-button) {
  height: 30px;
  min-height: 30px;
  width: auto;
  font-weight: 400;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1;
}

.asset-relation-box :deep(.el-button--primary),
.asset-relation-box :deep(.el-button--danger) {
  color: #fff;
}
</style>
