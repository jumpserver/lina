<template>
  <IBox :title="title" fa="fa-info-circle">
    <div class="content">
      <el-row v-for="item in items" :key="'card-' + item.key" class="item" :gutter="10">
        <el-col :span="6"><div class="item-label" :style="{ 'text-align': align }"><label>{{ item.key }}: </label></div></el-col>
        <el-col :span="18"><div class="item-text">
          <ItemValue :value="item.value" :item="item" :callback="item.callback" />
        </div></el-col>
      </el-row>
      <slot />
    </div>
  </IBox>
</template>

<script>
import IBox from '../IBox'
import ItemValue from './ItemValue'

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
    items: {
      type: Array,
      default: () => []
    },
    align: {
      type: String,
      default: 'left'
    }
  }
}
</script>

<style scoped>
  .content {
    font-size: 13px;
    line-height: 2.5;
  }
</style>
