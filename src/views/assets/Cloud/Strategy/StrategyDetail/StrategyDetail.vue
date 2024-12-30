<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
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
                    return <li key={index}>{`${r.attr.label} ${r.match.label} ${r.value}`} </li>
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
                    return <li key={index}>{`${a.attr.label}: ${a.value.label}`} </li>
                  })
                }
              </ul>
            )
          }
        },
        'comment', 'org_name'
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  }
}
</script>

<style scoped>
ul {
  counter-reset: my-counter;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

li {
  counter-increment: my-counter;
  position: relative;
  padding-left: 20px;
}

li:before {
  content: counter(my-counter);
  display: block;
  position: absolute;
  left: 0;
  top: 32%;
  width: 14px;
  height: 14px;
  line-height: 12px;
  text-align: center;
  border: 1px solid;
  border-radius: 50%;
  background-color: #fff;
}
</style>

