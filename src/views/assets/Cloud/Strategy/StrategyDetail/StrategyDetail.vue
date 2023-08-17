<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'StrategyDetail',
  components: {
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
          key: this.$t('common.Rule'),
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
          key: this.$t('common.Action'),
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

