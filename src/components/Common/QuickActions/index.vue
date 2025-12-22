<template>
  <IBox :fa="fa" :title="title" v-bind="$attrs">
    <div v-for="action of actions" :key="action.title" class="quick-actions">
      <table>
        <ActionItem v-if="action.has === undefined || action.has" :action="action" />
      </table>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import ActionItem from './action.vue'

// 查看 views/users/users/UserDetail/UserInfo.vue 使用样例
export default {
  name: 'QuickActions',
  components: {
    IBox,
    ActionItem
  },
  props: {
    fa: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default() {
        return 'QuickUpdate'
      }
    },
    actions: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.quick-actions :deep(table) {
  width: 100%;
}

.quick-actions :deep(tr > td) {
  line-height: 1.43;
  padding: 8px 0;
  vertical-align: top;
  font-size: 13px;
  width: 50%;
}

.quick-actions :deep(tr > td > span:last-child) {
  float: right;
}

.quick-actions :deep(button) {
  padding: 4px 5px;
  font-size: 13px;
  min-width: 65px;

  span {
    overflow: hidden;
    white-space: nowrap; /* 控制文本不换行 */
    text-overflow: ellipsis;
    display: block;
  }
}
</style>
