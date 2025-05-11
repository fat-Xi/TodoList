<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import localforage from 'localforage'
import { donesuccess } from '@/messages.ts'

const timelists = ref<StartTime[]>([])
const groupedTimelists = ref<{ [date: string]: TodoItem[] }>({})
const formLabelWidth = '140px'
const addform = ref(null)
const dialogFormVisible = ref(false)
const dialogVisible = ref(false)
const deletecontent = ref()
const deletestarttime = ref()



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
  itemlist: TodoItem[]
}

// 定义完成时间列表数据接口
interface DoneTime {
  tododonetime: string;
  itemlist: TodoItem[]
}

// 定义用户数据接口
interface UserData {
  password: string;
  avatar: string;
  name: string;
  todolist: StartTime[];
  donelist: DoneTime[];
}

//表单数据
const form = ref({
  todohead: '',
  todocontent: '',
  todostarttime: '',
  tododdl: ''
})

// 检验规则
const validddl = (rule, value, callback) => {
  const startDate = form.value.todostarttime;
  const start = new Date(startDate);
  const end = new Date(value);
  const now = new Date()
  if (startDate && value) {
    if (end < start) {
      callback('截止日期必须大于开始日期');
    }
    else if (end < now) {
      callback('截止日期必须大于当前日期')
    }
    else {
      callback()
    }
  }
  else {
    callback()
  }
}
const rule1 = {
  todohead: [
    { required: true, message: "主题不能为空", trigger: "blur" },
    { min: 1, max: 8, message: "长度为<=8位", trigger: "blur" }
  ],
  todocontent: [{ required: true, message: "内容不能为空", trigger: "blur" }],
  todostarttime: [{ required: true, message: "日期不能为空", trigger: "blur" }],
  tododdl: [{ required: true, message: "日期不能为空", trigger: "blur" },
  { validator: validddl, trigger: 'blur' }
  ],
}

// 点击+号函数
const add = () => {
  dialogFormVisible.value = true
}

// 添加代办函数
const addlist = async () => {
  const addformvalid = await addform.value.validate();
  if (addformvalid) {
    const { todohead, todocontent, todostarttime, tododdl } = form.value;
    try {
      const usernumber = await localforage.getItem('user') as string;
      if (usernumber) {
        const olddata = await localforage.getItem(usernumber) as UserData;
        // 格式化开始日期和截止日期
        const formattedStartDate = formatDate(todostarttime);
        const formattedDdl = formatDate(tododdl);
        // 创建新的代办事项，使用格式化后的日期
        const newTodo: TodoItem = {
          todohead,
          todocontent,
          tododdl: formattedDdl,
          todostarttime: formattedStartDate,
          tododonetime: ''
        };
        // 查找是否已存在该日期的分组，使用格式化后的日期进行比较
        const startTimeIndex = olddata.todolist.findIndex(
          item => formatDate(item.todostarttime) === formattedStartDate
        );
        if (startTimeIndex === -1) {
          // 如果不存在，创建新的日期分组
          olddata.todolist.push({
            todostarttime: formattedStartDate,
            itemlist: [newTodo]
          });
        } else {
          // 如果存在，添加到现有分组
          olddata.todolist[startTimeIndex].itemlist.push(newTodo);
        }
        console.log('时间线', startTimeIndex)
        await localforage.setItem(usernumber, {
          password: olddata.password,
          name: olddata.name,
          avatar: olddata.avatar,
          todolist: olddata.todolist,
          donelist: olddata.donelist
        });
        console.log('添加待办成功');
        await gettimelist(); // 重新获取数据以更新分组
      }
    } catch (error) {
      console.log('添加代办错误', error);
      alert('添加代办错误');
    }
  }
  dialogFormVisible.value = false;
  cancel();
};

