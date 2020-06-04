<template>
  <IBox :fa="icon" :type="type" :title="title" v-bind="$attrs">
    <table style="width: 100%">
      <tr>
        <td colspan="2">
          <AssetSelect ref="assetSelect" @change="getAsset" />
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <el-button :type="type" size="small" @click="addObjects">{{ $t('common.Add') }}</el-button>
        </td>
      </tr>
    </table>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox/index'
import AssetSelect from '@/components/AssetSelect/index'
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
      default(that) {
        this.$log.debug('AssetSelect value', that.assets)
        this.$message.success(this.$t('common.updateSuccessMsg'))
        setTimeout(() => location.reload(), 500)
      }
    }
  },
  data() {
    return {
      assets: []
    }
  },
  methods: {
    addObjects() {
      this.performAdd(this.assets, this).then(
        () => this.onAddSuccess(this)
      )
    },
    getAsset(assets) {
      this.assets = assets
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
