<template>
  <span class="search">
    <el-select
      v-if="showSearch"
      v-model="search"
      :loading="loading"
      :placeholder="$t('Search')"
      :remote-method="searchQuery"
      filterable
      multiple
      remote
      reserve-keyword
    >
      <el-option-group v-for="group in options" :key="group.label" :label="group.label">
        <el-option
          v-for="item in group.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <div>{{ item.label }}</div>
          <div class="content">{{ item.content }}</div>
        </el-option>
      </el-option-group>
    </el-select>

    <el-link @click="showSearch = !showSearch">
      <i class="el-icon-search" />
    </el-link>
  </span>
</template>

<script>
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
    searchQuery(query) {
      if (query.length < 2) {
        this.options = []
        return
      }
      this.loading = true
      const url = '/api/v1/search/?q=' + query
      let options = []
      this.$axios.get(url).then(res => {
        options = _.groupBy(res, 'model_label')
        options = Object.entries(options).map(([key, value]) => ({
          label: key,
          options: value.map(item => ({
            value: item.id,
            label: item.name,
            content: item.content
          }))
        }))
        this.options = options
      })
        .finally(() => {
          this.loading = false
        })
    }, handleSearch(item) {
      this.search = item.value
    }
  }
}
</script>

<style scoped>
  .search {
    width: 100%;
    height: 40px;

    .el-select {
      width: calc(100% - 26px);

      .el-select__input {
        color: #fff;
      }

      .el-input__inner {
        background-color: rgba(0, 0, 0, 0.1);
        display: inline-block;
        border-radius: 5px;
        height: 30px;
        border: none;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
      }

      ::v-deep {
        .el-select-dropdown__item {
          height: 50px;
        }

        .content {
          font-size: 12px;
          color: gray;
        }
      }
    }

    .el-link {
      float: right;
    }
  }
</style>
