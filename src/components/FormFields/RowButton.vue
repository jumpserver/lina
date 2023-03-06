<template>
  <div>
    <div v-for="(item, i) in rows" :key="i">
      <el-row>
        <el-col :span="10">
          {{ item.display_name }}
        </el-col>
        <el-col :span="10">
          {{ item.help_text }}
        </el-col>
        <el-col :span="4">
          <el-button
            :type="item.btn_type"
            size="mini"
            :disabled="!item.can_disabled"
            @click="onClick(item.to)"
          >
            {{ item.btn_title }}
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RowButton',
  props: {
    rows: {
      type: Array,
      default: () => ([])
    },
    onClick: {
      type: Function,
      default: function(to) {
        if (typeof to === 'function') {
          to()
        } else {
          this.$router.push(to)
        }
      }
    },
    btnTitle: {
      type: String,
      default: ''
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
