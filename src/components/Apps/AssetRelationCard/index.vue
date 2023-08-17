<template>
  <IBox :fa="icon" :title="title" :type="type" v-bind="$attrs">
    <table style="width: 100%">
      <tr>
        <td colspan="2">
          <AssetSelect ref="assetSelect" :can-select="canSelect" :disabled="disabled" />
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <el-button :disabled="disabled" :type="type" size="small" @click="addObjects">{{ $t('common.Add') }}</el-button>
        </td>
      </tr>
    </table>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox/index.vue'
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
    return {
    }
  },
  methods: {
    addObjects() {
      const objects = this.$refs.assetSelect.$refs.select2.iValue
      this.performAdd(objects, this).then(
        () => this.onAddSuccess(objects, this)
      )
    }
  }
}
</script>

<style scoped>
  b, strong {
    font-weight: 700;
    font-size: 13px;
  }

  tr td {
    line-height: 1.42857;
    padding: 8px;
    vertical-align: top;
  }

  tr.item td {
    border-top: 1px solid #e7eaec;
  }
</style>
