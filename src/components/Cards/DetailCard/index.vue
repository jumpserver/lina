<template>
  <IBox :fa="fa" :title="title">
    <el-form :label-width="labelWidth" class="content detail-card" label-position="left">
      <template v-for="item in items">
        <div v-if="item.has !== false" :key="item.key" :class="item.class " :label="item.key" class="el-form-item">
          <span slot="label" class="el-form-item__label"> {{ formateLabel(item.key) }}</span>
          <span class="item-value el-form-item__content">
            <component
              :is="item.component"
              v-if="item.component"
              v-bind="{...item}"
            />
            <ItemValue v-else :value="item.value" v-bind="item" />
          </span>
        </div>
      </template>
    </el-form>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import ItemValue from './ItemValue.vue'

export default {
  name: 'DetailCard',
  components: { IBox, ItemValue },
  props: {
    title: {
      type: String,
      default() {
        return 'BasicInfo'
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
      default: '120px'
    }
  },
  data() {
    return {
      iItems: this.items.filter(item => {
        return !Object.prototype.hasOwnProperty.call(item, 'has') || item.has === true
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

  :deep(.el-form-item) {
    border-bottom: 1px dashed #F4F4F4;
    padding: 1px 0;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    //text-align: end;
    line-height: 32px;
    min-height: 32px;

    &:last-child {
      //border-bottom: none;
    }

    &.array-item {
      border-bottom: none;

      :deep(.el-form-item__content) {
        border-bottom: 1px dashed #EBEEF5
      }

      :deep(.el-form-item__label:last-child) {
        border: 1px dashed #EBEEF5;
      }
    }

    .el-form-item__label {
      //padding-right: 8%;
      overflow: hidden;
      color: var(--color-icon-primary);
      font-size: 12px;
      line-height: 1.5;
      font-weight: 400;
      width: 33%;
      min-width: 120px;
      padding: 5px 0;

      span {
        display: inline-block;
        //line-height: 1.1;
      }
    }

    .el-form-item__content {
      color: var(--color-text-primary);
      font-size: 13px;
      line-height: 1.5;
      width: calc(100% - 120px);
      padding: 5px 0;
    }

    :deep(.el-tag--small) {
      margin-right: 3px;
    }
  }

  .item-value {
    :deep(span) {
      //display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      vertical-align: middle;
    }
  }
}
</style>
