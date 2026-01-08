<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script lang="jsx">
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
        'name', 'priority',
        {
          key: this.$t('Rule'),
          formatter: () => {
            const newArr = this.object.strategy_rules || []
            return (
              <ul>
                {
                  newArr.map((r, index) => {
                    return <li>
                      <el-tag size='small' key={index}>
                        {r.attr.label}<strong> {`${r.match.label}`} </strong>{r.value}
                      </el-tag>
                    </li>
                  })
                }
              </ul>
            )
          }
        },
        {
          key: this.$t('Action'),
          formatter: () => {
            const newArr = this.object.strategy_actions || []
            return (
              <ul>
                {
                  newArr.map((a, index) => {
                    return <li>
                      <el-tag size='small' key={index}>
                        <strong>{a.attr.label}: </strong>{`${a.value.label}`}
                      </el-tag>
                    </li>
                  })
                }
              </ul>
            )
          }
        },
        'comment', 'org_name'
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
