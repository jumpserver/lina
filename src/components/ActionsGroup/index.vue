<template>
  <div :class="grouped ? 'el-button-group' : ''">
    <el-button v-for="item in actions" :key="item.name" :type="item.type" :size="size" :icon="item.icon" @click="handleClick(item.name)">{{ item.title }}</el-button>
    <el-dropdown v-if="moreActions.length > 0">
      <el-button :size="size" class="btn-more-actions">
        更多操作<i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in moreActions" :key="item.name" :icon="item.icon" @click="handleClick(item.name)">{{ item.title }} </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'ActionsGroup',
  props: {
    grouped: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'small'
    },
    type: {
      type: String,
      default: ''
    },
    actions: {
      type: Array,
      default: () => []
    },
    moreActions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClick(item) {
      this.$emit('clickAction', item)
    }
  }

}
</script>

<style scoped>

</style>
