<template>
  <Dialog
    v-if="detailVisible"
    v-model:visible="detailVisible"
    :modal="false"
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
  >
    <div>
      <div v-if="isEmpty()" style="text-align: center">
        {{ $tc('NoContent') }}
      </div>
      <div v-else>
        <el-table :data="diff" class="diffTable">
          <el-table-column
            :label="$tc('ChangeField')"
            :prop="fieldName"
            show-overflow-tooltip
            width="150"
          >
            <template #default="{ row }">
              {{ translateFieldName(row[fieldName]) }}
            </template>
          </el-table-column>
          <el-table-column :label="$tc('BeforeChange')" :prop="leftKeyName" show-overflow-tooltip />
          <el-table-column :label="$tc('AfterChange')" :prop="rightKeyName" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index'

const FIELD_I18N_KEYS = {
  'creation date': 'DateCreated',
  'expiration date': 'DateExpired',
  'from work order': 'FromTicket',
  'last updated by': 'LastUpdatedBy',
  'start date': 'DateStart'
}

export default {
  name: 'DiffDetail',
  components: {
    Dialog
  },
  props: {
    title: {
      type: String,
      default: () => ''
    },
    fieldName: {
      type: String,
      default: () => 'field'
    },
    leftKeyName: {
      type: String,
      default: () => 'before'
    },
    rightKeyName: {
      type: String,
      default: () => 'after'
    }
  },
  data() {
    return {
      diff: [],
      detailVisible: false
    }
  },
  methods: {
    isEmpty() {
      const content = this.diff
      return !content || JSON.stringify(content) === '{}'
    },
    translateFieldName(field) {
      if (typeof field !== 'string') {
        return field
      }
      const key = FIELD_I18N_KEYS[field.trim().toLowerCase()]
      return key ? this.$t(key) : field
    },
    show(data) {
      this.diff = data
      this.detailVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  width: 100%;
  white-space: normal;
  height: auto;
}

.el-table::before {
  background-color: inherit;
}

.diffTable {
  width: 100%;
  max-height: 80vh;

  & :deep(td) {
    padding: 5px 0 !important;
  }
}
</style>
