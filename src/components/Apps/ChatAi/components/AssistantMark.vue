<template>
  <span :class="['assistant-mark', `assistant-mark--${size}`, { 'is-active': active }]">
    <span class="assistant-mark__core">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path
          d="M14 3.5c.6 5.9 4.6 9.9 10.5 10.5-5.9.6-9.9 4.6-10.5 10.5C13.4 18.6 9.4 14.6 3.5 14 9.4 13.4 13.4 9.4 14 3.5Z"
        />
        <circle cx="21.5" cy="6.5" r="2.2" />
      </svg>
    </span>
  </span>
</template>

<script setup>
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
</script>

<style lang="scss" scoped>
.assistant-mark {
  --mark-size: 38px;
  position: relative;
  display: inline-flex;
  width: var(--mark-size);
  height: var(--mark-size);
  flex: 0 0 var(--mark-size);
  align-items: center;
  justify-content: center;

  &--small {
    --mark-size: 28px;
  }

  &--large {
    --mark-size: 64px;
  }

  &__core {
    position: relative;
    z-index: 1;
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    border-radius: 4px;
    color: #fff;
    background: var(--el-color-primary, #1ab394);
  }

  svg {
    width: 58%;
    height: 58%;
    fill: currentColor;
  }

  &.is-active {
    .assistant-mark__core {
      animation: mark-pulse 1.6s ease-in-out infinite;
    }
  }
}

@keyframes mark-pulse {
  50% {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-mark * {
    animation: none !important;
  }
}
</style>
