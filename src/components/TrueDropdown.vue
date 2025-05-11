<script lang="ts" setup>
import { ref } from 'vue'

const change = ref(false)
const login = ref(false)
const logout = ref(false)
const emit = defineEmits(['istochange', 'changelogin', 'istologout'])

const tochange = () => {
  change.value = true
  emit('istochange', change.value)
}

const tologin = () => {
  login.value = true
  emit('changelogin', login.value)
}

const tologout = () => {
  logout.value = true
  emit('istologout', logout.value)
}

</script>

<template>
  <el-dropdown-item @click="tochange">编辑资料</el-dropdown-item>
  <el-dropdown-item @click="tologin">切换账号</el-dropdown-item>
  <el-dropdown-item style="color: red;" @click="tologout">退出登录</el-dropdown-item>
</template>