// 删除代办
const todelete = (todocontent: string, todostarttime: string) => {
  deletecontent.value = todocontent
  deletestarttime.value = todostarttime
  dialogVisible.value = true
}
const deletelist = async () => {
  const content = deletecontent.value;
  const starttime = deletestarttime.value;
  try {
    const usernumber = await localforage.getItem('user') as string;
    if (usernumber) {
      const olddata = await localforage.getItem(usernumber) as UserData;
      // 格式化要删除待办的开始日期
      const formattedStarttime = formatDate(starttime);
      // 查找对应的时间分组，使用格式化后的日期进行比较
      const startTimeIndex = olddata.todolist.findIndex(
        item => formatDate(item.todostarttime) === formattedStarttime
      );
      console.log('starttimeindex:', startTimeIndex);
      console.log('itemlist:', olddata.todolist[startTimeIndex]?.itemlist);
      if (startTimeIndex !== -1) {
        const itemIndex = olddata.todolist[startTimeIndex].itemlist.findIndex(
          item => item.todocontent === content
        );
        if (itemIndex !== -1) {
          olddata.todolist[startTimeIndex].itemlist.splice(itemIndex, 1);
          if (olddata.todolist[startTimeIndex].itemlist.length === 0) {
            olddata.todolist.splice(startTimeIndex, 1);
          }
          await localforage.setItem(usernumber, {
            password: olddata.password,
            name: olddata.name,
            avatar: olddata.avatar,
            todolist: olddata.todolist,
            donelist: olddata.donelist
          });
          console.log('删除成功');
          await gettimelist();
        }
      }
    }
  } catch (error) {
    console.log('删除代办错误', error);
  }
  dialogVisible.value = false;
};

// 完成代办
const done = async (todocontent: string, todostarttime: string) => {
  try {
    const usernumber = await localforage.getItem('user') as string;
    if (usernumber) {
      const olddata = await localforage.getItem(usernumber) as UserData;
      // 格式化要完成待办的开始日期
      const formattedStarttime = formatDate(todostarttime);
      // 查找对应的时间分组，使用格式化后的日期进行比较
      const startTimeIndex = olddata.todolist.findIndex(
        item => formatDate(item.todostarttime) === formattedStarttime
      );
      console.log('starttimeindex:', startTimeIndex);
      if (startTimeIndex !== -1) {
        const itemIndex = olddata.todolist[startTimeIndex].itemlist.findIndex(
          item => item.todocontent === todocontent
        );
        if (itemIndex !== -1) {
          const completedTodo = olddata.todolist[startTimeIndex].itemlist[itemIndex];
          completedTodo.tododonetime = new Date().toISOString();
          const doneTime = formatDate(completedTodo.tododonetime);
          const doneTimeIndex = olddata.donelist.findIndex(
            item => formatDate(item.tododonetime) === doneTime
          );
          if (doneTimeIndex === -1) {
            olddata.donelist.push({
              tododonetime: doneTime,
              itemlist: [completedTodo]
            });
          } else {
            olddata.donelist[doneTimeIndex].itemlist.push(completedTodo);
          }
          olddata.todolist[startTimeIndex].itemlist.splice(itemIndex, 1);
          if (olddata.todolist[startTimeIndex].itemlist.length === 0) {
            olddata.todolist.splice(startTimeIndex, 1);
          }
          await localforage.setItem(usernumber, {
            password: olddata.password,
            name: olddata.name,
            avatar: olddata.avatar,
            todolist: olddata.todolist,
            donelist: olddata.donelist
          });
          console.log('待办已标记为完成');
          donesuccess()
          await gettimelist();
        }
      }
    }
  } catch (error) {
    console.log('完成待办错误', error);
  }
};

// 获取数据
const gettimelist = async () => {
  const usernumber = await localforage.getItem('user') as string;
  console.log('用户账号', usernumber);
  if (usernumber) {
    document.querySelector('.add')?.classList.remove('none');
    try {
      const userdata = await localforage.getItem(usernumber) as UserData;
      console.log('用户信息', userdata);
      if (userdata) {
        timelists.value = userdata.todolist.map((startTime) => ({
          todostarttime: startTime.todostarttime,
          itemlist: startTime.itemlist
        }));
        timelists.value.sort((a, b) =>
          new Date(b.todostarttime).getTime() - new Date(a.todostarttime).getTime()
        );
        const grouped: { [date: string]: TodoItem[] } = {};
        timelists.value.forEach((timelist) => {
          timelist.itemlist.forEach((item) => {
            const date = formatDate(item.todostarttime);
            if (!grouped[date]) {
              grouped[date] = [];
            }
            grouped[date].push(item);
          });
        });
        groupedTimelists.value = grouped;
        console.log("读取成功", groupedTimelists.value);
      }
    } catch (error) {
      console.log("读取错误", error);
    }
  } else {
    document.querySelector('.add')?.classList.add('none');
  }
};

// 清空数据
const cancel = () => {
  form.value.todohead = ''
  form.value.todocontent = ''
  form.value.tododdl = ''
  form.value.todostarttime = ''
  dialogFormVisible.value = false
}

// 提取日期函数
const getDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // 使用 toLocaleDateString 方法并指定日期格式
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

