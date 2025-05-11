<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import falsedropdown from './FalseDropdown.vue';
import truedropdown from './TrueDropdown.vue';
import headmenu from './HeadMenu.vue';
import localforage from 'localforage'
import {
  loginsuccess, loginerror, loginfail,
  registersuccess, registerfail,
  logoutsuccess, logoutfail,
  changesuccess, changefail
} from '@/messages.ts';

const dialogFormVisible1 = ref(false)
const dialogFormVisible2 = ref(false)
const dialogFormVisible3 = ref(false)
const complete = ref(false)
const islogin = ref(false)
const formLabelWidth = '140px'
const registerform = ref(null)
const loginform = ref(null)
const changeform = ref(null)

// 定义 todo 项的接口
interface TodoItem {
  todohead: string;
  todocontent: string;
  tododdl: string;
  todostarttime: string;
  tododonetime: string;
}
// 定义开始时间列表数据接口
interface StartTime {
  todostarttime: string;
  timelist: TodoItem[]
}
// 定义完成时间列表数据接口
interface DoneTime {
  tododonetime: string;
  timelist: TodoItem[]
}
// 定义用户数据接口
interface UserData {
  password: string;
  avatar: string;
  name: string;
  todolist: StartTime[];
  donelist: DoneTime[];
}

// 带延迟的刷新函数
const reloaddelay = () => {
  setTimeout(() => {
    location.reload();
  }, 500);
};

//切换主页内容
const emit = defineEmits(['isscomplete'])
const iscomplete = (value: boolean) => {
  complete.value = value
  emit('isscomplete', complete.value)
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
const istologin = (value: boolean) => {
  dialogFormVisible1.value = value
}
const istoregister = (value: boolean) => {
  dialogFormVisible2.value = value
}
const changeuserdata = async () => {
  const usernumber = await localforage.getItem('user') as string
  if (usernumber) {
    try {
      const userdata = await localforage.getItem(usernumber) as UserData | null
      if (userdata) {
        form.value.number = usernumber
        form.value.password = userdata.password
        form.value.name = userdata.name
        form.value.avatar = userdata.avatar
      }
    }
    catch (error) {
      console.log("错误", error)
    }
  }
}
const istochange = (value: boolean) => {
  changeuserdata()
  dialogFormVisible3.value = value
}


//清空数据
const cancel = () => {
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
const register = async () => {
  const registerformvalid = await registerform.value.validate()
  if (registerformvalid) {
    const { number, password, name, avatar } = form.value
    const todolist: StartTime[] = [];
    const donelist: DoneTime[] = [];
    try {
      await localforage.setItem(number, { password, name, avatar, todolist, donelist })
      localforage.setItem('user', number)
      state.value.name = name
      state.value.avatar = avatar
      islogin.value = true
      registersuccess()
      dialogFormVisible2.value = false
      reloaddelay()
      cancel()
    } catch (error) {
      console.log("错误：", error)
      registerfail()
    }
  }
}

// 登录函数
const login = async () => {
  const loginformvalid = await loginform.value.validate()
  if (loginformvalid) {
    const { number, password } = form.value
    try {
      const userdata = await localforage.getItem(number) as UserData | null
      if (userdata && userdata.password === password) {
        localforage.setItem('user', number)
        state.value.avatar = userdata.avatar
        state.value.name = userdata.name
        islogin.value = true
        loginsuccess()
        dialogFormVisible1.value = false
        reloaddelay()
        cancel()
      } else {
        loginerror()
      }
    } catch (error) {
      console.log("错误：", error)
      loginfail()
    }
  }
}

// 退出登录
const logout = (value: boolean) => {
  if (value) {
    localforage.removeItem('user')
    logoutsuccess()
    reloaddelay()
  }
  else {
    logoutfail()
  }
}

//编辑资料函数
const change = async () => {
  const changeformvalid = await changeform.value.validate()
  if (changeformvalid) {
    const { number, password, name, avatar } = form.value
    const olddata = await localforage.getItem(number) as UserData
    const todolist: StartTime[] = olddata.todolist
    const donelist: DoneTime[] = olddata.donelist
    try {
      await localforage.setItem(number, { password, name, avatar, todolist, donelist })
      console.log("更改成功")
      localforage.setItem('user', number)
      state.value.name = name
      state.value.avatar = avatar
      changesuccess()
      dialogFormVisible3.value = false
      reloaddelay()
      cancel()
    } catch (error) {
      console.log("错误：", error)
      changefail()
    }
  }
}

// 获取用户信息
const getuserdata = async () => {
  const usernumber = await localforage.getItem('user') as string
  if (usernumber) {
    try {
      const userdata = await localforage.getItem(usernumber) as { name: string, avatar: string } | null
      if (userdata) {
        state.value.avatar = userdata.avatar
        state.value.name = userdata.name
        islogin.value = true
      }
    }
    catch (error) {
      console.log("错误", error)
    }
  }
}


onMounted(() => {
  getuserdata()
})

</script>

<template>
  <!-- logo -->
  <div class="logo">
    <span> TodoList</span>
  </div>

  <!-- 菜单 -->
  <component :is="headmenu" @iscomplete="iscomplete"></component>

  <!-- 头像昵称 -->
  <el-dropdown placement="bottom-end" trigger="click" size="large">
    <el-button class="state">
      <el-avatar :size="50" :src="state.avatar" />
      <h2>{{ state.name }}</h2>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <component :is="islogin ? truedropdown : falsedropdown" @istologin="istologin" @istoregister="istoregister"
          @istochange="istochange" @changelogin="istologin" @istologout="logout"></component>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 注册注册注册 -->
  <el-dialog v-model="dialogFormVisible2" title="注册账号：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule2" ref="registerform">
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
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="register">
          注册
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 登录登录登录 -->
  <el-dialog v-model="dialogFormVisible1" title="登入账号：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule1" ref="loginform">
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
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="login">
          登录
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑资料 -->
  <el-dialog v-model="dialogFormVisible3" title="编辑资料：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule3" ref="changeform">
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
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="change">
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
