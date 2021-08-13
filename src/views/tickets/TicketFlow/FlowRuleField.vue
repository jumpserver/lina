<template>
  <!-- 自定义组件 my-input -->
  <div>
    <div v-for="item of fields.slice(0, level)" :key="item.name" style="border: 1px solid red; margin-bottom: 10px">
      <p>{{ item.name }}</p>
      <el-radio-group v-model="item.radio" @change="() => item.hidden= item.radio !== 3 ">
        <el-radio :label="1">超级管理员</el-radio>
        <el-radio :label="2">超级管理员+组织用户</el-radio>
        <el-radio :label="3">自定义</el-radio>
      </el-radio-group>
      <br>
      <Select2 v-if="!item.hidden" v-bind="select2Option" />
    </div>
  </div>

</template>

<script>
import Select2 from '@/components/FormFields/Select2'

export default {
  components: {
    Select2
  },
  props: {
    value: [String, Array],
    level: Number
  },
  data() {
    return {
      select2Option: {
        url: '/api/v1/users/users/'
      },
      fields: [
        {
          name: 'first',
          radio: 2,
          select: ['1', '2'],
          hidden: false
        },
        {
          name: 'second',
          radio: 2,
          select: ['1', '2'],
          hidden: false
        }
      ]
    }
  },
  watch: {
    value(value) {
      this.$emit('customEvent', value, 'message')
    }
  },
  methods: {
    onInput(val) {
      this.$emit('input', 'my-input: ' + val)
    }
  }
}
</script>
