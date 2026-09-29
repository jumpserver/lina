<template>
  <div class="workflow-member-select">
    <div class="member-label">{{ label }}</div>
    <div v-if="!choosing" class="member-selection">
      <div v-if="selectedMember" class="selected-member">
        <el-icon class="selected-icon"><User /></el-icon>
        <div class="member-identity">
          <span class="member-name">{{ selectedMember.name || selectedMember.username }}</span>
          <span class="member-username">{{ selectedMember.username }}</span>
        </div>
        <el-button ref="chooseButton" link type="primary" :disabled="disabled" @click="choose">
          {{ $t('WFReselectMember') }}
        </el-button>
      </div>
      <el-button
        v-else
        ref="chooseButton"
        class="choose-member"
        :disabled="disabled"
        @click="choose"
      >
        <el-icon><Plus /></el-icon>{{ $t('WFChooseMember') }}
      </el-button>
    </div>
    <template v-else>
      <el-input
        ref="searchInput"
        v-model="search"
        :placeholder="$t('WFSelectMember')"
        :aria-label="$t('WFSelectMember')"
        :disabled="disabled"
        maxlength="128"
        prefix-icon="Search"
        size="default"
        clearable
        @input="reset(250)"
      />
      <div class="member-list" :aria-busy="loading">
        <ul class="member-options" :aria-label="label">
          <li v-for="user in members" :key="user.id">
            <button type="button" class="member-row" :disabled="disabled" @click="select(user.id)">
              <span class="member-identity">
                <span class="member-name">{{ user.name || user.username }}</span>
                <span class="member-username">{{ user.username }}</span>
              </span>
              <el-icon><Plus /></el-icon>
            </button>
          </li>
        </ul>
        <div v-if="loading || error || !members.length" class="member-status" role="status">
          <template v-if="loading">{{ $t('Loading') }}</template>
          <template v-else-if="error">
            <span>{{ $t('WFMembersLoadFailed') }}</span>
            <el-button link type="primary" :disabled="disabled" @click="load">
              {{ $t('Retry') }}
            </el-button>
          </template>
          <template v-else>{{ $t('WFNoMatchingMembers') }}</template>
        </div>
        <el-button
          v-else-if="hasMore"
          class="member-more"
          link
          type="primary"
          :disabled="disabled"
          @click="load"
        >
          {{ $t('WFLoadMoreMembers') }}
        </el-button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: { type: String, default: null },
    url: { type: String, required: true },
    label: { type: String, required: true },
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  data: () => ({
    search: '',
    choosing: false,
    members: [],
    loading: false,
    error: false,
    hasMore: false,
    request: 0,
    timer: null
  }),
  computed: {
    selectedMember() {
      return this.members.find((user) => user.id === this.modelValue)
    }
  },
  watch: {
    url: {
      immediate: true,
      handler() {
        this.search = ''
        this.reset()
      }
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer)
    this.request++
  },
  methods: {
    choose() {
      if (this.disabled) return
      this.$emit('update:modelValue', null)
      this.choosing = true
      this.$nextTick(() => this.$refs.searchInput?.focus())
    },
    select(id) {
      if (this.disabled) return
      this.$emit('update:modelValue', id)
      this.choosing = false
      this.$nextTick(() => this.$refs.chooseButton?.$el.focus())
    },
    reset(delay = 0) {
      clearTimeout(this.timer)
      this.request++
      this.members = []
      this.error = false
      this.hasMore = false
      this.loading = true
      this.$emit('update:modelValue', null)
      if (delay) this.timer = setTimeout(() => this.load(), delay)
      else return this.load()
    },
    async load() {
      const request = ++this.request
      this.loading = true
      this.error = false
      try {
        const result = await this.$axios.get(this.url, {
          params: { search: this.search.trim(), limit: 20, offset: this.members.length }
        })
        if (request !== this.request) return
        this.members.push(...result.results)
        this.hasMore = Boolean(result.next)
      } catch {
        if (request === this.request) this.error = true
      } finally {
        if (request === this.request) this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.member-label {
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.member-label::before {
  content: '*';
  margin-right: 4px;
  color: var(--el-color-danger);
}
.choose-member {
  height: 48px;
  gap: 8px;
  border-style: dashed;
}
.selected-member {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}
.selected-icon {
  font-size: 22px;
  color: var(--el-text-color-regular);
}
.member-identity {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.member-list {
  max-height: min(220px, 30vh);
  min-height: 80px;
  margin-top: 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}
.member-options {
  margin: 0;
  padding: 0;
  list-style: none;
}
.member-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 64px;
  padding: 12px 8px;
  border: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: transparent;
  color: var(--el-text-color-primary);
  font: inherit;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
}
.member-row:hover:not(:disabled) {
  background: var(--el-fill-color-light);
}
.member-row:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.member-row:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: -2px;
}
.member-name,
.member-username {
  display: block;
}
.member-name {
  font-size: 14px;
}
.member-username {
  margin-top: 2px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.member-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 100px;
  color: var(--el-text-color-regular);
}
.member-more {
  width: 100%;
  margin: 16px 0;
}
</style>