// 格式化日期函数
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  gettimelist()
})
</script>

<template>
  <button class="add" @click="add"></button>
  <div class="custom-timeline">
    <div class="custom-timeline-item" v-for="(groupedItems, date) in groupedTimelists" :key="date">
      <div class="timestamp"> --- {{ formatDate(date) }} --- </div>
      <div class="todo-container">
        <div class="todocard" v-for="(item, itemIndex) in groupedItems" :key="itemIndex">
          <div class="cardhead">
            <h2>--{{ item.todohead }}--</h2>
            <button @click="todelete(item.todocontent, item.todostarttime)"></button>
          </div>
          <hr>
          <div class="content">{{ item.todocontent }}</div>
          <hr>
          <div class="cardfoot">
            <h4>Deadline: {{ formatDate(getDateOnly(item.tododdl)) }}</h4>
            <button @click="done(item.todocontent, item.todostarttime)">Done</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 增加list -->
  <el-dialog v-model="dialogFormVisible" title="增加代办：" width="500" top="25vh" draggable>
    <el-form :model="form" :rules="rule1" ref="addform">
      <el-form-item label="主题:" :label-width="formLabelWidth" prop="todohead">
        <el-input v-model="form.todohead" autocomplete="off" placeholder="请输入主题" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="正文:" :label-width="formLabelWidth" prop="todocontent">
        <el-input v-model="form.todocontent" maxlength="30" style="width: 300px;" placeholder="请输入正文内容" show-word-limit
          type="textarea" />
      </el-form-item>
      <el-form-item label="开始日期:" :label-width="formLabelWidth" prop="todostarttime">
        <el-date-picker v-model="form.todostarttime" type="date" placeholder="请选择开始日期" />
      </el-form-item>
      <el-form-item label="截止日期:" :label-width="formLabelWidth" prop="tododdl">
        <el-date-picker v-model="form.tododdl" type="date" placeholder="请选择截止时间" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="addlist">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 删除确认 -->
  <el-dialog v-model="dialogVisible" title="确定删除这个代办？" width="500" top="32vh">
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deletelist">
          删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<style scoped>
@font-face {
  font-family: 'icomoon';
  src: url('fonts/icomoon.eot?nlie2y');
  src: url('fonts/icomoon.eot?nlie2y#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?nlie2y') format('truetype'),
    url('fonts/icomoon.woff?nlie2y') format('woff'),
    url('fonts/icomoon.svg?nlie2y#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.custom-timeline-item {
  margin-bottom: 50px;
}

.timestamp {
  font-size: 28px;
  font-weight: 700;
  color: rgb(100, 145, 240);
  margin-bottom: 20px;
  display: block;
  font-family: 'icomoon';
}

.todo-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 30px 0 0 30px;
  border-radius: 20px;
  background-color: white;
}

.todocard {
  height: 250px;
  width: 325px;
  margin-right: 27px;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 20px;
  background-color: rgb(130, 165, 245);
}

.todocard .cardhead {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cardhead h2 {
  letter-spacing: 0.08em;
  color: white;
}

.cardhead button {
  width: 25px;
  height: 25px;
  margin-top: 5px;
  margin-right: 5px;
  border: 1.5px solid white;
  border-radius: 25px;
  font-size: 20px;
  background-color: transparent;
  color: white;
  font-family: 'icomoon';
}

.cardhead button:hover {
  border: 2px solid white;
}

.content {
  height: 150px;
  margin: 10px 0 10px 0;
  font-size: 20px;
  color: white;
  word-wrap: break-word;
}

.todocard .cardfoot {
  display: flex;
  justify-content: space-between;
  color: white;
}

.cardfoot h4 {
  margin-top: 12px;
}

.cardfoot button {
  width: 65px;
  height: 32px;
  margin-top: 8px;
  font-size: 14px;
  border: 1.5px solid white;
  border-radius: 10px;
  background-color: transparent;
  color: white;
  font-weight: 500;
}

.cardfoot button:hover {
  border: 2px solid white;
}

.add {
  position: fixed;
  bottom: 65px;
  right: 65px;
  width: 80px;
  height: 80px;
  border-radius: 80px;
  border: 3px solid rgb(100, 145, 240);
  font-size: 20px;
  color: rgb(100, 145, 240);
  font-family: 'icomoon';
}

.add:hover {
  border: 4px solid rgb(100, 145, 240);
}

.none {
  display: none;
}
</style>
