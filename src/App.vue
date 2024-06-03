<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import CodeEditor from './components/CodeEditor.vue'
</script>

<template>
  <div class="bg-underwater-blue text-light h-screen flex flex-col">
    <nav-bar />
    <div class="flex flex-1 border border-gleam overflow-hidden">
      <code-editor />
    </div>
  </div>
</template>
