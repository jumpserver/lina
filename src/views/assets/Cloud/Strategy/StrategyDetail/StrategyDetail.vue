<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import { resolveComponent as _resolveComponent, createVNode as _createVNode, createTextVNode as _createTextVNode } from "vue";
import AutoDetailCard from '@/components/Cards/DetailCard/auto';
import TwoCol from '@/layout/components/Page/TwoColPage.vue';
export default {
  name: 'StrategyDetail',
  components: {
    TwoCol,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/xpack/cloud/strategies/${this.object.id}/`,
      detailFields: ['name', 'priority', {
        key: this.$t('Rule'),
        formatter: () => {
          const newArr = this.object.strategy_rules || [];
          return _createVNode("ul", null, [newArr.map((r, index) => {
            return _createVNode("li", null, [_createVNode(_resolveComponent("el-tag"), {
              "size": "small",
              "key": index
            }, {
              default: () => [r.attr.label, _createVNode("strong", null, [_createTextVNode(" "), `${r.match.label}`, _createTextVNode(" ")]), r.value]
            })]);
          })]);
        }
      }, {
        key: this.$t('Action'),
        formatter: () => {
          const newArr = this.object.strategy_actions || [];
          return _createVNode("ul", null, [newArr.map((a, index) => {
            return _createVNode("li", null, [_createVNode(_resolveComponent("el-tag"), {
              "size": "small",
              "key": index
            }, {
              default: () => [_createVNode("strong", null, [a.attr.label, _createTextVNode(": ")]), `${a.value.label}`]
            })]);
          })]);
        }
      }, 'comment', 'org_name']
    };
  }
};
</script>

<style scoped>
ul {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

li {
  list-style: none;
  margin: 3px 0;
}
</style>
