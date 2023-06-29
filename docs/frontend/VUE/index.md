## 一、vue基础入门

> VUE :尤雨溪主导开发
>
> React：facebook脸书主导开发
>
> angular：谷歌主导开发
>
> （小程序也是一样）

VUE： 是一套用于构建用户界面的<font color='blue'>**渐进式框架**</font>。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与[现代化的工具链](https://v2.cn.vuejs.org/v2/guide/single-file-components.html)以及各种[支持类库](https://github.com/vuejs/awesome-vue#libraries--plugins)结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。

### 1.安装

**直接引入Vue.js文件**

尝试 Vue.js 最简单的方法是使用【hello world】，你可以在浏览器新标签页中打开它，跟着例子学习一些基础用法。或者你也可以[创建一个 `.html` 文件](https://github.com/vuejs/v2.vuejs.org/blob/master/src/v2/examples/vue-20-hello-world/index.html)，然后通过如下方式引入 Vue：

```js
<!-- 开发环境版本，包含了有帮助的命令行警告 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
```

或者：

```js
<!-- 生产环境版本，优化了尺寸和速度 -->
<script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
```



**基于Node环境创建Vue项目（使用vue/cli创建初始化一个Vue项目）**

步骤：

全局安装vue/cli工具：**npm install -g @vue/cli**

使用vue/cli常见vue项目： **vue create hello**

启动服务器：**npm run serve**

（而非直接打开静态文件的方式）

### 2.入门知识点

- 绑定文本：**{{}}**

- 绑定属性：**v-bind(指令)**

- 绑定事件（事件修饰符）: **v-on**

## 二、创建Vue项目

**项目目录结构:**

![image-20230102164839467](markdown-img/index.assets/image-20230102164839467.png)



组件化开发概述：

![image-20230102164916951](markdown-img/index.assets/image-20230102164916951.png)



vue 单页面应用

```vue
<template>

<!--  网页模板 ， 编写HTML 文件-->
  <h1> hello vue project</h1>
</template>

<script>
//JS 代码
</script>

<style>
/* css 代码 */
</style>
```

template 里面只能写一个div标签

```vue
<template>

<!--  网页模板 ， 编写HTML 文件-->
  <div>
    <h1> hello vue project</h1>
    <h1> hello vue project</h1>
  </div>
</template>

<script>
//JS 代码
</script>

<style>
/* css 代码 */
</style>
```

绑定属性方法

```vue
<template>

<!--  网页模板 ， 编写HTML 文件-->
  <div>
    <h1 :title="message">{{ message }}</h1>
    <button @click="sayHi"> showHi </button>
  </div>
</template>

<script>
//JS 代码
 export default {
   // 数据函数
  data() {
    //返回一个对象
    return {
      message: "hello world"
    }
  },
   methods:{
    sayHi(){
      alert("hi")
    }
   }
}
</script>

<style>
/* css 代码 */
</style>
```

