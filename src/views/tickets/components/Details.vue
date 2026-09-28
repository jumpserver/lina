<template>
  <IBox class="box">
    <template #header>
      <div class="clearfix ibox-title"><i /> {{ title }}</div>
    </template>
    <div class="content">
      <el-row :gutter="10">
        <el-col
          v-for="item in detailCardItems"
          :key="'card-' + item.key"
          :md="12"
          :sm="12"
          :class="{
            'item-list': Array.isArray(item.value) && item.value.length > 3 && !item.formatter
          }"
          style="display: flex"
        >
          <div :style="{ 'text-align': 'align' }" class="item-label">
            <label>{{ item.key }}: </label>
          </div>
          <div class="item-text">
            <TicketValueList
              v-if="Array.isArray(item.value) && !item.formatter"
              :items="item.value"
              :label="item.key"
            />
            <ItemValue v-else v-bind="item" />
          </div>
        </el-col>
      </el-row>
      <el-divider v-if="specialCardItems.length > 0" />
      <el-row :gutter="10">
        <el-col
          v-for="item in specialCardItems"
          :key="'card-' + item.key"
          :md="12"
          :sm="12"
          :class="{
            'item-list': Array.isArray(item.value) && item.value.length > 3 && !item.formatter
          }"
          style="display: flex"
        >
          <div :style="{ 'text-align': 'align' }" class="item-label">
            <label>{{ item.key }}: </label>
          </div>
          <div class="item-text">
            <TicketValueList
              v-if="Array.isArray(item.value) && !item.formatter"
              :items="item.value"
              :label="item.key"
            />
            <ItemValue v-else v-bind="item" />
          </div>
        </el-col>
      </el-row>
    </div>
  </IBox>
</template>
<script>
import ItemValue from '@/components/Cards/DetailCard/ItemValue'
import IBox from '@/components/Common/IBox'
import TicketValueList from './TicketValueList'

export default {
  name: 'Details',
  components: { ItemValue, IBox, TicketValueList },
  props: {
    specialCardItems: {
      type: Array,
      default: () => []
    },
    detailCardItems: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-bottom: 15px;
}

.content {
  font-size: 13px;
  line-height: 2.5;
}

.item-list {
  flex: 0 0 100%;
  max-width: 100%;
}

.item-label {
  margin-right: 4px;
  white-space: nowrap;
}

.item-label,
.item-text {
  display: inline-block;
}

// 长文本(如申请运行的命令 SQL)按需换行,不溢出卡片;
// min-width:0 让 flex 子项可收缩,overflow-wrap:anywhere 允许在超长无空格串处断行
.item-text {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
