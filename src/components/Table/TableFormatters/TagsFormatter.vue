<template>
  <div>
    <a class="tag" @click="showDialog=true">
      <span v-if="!iTags || iTags.length === 0">
        <el-tag effect="plain" size="mini">
          <i class="fa fa-tag" /> -
        </el-tag>
      </span>
      <div v-else>
        <el-tag
          v-for="tag of iTags"
          :key="tag"
          :type="getTagType(tag)"
          class="tag-formatter"
          disable-transitions
          effect="plain"
          size="mini"
          v-bind="formatterArgs.config"
        >
          <i class="fa fa-tag" /> <b>{{ getTagKey(tag) }}</b>: {{ getTagValue(tag) }}
        </el-tag>
      </div>
    </a>
    <Dialog v-if="showDialog" :visible.sync="showDialog" title="Tags" width="600px" @confirm="handleConfirm">
      <el-row :gutter="1" class="tag-select">
        <el-col :span="12">
          <Select2 v-model="keySelect2.value" v-bind="keySelect2" @change="handleKeyChanged" />
        </el-col>
        <el-col :span="12">
          <Select2
            v-model="valueSelect2.value"
            :disabled="!keySelect2.value"
            style="margin-left: 10px"
            v-bind="valueSelect2"
            @change="handleAddTag"
          />
        </el-col>
      </el-row>
      <div class="tag-zone">
        <span v-if="!iTags || iTags.length === 0"> - </span>
        <div v-else>
          <el-tag
            v-for="tag of iTags"
            :key="tag"
            :type="getTagType(tag)"
            class="tag-formatter"
            closable
            disable-transitions
            effect="plain"
            size="small"
            v-bind="formatterArgs.config"
            @close="handleCloseTag(tag)"
          >
            <i class="fa fa-tag" /> <b>{{ getTagKey(tag) }}</b>: {{ getTagValue(tag) }}
          </el-tag>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import BaseFormatter from './base.vue'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import Dialog from '@/components/Dialog'

export default {
  name: 'TagsFormatter',
  components: { Select2, Dialog },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getTagType(tag) {
            return 'primary'
          },
          getTags(cellValue) {
            return cellValue
          },
          config: {}
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      initialTags: [],
      iTags: [],
      keySelect2: {
        url: '/api/v1/labels/labels/keys/',
        placeholder: '选择标签键或者创建新的',
        'allow-create': true,
        value: '',
        multiple: false
      },
      valueSelect2: {
        url: '/api/v1/labels/labels/?name=blank',
        placeholder: '选择标签值或者创建新的',
        'allow-create': true,
        value: '',
        multiple: false,
        ajax: {
          transformOption: (item) => {
            return { label: item.value, value: item.value }
          }
        }
      },
      showDialog: false
    }
  },
  computed: {
  },
  mounted() {
    this.iTags = this.formatterArgs.getTags(this.cellValue)
    this.initialTags = [...this.iTags]
  },
  methods: {
    getTagType(tag) {
      return this.formatterArgs.getTagType(tag)
    },
    handleCloseTag(tag) {
      this.iTags = this.iTags.filter(item => item !== tag)
    },
    handleKeyChanged(val) {
      this.valueSelect2.url = `/api/v1/labels/labels/?name=${val}`
    },
    getTagKey(tag) {
      return tag.split(':')[0]
    },
    getTagValue(tag) {
      return tag.split(':').slice(1).join(':')
    },
    handleAddTag() {
      const key = this.keySelect2.value
      const value = this.valueSelect2.value
      console.log('key: ', key, 'value: ', value)
      if (!key || !value) {
        return
      }
      const tag = `${key}:${value}`
      console.log('Tags: ', this.iTags)
      if (this.iTags.includes(tag)) {
        return
      }
      this.iTags.push(tag)
      this.keySelect2.value = ''
      this.valueSelect2.value = ''
      this.$emit('input', this.iTags)
    },
    handleConfirm() {
      const origin = _.sortBy(this.initialTags)
      const current = _.sortBy(this.iTags)
      if (_.isEqual(origin, current)) {
        console.log('No change: ', origin, current)
        return
      }
      const path = new URL(this.url, location.origin).pathname
      const url = `${path}${this.row.id}/`
      this.$axios.patch(url, { labels: this.iTags }).then(res => {
        this.$message.success('修改成功')
        this.showDialog = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tag {
  display: flex;
  flex-wrap: wrap;
  & > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.tag-select {
  >>> .el-input__inner::placeholder {
    font-size: 13px;
  }
}

.tag-zone {
  margin: 20px 0 0 0;
  border: solid 1px #ebeef5;
  padding: 10px;
  background: #f2f2f5;

  .tag-formatter {
    margin: 1px 3px;
    display: inline-block;
  }

  .el-tag {
    // background: inherit;
  }
}

.input-button .el-button.el-button--mini {
  padding: 5px;
  height: 28px;
  width: 28px;
  margin-top: 3px;
}

.tag-formatter {
  margin: 2px 0;
  display: block;
}
</style>
