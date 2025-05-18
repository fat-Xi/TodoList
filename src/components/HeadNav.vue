<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import FalseDropdown from './FalseDropdown.vue';
import TrueDropdown from './TrueDropdown.vue';
import HeadMenu from './HeadMenu.vue';
import {
  loginSuccess, loginError, loginFail,
  registerSuccess, registerFail,
  logoutSuccess, logoutFail,
  changeSuccess, changeFail
} from '@/messages.ts';
import localforage from 'localforage'

const dialogFormVisible1 = ref(false)
const dialogFormVisible2 = ref(false)
const dialogFormVisible3 = ref(false)
const complete = ref(false)
const isLogin = ref(false)
const formLabelWidth = '140px'    //！！！！！待调整
const registerForm = ref(null)
const loginForm = ref(null)
const changeForm = ref(null)

// 定义 todo 项的接口
interface TodoItem {
  todoHead: string;
  todoContent: string;
  todoDdl: string;
  todoStartTime: string;
  todoDoneTime: string;
}
// 定义开始时间列表数据接口
interface StartTime {
  startTime: string;
  itemList: TodoItem[]
}
// 定义完成时间列表数据接口
interface DoneTime {
  doneTime: string;
  itemList: TodoItem[]
}
// 定义用户数据接口
interface UserData {
  password: string;
  avatar: string;
  name: string;
  todoList: StartTime[];
  doneList: DoneTime[];
}

// 带延迟的刷新函数
const reloadDelay = () => {
  setTimeout(() => {
    location.reload();
  }, 500);
};

//切换主页内容
const emit = defineEmits(['isComplete'])
const isComplete = (value: boolean) => {
  complete.value = value
  emit('isComplete', complete.value)
}

// 表单数据
const form = ref({
  number: '',
  password: '',
  name: '',
  avatar: ''
})

// 导航栏头像名称数据
const state = ref({
  name: '登录/注册',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
})

// 检验规则
const rule1 = {
  number: { required: true, message: "账号不能为空", trigger: "blur" },
  password: { required: true, message: "密码不能为空", trigger: "blur" }
}
const rule2 = {
  number: [
    { required: true, message: "账号不能为空", trigger: "blur" },
    { min: 3, max: 10, message: "账号长度为3-10位", trigger: "blur" }
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 5, max: 12, message: "密码长度为5-12位", trigger: "blur" }
  ],
  name: [
    { required: true, message: "昵称不能为空", trigger: "blur" },
    { min: 1, max: 6, message: "长度不能超过6个字符", trigger: "blur" }
  ]
}
const rule3 = {
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 5, max: 12, message: "密码长度为5-12位", trigger: "blur" }
  ],
  name: [
    { required: true, message: "昵称不能为空", trigger: "blur" },
    { min: 1, max: 6, message: "长度不能超过6个字符", trigger: "blur" }
  ]
}

//打开登录-注册-编辑资料窗口
const istoLogin = (value: boolean) => {
  dialogFormVisible1.value = value
}
const istoRegister = (value: boolean) => {
  dialogFormVisible2.value = value
}
const changeUserdata = async () => {
  const userNumber = await localforage.getItem('user') as string
  if (userNumber) {
    try {
      const userData = await localforage.getItem(userNumber) as UserData | null
      if (userData) {
        form.value.number = userNumber
        form.value.password = userData.password
        form.value.name = userData.name
        form.value.avatar = userData.avatar
      }
    }
    catch (error) {
      console.log("错误", error)
    }
  }
}
const istoChange = (value: boolean) => {
  changeUserdata()
  dialogFormVisible3.value = value
}


//清空数据
const Cancel = () => {
  form.value.number = ''
  form.value.password = ''
  form.value.name = ''
  form.value.avatar = ''
  dialogFormVisible1.value = false
  dialogFormVisible2.value = false
}

//访问本地文件
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.avatar = e.target.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 注册函数
const Register = async () => {
  const registerFormValid = await registerForm.value.validate()
  if (registerFormValid) {
    const { number, password, name, avatar } = form.value
    const todoList: StartTime[] = [];
    const doneList: DoneTime[] = [];
    try {
      await localforage.setItem(number, { password, name, avatar, todoList, doneList })
      localforage.setItem('user', number)
      state.value.name = name
      state.value.avatar = avatar
      isLogin.value = true
      registerSuccess()
      dialogFormVisible2.value = false
      reloadDelay()
      Cancel()
    } catch (error) {
      console.log("错误：", error)
      registerFail()
    }
  }
}

// 登录函数
const Login = async () => {
  const loginFormValid = await loginForm.value.validate()
  if (loginFormValid) {
    const { number, password } = form.value
    try {
      const userData = await localforage.getItem(number) as UserData | null
      if (userData && userData.password === password) {
        localforage.setItem('user', number)
        state.value.avatar = userData.avatar
        state.value.name = userData.name
        isLogin.value = true
        loginSuccess()
        dialogFormVisible1.value = false
        reloadDelay()
        Cancel()
      } else {
        loginError()
      }
    } catch (error) {
      console.log("错误：", error)
      loginFail()
    }
  }
}

// 退出登录
const Logout = (value: boolean) => {
  if (value) {
    localforage.removeItem('user')
    logoutSuccess()
    reloadDelay()
  }
  else {
    logoutFail()
  }
}

