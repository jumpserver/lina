<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    <IBox :title="$tc('Variable')">
      <Variable v-model="object.variable" @input="updateVariable" />
    </IBox>
  </TwoCol>
</template>

<script>
import { IBox } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import Variable from '@/views/ops/Template/components/Variable.vue'

export default {
  components: {
    TwoCol,
    IBox,
    Variable,
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
      url: `/api/v1/ops/jobs/${this.object.id}/`,
      detailFields: [
        'name',
        'type',
        'comment',
        {
          key: this.$t('AverageTimeCost'),
          value: this.object.average_time_cost.toFixed(2) + 's'
        },
        'date_last_run',
        'date_updated',
        'date_created'
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  },
  methods: {
    updateVariable() {
      const url = `/api/v1/ops/jobs/${this.object.id}/`
      this.$axios.patch(url, { variable: this.object.variable }).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
