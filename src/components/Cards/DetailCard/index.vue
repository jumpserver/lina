<template>
  <IBox :fa="fa" :title="title">
    <el-form :label-width="labelWidth" class="content" label-position="left">
      <el-form-item v-for="item in items" :key="item.key" :class="item.class" :label="item.key">
        <span slot="label"> {{ formateLabel(item.key) }}</span>
        <ItemValue :value="item.value" class="item-value" v-bind="item" />
      </el-form-item>
    </el-form>
    <slot />
  </IBox>
</template>

<script>
import IBox from '../../IBox/index.vue'
import ItemValue from './ItemValue.vue'

export default {
  name: 'DetailCard',
  components: { IBox, ItemValue },
  props: {
    title: {
      type: String,
      default() {
        return this.$t('BasicInfo')
      }
    },
    fa: {
      type: String,
      default: 'fa-info-circle'
    },
    items: {
      type: Array,
      default: () => []
    },
    align: {
      type: String,
      default: 'left'
    },
    labelWidth: {
      type: String,
      default: '25%'
    }
  },
  data() {
    return {
      iItems: this.items.filter(item => {
        return !item.hasOwnProperty('has') || item.has === true
      })
    }
  },
  methods: {
    formateLabel(label) {
      if (!label) {
        return label
      }
      return label.replace(' amount', '').replace('数量', '')
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-card__body {
    padding: 20px 40px;
  }

  .el-form-item {
    border-bottom: 1px dashed #EBEEF5;
    padding: 1px 0;
    margin-bottom: 0;

    &:last-child {
      border-bottom: none;
    }

    &.array-item {
      border-bottom: none;

      >>> .el-form-item__content {
        border-bottom: 1px dashed #EBEEF5
      }

      >>> .el-form-item__label:last-child {
        border: 1px dashed #EBEEF5;
      }
    }

    &:hover {
    }

    >>> .el-form-item__label {
      padding-right: 8%;
      //white-space: nowrap;
      //text-overflow: ellipsis;
      overflow: hidden;

      span {
        display: inline-block;
        line-height: 1.5;
      }
    }

    >>> .el-form-item__content {
      font-size: 13px;
    }

    >>> .el-tag--mini {
      margin-right: 3px;
    }
  }

  .item-value span {
    word-break: break-word;
  }
  .content {
    font-size: 13px;
    line-height: 2.5;
  }
</style>
