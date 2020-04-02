<template>
  <div :class="grouped ? 'el-button-group' : ''">
    <el-button v-for="item in primaryActions" :key="item.name" :size="size" v-bind="item" @click="handleClick(item.name)">
      <i v-if="item.fa" :class="'fa ' + item.fa"></i>
      {{ item.title }}
    </el-button>
    <el-dropdown v-if="moreActions.length > 0" trigger="click" @command="handleClick">
      <el-button :size="size" class="btn-more-actions">
        {{ this.$tc('More actions') }}<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="item in moreActions" :key="item.name" :command="item.name" v-bind="item" @click="handleClick(item.name)">{{ item.title }} </el-dropdown-item>
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
      default: false
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
    primaryShowSize: {
      type: Number,
      default: 2
    },
  },
  data() {
  },
  computed: {
    primaryActions() {
      return this.actions.slice(0, this.primaryShowSize - 1)
    },
    moreActions() {
      return this.actions.slice(this.primaryShowSize - 1, this.action.length)
    }
  },
  methods: {
    handleClick(item) {
      this.$emit('actionClick', item)
    }
  }

}
</script>

<style scoped>

</style>
