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
import IBox from '@/components/IBox'
import ActionItem from './action'

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
      default: () => 'fa-edit'
    },
    title: {
      type: String,
      default() {
        return this.$t('common.QuickUpdate')
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