//编辑资料函数
const Change = async () => {
  const changeFormValid = await changeForm.value.validate()
  if (changeFormValid) {
    const { number, password, name, avatar } = form.value
    const oldData = await localforage.getItem(number) as UserData
    const todoList: StartTime[] = oldData.todoList
    const doneList: DoneTime[] = oldData.doneList
    try {
      await localforage.setItem(number, { password, name, avatar, todoList, doneList })
      console.log("更改成功")
      localforage.setItem('user', number)
      state.value.name = name
      state.value.avatar = avatar
      changeSuccess()
      dialogFormVisible3.value = false
      reloadDelay()
      Cancel()
    } catch (error) {
      console.log("错误：", error)
      changeFail()
    }
  }
}

// 获取用户信息
const getUserdata = async () => {
  const userNumber = await localforage.getItem('user') as string
  if (userNumber) {
    try {
      const userData = await localforage.getItem(userNumber) as { name: string, avatar: string } | null
      if (userData) {
        state.value.avatar = userData.avatar
        state.value.name = userData.name
        isLogin.value = true
      }
    }
    catch (error) {
      console.log("错误", error)
    }
  }
}


onMounted(() => {
  getUserdata()
})

</script>

<template>
  <!-- logo -->
  <div class="logo">
    <span> TodoList</span>
  </div>

  <!-- 菜单 -->
  <component :is="HeadMenu" @isComplete="isComplete"></component>

  <!-- 头像昵称 -->
  <el-dropdown placement="bottom-end" trigger="click" size="large">
    <el-button class="state">
      <el-avatar :size="50" :src="state.avatar" />
      <h2>{{ state.name }}</h2>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <component :is="isLogin ? TrueDropdown : FalseDropdown" @istoLogin="istoLogin" @istoRegister="istoRegister"
          @istoChange="istoChange" @changeLogin="istoLogin" @istoLogout="Logout"></component>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 注册注册注册 -->
  <el-dialog v-model="dialogFormVisible2" title="注册账号：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule2" ref="registerForm">
      <el-form-item label="账号:" :label-width="formLabelWidth" prop="number">
        <el-input v-model="form.number" autocomplete="off" placeholder="请注册账号" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="密码:" :label-width="formLabelWidth" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请注册密码" autocomplete="off" show-password
          style="width: 300px;" />
      </el-form-item>
      <el-form-item label="昵称:" :label-width="formLabelWidth" prop="name">
        <el-input v-model="form.name" autocomplete="off" placeholder="请注册昵称" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="头像" :label-width="formLabelWidth">
        <el-button @click="$refs.fileInput.click()" class="drawer-choose">选择本地文件</el-button>
        <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
        <img v-if="form.avatar" :src="form.avatar" alt="选择的头像"
          style="max-width: 50px; margin-top: 10px;  margin-left:10px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="Cancel">取消</el-button>
        <el-button type="primary" @click="Register">
          注册
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 登录登录登录 -->
  <el-dialog v-model="dialogFormVisible1" title="登入账号：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule1" ref="loginForm">
      <el-form-item label="账号:" :label-width="formLabelWidth" prop="number">
        <el-input v-model="form.number" autocomplete="off" placeholder="请输入账号" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="密码:" :label-width="formLabelWidth" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="off" show-password
          style="width: 300px;" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="Cancel">取消</el-button>
        <el-button type="primary" @click="Login">
          登录
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑资料 -->
  <el-dialog v-model="dialogFormVisible3" title="编辑资料：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule3" ref="changeForm">
      <el-form-item label="账号:" :label-width="formLabelWidth" prop="number">
        <el-input v-model="form.number" autocomplete="off" disabled style="width: 300px;" />
      </el-form-item>
      <el-form-item label="密码:" :label-width="formLabelWidth" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请修改密码" autocomplete="off" show-password
          style="width: 300px;" />
      </el-form-item>
      <el-form-item label="昵称:" :label-width="formLabelWidth" prop="name">
        <el-input v-model="form.name" autocomplete="off" placeholder="请修改昵称" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="头像" :label-width="formLabelWidth">
        <el-button @click="$refs.fileInput.click()" class="drawer-choose">选择本地文件</el-button>
        <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
        <img v-if="form.avatar" :src="form.avatar" alt="选择的头像"
          style="max-width: 50px; margin-top: 10px;  margin-left:10px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="Cancel">取消</el-button>
        <el-button type="primary" @click="Change">
          修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
@font-face {
  font-family: 'icomoon';
  src: url('fonts/icomoon.eot?1ddoxy');
  src: url('fonts/icomoon.eot?1ddoxy#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?1ddoxy') format('truetype'),
    url('fonts/icomoon.woff?1ddoxy') format('woff'),
    url('fonts/icomoon.svg?1ddoxy#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.logo {
  display: flex;
  justify-content: center;
  height: 70px;
  line-height: 70px;
  margin-left: 20px;
  border-radius: 15px;
  padding: 0 20px 0 20px;
  font-weight: 500;
  background-color: white;
  color: rgb(100, 145, 240);
  overflow: hidden;
  white-space: nowrap;
  cursor: default
}

.logo>span {
  font-family: 'icomoon';
  font-size: 32px;
  cursor: default
}

.state {
  height: 70px;
  margin-right: 40px;
  padding: 20px;
  border: 0px;
  border-radius: 15px;
  background-color: white;
  color: rgb(100, 145, 240);
  overflow: hidden;
  white-space: nowrap;
  cursor: default
}

.state:hover {
  background-color: white;
  color: rgb(100, 145, 240);
}

.state h2 {
  margin-left: 15px;
}

.el-button:focus-visible {
  outline: 0px;
  outline-offset: 0px;
  transition: outline-offset 0s, outline 0s;
}
</style>
