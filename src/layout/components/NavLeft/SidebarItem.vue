<template>
  <div v-if="!needHidden(item) && (item.alwaysShow || !allChildrenHidden(item))">
    <template
      v-if="hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow"
    >
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :class="{'submenu-title-noDropdown':!isNest, 'level1-menu': !isNest}"
          :index="resolvePath(onlyOneChild.path)"
          class="submenu-item level2-menu"
        >
          <item
            :children="item.children"
            :icon="onlyOneChild.meta.icon||(item.meta && item.meta.icon)"
            :title="getItemTitle(onlyOneChild)"
          />
        </el-menu-item>
      </app-link>
    </template>

    <div v-else>
      <div v-if="item.meta.level === 2" class="group-title" style="font-size: 12px">
        <el-divider v-if="collapse" />
        <span v-else>{{ getItemTitle(item) }}</span>
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :base-path="resolvePath(child.path)"
          :is-nest="true"
          :item="child"
          class="nest-menu"
        />
      </div>
      <el-submenu
        v-else
        ref="subMenu"
        :index="resolvePath(item.path)"
        class="el-submenu-sidebar submenu-item level1-menu"
        popper-append-to-body
      >
        <template slot="title">
          <item v-if="item.meta" :children="item.children" :icon="item.meta && item.meta.icon" :title="getItemTitle(item)" />
        </template>
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :base-path="resolvePath(child.path)"
          :is-nest="true"
          :item="child"
          class="nest-menu"
        />
      </el-submenu>
    </div>
  </div>
</template>

<script>
import path from 'path-browserify'
import { isExternal } from '@/utils/secure'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'
import { toSentenceCase } from '@/utils/common/index'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    },
    collapse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {
    }
  },
  methods: {
    needHidden(item) {
      let hidden = item.hidden

      if (typeof item.hidden === 'function') {
        hidden = item.hidden()
      }
      return hidden
    },
    allChildrenHidden(item) {
      if (!item.children) {
        return false
      }
      for (const child of item.children) {
        if (!this.allChildrenHidden(child)) {
          return false
        }
      }
      return true
    },
    getItemTitle(item) {
      let title = item.meta.menuTitle || item.meta.title
      if (item.meta.level === 2 && item.children) {
        title = title.toUpperCase()
      } else {
        title = toSentenceCase(title)
      }
      return title
    },
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
