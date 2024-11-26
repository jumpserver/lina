<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
      <AutoDetailCard :excludes="excludes" :object="object" :url="url" />
    </el-col>
    <el-col :md="8" :sm="24">
      <IBox :title="$tc('Variable')">
        <Variable
          :value.sync="object.variable"
          :disable-edit="disableEdit"
          @input="updateVariable"
        />
      </IBox>
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import Variable from '@/views/ops/Template/components/Variable'
import { IBox } from '@/components'

export default {
  components: {
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
      url: `/api/v1/ops/adhocs/${this.object.id}/`,
      excludes: ['variable'],
      disableEdit: this.object.creator !== this.$store.state.users.profile.id
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  },
  methods: {
    updateVariable() {
      const url = `/api/v1/ops/adhocs/${this.object.id}/`
      this.$axios.patch(url, { variable: this.object.variable }).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
