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
      default: ''
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

<style scoped>
  html:lang(en) .quick-actions ::v-deep button {
    width: 80px;
  }

  html:lang(ja) .quick-actions ::v-deep button {
    width: 100px;
  }

  html:lang(zh-tw) .quick-actions ::v-deep button {
    width: 65px;
  }

  html:lang(zh-cn) .quick-actions ::v-deep button {
    width: 65px;
  }

  .quick-actions ::v-deep table {
    width: 100%;
  }

  .quick-actions ::v-deep tr > td {
    line-height: 1.43;
    padding: 8px;
    vertical-align: top;
    font-size: 13px;
    width: 50%;
  }

  .quick-actions ::v-deep tr > td > span:last-child {
    float: right;
  }

  .quick-actions ::v-deep button {
    padding: 4px 5px;
    font-size: 13px;

    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      display: block;
    }
  }
</style>
