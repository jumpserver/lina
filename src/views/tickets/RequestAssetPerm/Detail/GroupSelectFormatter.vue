<template>
  <el-select v-model="value" v-bind="$attrs" class="select2" v-on="$listeners">
    <el-option-group
      v-for="group in options"
      :key="group.org_name"
      :label="group.org_name"
    >
      <el-option
        v-for="item in group.org_admins"
        :key="item.id"
        :label="item.name + '(' + item.username + ')'"
        :value="item.id"
      />
    </el-option-group>
  </el-select>
</template>

<script>
export default {
  name: 'GroupSelectFormatter',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: '',
      options: []
    }
  },
  created() {
    this.$axios.get(this.url).then(
      res => {
        this.options = res
      }
    )
  }
}
</script>

<style scoped>
  .select2 {
    width: 100%;
  }
</style>
