<template>
  <IBox fa="fa-edit" :title="title" v-bind="$attrs">
    <div class="quick-actions">
      <table>
        <ActionItem v-for="action of actions" :key="action.title" :action="action" />
      </table>
    </div>
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import ActionItem from './action'

// 查看 views/users/users/UserDetail/UserInfo.vue 使用样例
export default {
  name: 'QuickActions',
  components: {
    IBox,
    ActionItem
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$tc('Quick update')
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
  .quick-actions >>> table {
    width: 100%;
  }
  .quick-actions >>> tr > td {
    line-height: 1.43;
    padding: 8px;
    vertical-align: top;
    font-size: 13px;
    width: 50%;
  }

  .quick-actions >>> tr > td > span:last-child {
    float: right;
  }

  .quick-actions >>> button {
    padding: 2px 10px;
    font-size: 13px;
  }
</style>
