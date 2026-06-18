<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import {
  resolveComponent as resolveComponentCompat,
  createVNode as createVNodeCompat,
  createTextVNode as createTextVNodeCompat
} from 'vue'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
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
      detailFields: [
        'name',
        'priority',
        {
          key: this.$t('Rule'),
          formatter: () => {
            const newArr = this.object.strategy_rules || []
            return createVNodeCompat('ul', null, [
              newArr.map((r, index) => {
                return createVNodeCompat('li', null, [
                  createVNodeCompat(
                    resolveComponentCompat('el-tag'),
                    {
                      size: 'small',
                      key: index
                    },
                    {
                      default: () => [
                        r.attr.label,
                        createVNodeCompat('strong', null, [
                          createTextVNodeCompat(' '),
                          `${r.match.label}`,
                          createTextVNodeCompat(' ')
                        ]),
                        r.value
                      ]
                    }
                  )
                ])
              })
            ])
          }
        },
        {
          key: this.$t('Action'),
          formatter: () => {
            const newArr = this.object.strategy_actions || []
            return createVNodeCompat('ul', null, [
              newArr.map((a, index) => {
                return createVNodeCompat('li', null, [
                  createVNodeCompat(
                    resolveComponentCompat('el-tag'),
                    {
                      size: 'small',
                      key: index
                    },
                    {
                      default: () => [
                        createVNodeCompat('strong', null, [
                          a.attr.label,
                          createTextVNodeCompat(': ')
                        ]),
                        `${a.value.label}`
                      ]
                    }
                  )
                ])
              })
            ])
          }
        },
        'comment',
        'org_name'
      ]
    }
  }
}
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
