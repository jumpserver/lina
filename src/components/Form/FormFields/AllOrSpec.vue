<template>
  <div>
    <el-radio-group v-model="type" @input="handleTypeChange">
      <el-radio v-for="tp of types" :key="tp.name" :label="tp.name">
        {{ tp.label }}
      </el-radio>
    </el-radio-group>
    <Select2 v-if="type === 'spec'" v-model="selected" v-bind="select2" @change="onChangeEmit" />
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'

export default {
  name: 'AllOrSpec',
  components: { Select2 },
  props: {
    value: {
      type: [Array],
      default: () => ([])
    },
    select2: {
      type: Object,
      default: () => ({})
    },
    resource: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      type: 'all', // all, selected
      types: [
        { name: 'all', label: this.$t('All') + this.$t('WordSep') + this.resourceLower },
        { name: 'spec', label: this.$t('Spec') + this.$t('WordSep') + this.resourceLower }
      ],
      selected: []
    }
  },
  computed: {
    iValue() {
      if (this.type === 'all') {
        return ['all']
      } else {
        return this.selected
      }
    },
    resourceLower() {
      return this.resource.toLowerCase()
    }
  },
  mounted() {
    if (!this.value || this.value.length === 0) {
      return
    }
    if (this.value.indexOf('all') > -1) {
      this.type = 'all'
    } else {
      this.type = 'spec'
      this.selected = this.value
    }
  },
  methods: {
    onChangeEmit() {
      this.$emit('input', this.iValue)
    },
    handleTypeChange() {
      this.$emit('input', this.iValue)
    }
  }
}
</script>

<style scoped>

</style>
