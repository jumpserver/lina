<template>
  <div class="label-container">
    <a class="label-formatter-col">
      <span v-if="!iLabels || iLabels.length === 0" style="vertical-align: top;">
        -
      </span>
      <div v-else>
        <div
          v-for="label of iLabels"
          :key="label.id"
        >
          <ILabel
            :el="formatterArgs.config"
            :label="label"
            class="tag-formatter"
            @click="handleLabelSearch(label)"
          />
        </div>
      </div>
    </a>
    <a
      v-if="formatterArgs.showEditBtn"
      class="edit-btn"
      style="padding-left: 5px"
      @click="showDialog = true"
    >
      <i class="fa fa-edit" />
    </a>
    <Dialog
      v-if="showDialog"
      :title="$tc('BindLabel')"
      :visible.sync="showDialog"
      width="600px"
      @cancel="handleCancel"
      @confirm="handleConfirm"
    >
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
            @change="handleAddLabel"
          />
        </el-col>
      </el-row>
      <div class="tag-zone">
        <span v-if="!iLabels || iLabels.length === 0"> - </span>
        <div v-else>
          <ILabel
            v-for="label of iLabels"
            :key="label.id"
            :el="formatterArgs.config"
            :label="label"
            class="tag-formatter"
            @close="handleCloseTag(label)"
          />
        </div>
        <div class="tag-tip">
          <el-link @click="goToLabelList">
            {{ $t('LabelList') }} <i class="fa fa-external-link" />
          </el-link>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import BaseFormatter from './base.vue'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import Dialog from '@/components/Dialog'
import ILabel from '@/components/Widgets/ILabel'

export default {
  name: 'LabelsFormatter',
  components: { Select2, Dialog, ILabel },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getLabelType(label) {
            return 'primary'
          },
          getLabels(cellValue) {
            return cellValue
          },
          config: {},
          showEditBtn: true
        }
      }
    }
  },
  data() {
    return {
      focusOn: '',
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      initial: [],
      iLabels: [],
      keySelect2: {
        url: '/api/v1/labels/labels/keys/',
        placeholder: this.$t('SelectKeyOrCreateNew'),
        // placeholder: this.$t('选择标签键或者创建新的'),
        allowCreate: true,
        value: '',
        multiple: false
      },
      valueSelect2: {
        url: '/api/v1/labels/labels/?name=blank',
        placeholder: this.$t('SelectValueOrCreateNew'),
        // placeholder: '选择标签值或者创建新的',
        allowCreate: true,
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
  computed: {},
  mounted() {
    this.initial = this.formatterArgs.getLabels(this.cellValue)
    this.iLabels = [...this.initial]
  },
  methods: {
    handleLabelSearch(label) {
      this.$eventBus.$emit('labelSearch', label)
    },
    getLabelType(tag) {
      return this.formatterArgs.getLabelType(tag)
    },
    handleCloseTag(tag) {
      this.iLabels = this.iLabels.filter(item => item !== tag)
    },
    handleKeyChanged(val) {
      this.valueSelect2.url = `/api/v1/labels/labels/?name=${val}`
    },
    getKey(tag) {
      if (typeof tag === 'string') {
        return tag.split(':')[0]
      } else {
        return tag.name
      }
    },
    handleAddLabel() {
      const key = this.keySelect2.value
      const value = this.valueSelect2.value
      if (!key || !value) {
        return
      }
      const tag = `${key}:${value}`
      if (this.iLabels.includes(tag)) {
        return
      }
      this.iLabels.push(tag)
      this.keySelect2.value = ''
      this.valueSelect2.value = ''
      this.$emit('input', this.iLabels)
    },
    handleCancel() {
      this.showDialog = false
    },
    handleConfirm() {
      const origin = _.sortBy(this.initial)
      const current = _.sortBy(this.iLabels)
      if (_.isEqual(origin, current)) {
        return
      }
      const path = new URL(this.url, location.origin).pathname
      const url = `${path}${this.row.id}/`
      this.$axios.patch(url, { labels: this.iLabels }).then(res => {
        this.$message.success(this.$tc('UpdateSuccess'))
        this.showDialog = false
      })
    },
    goToLabelList() {
      this.$router.push({ name: 'LabelList' })
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
  ::v-deep .el-input__inner::placeholder {
    font-size: 13px;
  }
}

.edit-btn {
  visibility: hidden;
  position: relative;
  transition: all 1s;

  & > i {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
}

.label-container {
  display: flex;

  .label-formatter-col {
    overflow: hidden;
  }

  &:hover {
    .edit-btn {
      visibility: visible;
    }
  }

  .tag-formatter {
    line-height: 16px;
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
}

.input-button .el-button.el-button--mini {
  padding: 5px;
  height: 28px;
  width: 28px;
  margin-top: 3px;
}

.tag-formatter {
  margin: 2px 0;

}

.tag-tip {
  margin-top: 10px;
}
</style>
