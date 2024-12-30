<template>
  <IBox :fa="fa" :title="title">
    <el-form :label-width="labelWidth" class="content" label-position="left">
      <template v-for="item in items">
        <el-form-item v-if="item.has !== false" :key="item.key" :class="item.class" :label="item.key">
          <span slot="label"> {{ formateLabel(item.key) }}</span>
          <span
            :is="item.component"
            v-if="item.component"
            v-bind="{...item}"
          />
          <ItemValue v-else :value="item.value" class="item-value" v-bind="item" />
        </el-form-item>
      </template>
    </el-form>
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
      default: 'fa-info-circle-o'
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
      default: ''
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

.content {
  font-size: 13px;
  line-height: 2;

  ::v-deep .el-form-item {
    //border-bottom: 1px dashed #EBEEF5;
    padding: 1px 0;
    margin-bottom: 0;
    text-align: end;
    line-height: 1.2;

    &:last-child {
      //border-bottom: none;
    }

    &.array-item {
      border-bottom: none;

      ::v-deep .el-form-item__content {
        border-bottom: 1px dashed #EBEEF5
      }

      ::v-deep .el-form-item__label:last-child {
        border: 1px dashed #EBEEF5;
      }
    }

    .el-form-item__label {
      //padding-right: 8%;
      overflow: hidden;
      color: var(--color-icon-primary);
      font-size: 12px;
      line-height: 30px;
      font-weight: 400;

      span {
        display: inline-block;
        //line-height: 1.1;
      }
    }

    .el-form-item__content {
      color: var(--color-text-primary);
      font-size: 13px;
      //line-height: 1.3;
      //padding-bottom: 10px;
    }

    ::v-deep .el-tag--mini {
      margin-right: 3px;
    }
  }

  .item-value span {
    word-break: break-word;
  }
}
</style>
