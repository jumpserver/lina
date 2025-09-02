<template>
  <span class="search">
    <el-select
      v-if="showSearch"
      ref="searchInput"
      v-model="search"
      :loading="loading"
      :placeholder="$t('Search')"
      :remote-method="searchQuery"
      popper-class="global-search-popper"
      filterable
      remote
      reserve-keyword
      clearable
    >
      <el-option-group v-for="group in options" :key="group.label" :label="group.label">
        <el-option
          v-for="item in group.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <div class="option-content" @click="handleSearch(item)">
            <div class="label">{{ item.label }}</div>
            <div class="content">{{ item.content }}</div>
          </div>
        </el-option>
      </el-option-group>
    </el-select>

    <el-link @click="handleShowSearch">
      <i class="el-icon-search" />
    </el-link>
  </span>
</template>

<script>
import { toTitleCase } from '@/utils/common'

export default {
  name: 'Search',
  data() {
    return {
      search: '',
      showSearch: false,
      loading: false,
      options: []
    }
  },
  methods: {
    handleShowSearch() {
      this.showSearch = !this.showSearch

      if (this.showSearch) {
        this.$nextTick(() => {
          this.$refs.searchInput.focus()
        })
      }
    },
    async searchQuery(query) {
      if (query.length < 2) {
        this.options = []
        return
      }
      this.loading = true
      const url = '/api/v1/search/?q=' + query
      let options = []
      let res = []

      try {
        res = await this.$axios.get(url)
      } catch (error) {
        console.error(error)
        return
      } finally {
        this.loading = false
      }

      options = _.groupBy(res, 'model_label')
      options = Object.entries(options).map(([key, value]) => ({
        label: key,
        options: value.map(item => ({
          value: item.id,
          label: item.name,
          content: item.content?.replaceAll(';', ' '),
          ...item
        }))
      }))
      this.options = options
    },
    handleSearch(item) {
      const route = {}
      console.log(item)
      route['name'] = toTitleCase(item.model) + 'Detail'
      route['params'] = { id: item.id }
      this.$router.push(route)
    }
  }
}
</script>

<style scoped lang="scss">
.global-search-popper {
  .el-select-dropdown__item {
    height: 50px;

    .label {
      font-size: 14px;
      font-weight: 500;
      line-height: 25px;
    }

    .content {
      font-size: 12px;
      color: gray;
      font-weight: 300;
      line-height: 15px;
    }
  }
}

.search {
  width: 100%;
  height: 40px;

  .el-select {
    width: calc(100% - 38px);

    &:hover {
      background: var(--banner-bg);
    }

    ::v-deep {
      .el-select__input {
        color: #fff;
        margin-left: 10px;
      }

      .el-input__inner {
        background-color: rgba(0, 0, 0, 0.1);
        display: inline-block;
        border-radius: 1px;
        border: none;
        height: 28px;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }
  }

  .el-link {
    float: right;
    padding: 0 9px;

    &:hover {
      background: rgba(0, 0, 0, 12%);
    }
  }
}
</style>
