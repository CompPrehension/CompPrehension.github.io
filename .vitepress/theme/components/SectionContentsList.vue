<script setup lang="ts">
import { withBase, type DefaultTheme } from 'vitepress'

defineProps<{ items: DefaultTheme.SidebarItem[] }>()
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.link ?? `${item.text}-${index}`">
      <a v-if="item.link" :href="withBase(item.link)" :target="item.target" :rel="item.rel">
        {{ item.text }}
      </a>
      <span v-else>{{ item.text }}</span>
      <SectionContentsList v-if="item.items?.length" :items="item.items" />
    </li>
  </ul>
</template>
