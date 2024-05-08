<template>
  <IBox :fa="fa" :title="$tc('QuickUpdate')" v-bind="$attrs">
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
        return this.$t('QuickUpdate')
      }
    },
    actions: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped lang='scss'>
.quick-actions {
  ::v-deep table {
    width: 100%;
  }

  ::v-deep button {
    padding: 4px 10px;
    font-size: 13px;
  }

  ::v-deep tr > td {
    width: 50%;
    padding: 8px;
    vertical-align: top;
    line-height: 1.43;
    font-size: 13px;

    & > span:last-child {
      float: right;
    }
  }
}
</style>
