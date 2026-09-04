<template>
  <span :class="['assistant-mark', `assistant-mark--${size}`, { 'is-active': active }]">
    <span class="assistant-mark__core">
      <img :src="assistantIcon" alt="" draggable="false" />
    </span>
  </span>
</template>

<script setup>
import { getAssetUrl } from '@/utils/assets'

defineProps({
  active: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium'
  }
})

const assistantIcon = getAssetUrl('img/ai-assistant.svg')
</script>

<style lang="scss" scoped>
.assistant-mark {
  --mark-size: 34px;
  position: relative;
  display: inline-flex;
  width: var(--mark-size);
  height: var(--mark-size);
  flex: 0 0 var(--mark-size);
  align-items: center;
  justify-content: center;

  &--small {
    --mark-size: 26px;
  }

  &--large {
    --mark-size: 56px;
  }

  &__core {
    position: relative;
    z-index: 1;
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    filter: drop-shadow(0 4px 6px rgb(20 143 118 / 17%));
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  &.is-active {
    .assistant-mark__core {
      animation: mark-pulse 1.6s ease-in-out infinite;
    }
  }
}

@keyframes mark-pulse {
  50% {
    filter: drop-shadow(0 6px 10px rgb(20 143 118 / 34%));
    transform: scale(1.03);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-mark * {
    animation: none !important;
  }
}
</style>
