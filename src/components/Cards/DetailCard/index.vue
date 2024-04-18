<template>
  <IBox :fa="fa" :title="title">
    <el-form class="content" label-position="left" label-width="25%">
      <el-form-item v-for="item in iItems" :key="item.key" :label="item.key">
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
        return this.$t('common.BasicInfo')
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
    }
  },
  data() {
    return {
      iItems: this.items.filter(item => {
        return !item.hasOwnProperty('has') || item.has === true
      })
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

    &:hover {
    }

    >>> .el-form-item__label {
      padding-right: 8%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
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
