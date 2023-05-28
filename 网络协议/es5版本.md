## es5版本

ES5 规范去除了 ES3 中变量对象和活动对象，以 **词法环境组件**（ LexicalEnvironment component） 和 **变量环境组件**（ VariableEnvironment component） 替代。

### 生命周期

es5 执行上下文的**生命周期**也包括三个阶段：**创建阶段** → **执行阶段 → 回收阶段**

#### 创建阶段

创建阶段做了三件事：

1. 确定 this 的值，也被称为 This Binding
2. LexicalEnvironment（词法环境） 组件被创建
3. VariableEnvironment（变量环境） 组件被创建

伪代码大概如下：

```js
ExecutionContext = {  
  ThisBinding = <this value>,     // 确定this 
  LexicalEnvironment = { ... },   // 词法环境
  VariableEnvironment = { ... },  // 变量环境
}
```

##### This Binding

`ThisBinding` 是和执行上下文绑定的，也就是说每个执行上下文中都有一个 `this`，与 `es3` 的`this` 并没有什么区别，**`this` 的值是在执行的时候才能确认**，定义的时候不能确认

##### 创建词法环境

词法环境的结构如下：

```js
GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {       // 词法环境
    EnvironmentRecord: {     // 环境记录
      Type: "Object",           // 全局环境
      // 标识符绑定在这里 
      outer: <null>           // 对外部环境的引用
  }  
}
 
FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {     // 词法环境
    EnvironmentRecord: {    // 环境记录
      Type: "Declarative",      // 函数环境
      // 标识符绑定在这里      // 对外部环境的引用
      outer: <Global or outer function environment reference>  
  }  
}
复制代码
```

可以看到**词法环境**有**两种类型** 👇：

- **全局环境**：是一个没有外部环境的词法环境，其外部环境引用为 `null`。拥有一个全局对象（window 对象）及其关联的方法和属性（例如数组方法）以及任何用户自定义的全局变量，`this` 的值指向这个全局对象。
- **函数环境**：用户在函数中定义的变量被存储在环境记录中，包含了 `arguments` 对象。对外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境。 词法环境有两个组件 👇：
- **环境记录器** ：存储变量和函数声明的实际位置。
- **外部环境的引用** ：它指向作用域链的下一个对象，可以访问其父级词法环境（作用域），作用与 es3 的作用域链相似 环境记录器也有两种类型 👇：
- 在函数环境中使用 **声明式环境记录器**，用来存储变量、函数和参数。
- 在全局环境中使用 **对象环境记录器**，用来定义出现在全局上下文中的变量和函数的关系。

🎉 因此：

- 创建全局上下文的词法环境使用 **对象环境记录器** ,`outer` 值为 `null`;
- 创建函数上下文的词法环境时使用 **声明式环境记录器** ,`outer` 值为全局对象，或者为父级词法环境（作用域）

##### 创建变量环境

变量环境也是一个词法环境，因此它具有上面定义的词法环境的所有属性。

在 ES6 中，**词法环境** 和 **变量环境**的区别在于前者用于存储函数声明和变量（ `let`和`const`关键字）绑定，而后者仅用于存储变量（ `var` ）绑定，因此变量环境实现函数级作用域，通过词法环境在函数作用域的基础上实现块级作用域。

🚨 使用 `let` / `const` 声明的全局变量，会被绑定到 `Script` 对象而不是 `Window` 对象，不能以`Window.xx` 的形式使用；使用 `var` 声明的全局变量会被绑定到 `Window` 对象；使用 `var` / `let` / `const` 声明的局部变量都会被绑定到 `Local` 对象。注：`Script` 对象、`Window` 对象、`Local` 对象三者是平行并列关系。

```!
箭头函数没有自己的上下文，没有arguments，也不存在变量提升
```

使用例子进行介绍

```js
let a = 20;  
const b = 30;  
var c;

function multiply(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = multiply(20, 30);
```

遇到调用函数 `multiply` 时，函数执行上下文开始被创建：

```js
//全局
GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      a: < uninitialized >,  
      b: < uninitialized >,  
      multiply: < func >  
    }  
    outer: <null>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      c: undefined,  
    }  
    outer: <null>  
  }  
}

//函数
FunctionExectionContext = {  
   
  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      Arguments: {0: 20, 1: 30, length: 2},  
    },  
    outer: <GlobalLexicalEnvironment>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      g: undefined  
    },  
    outer: <GlobalLexicalEnvironment>  
  }  
}
```

变量提升的原因：在创建阶段，函数声明存储在环境中，而变量会被设置为 `undefined`（在 var 的情况下）或保持未初始化 `uninitialized`（在 let 和 const 的情况下）。所以这就是为什么可以在声明之前访问 var 定义的变量（尽管是 undefined ），但如果在声明之前访问 let 和 const 定义的变量就会提示引用错误的原因。这就是所谓的变量提升。

**图解变量提升：**

```js
var myname = "极客时间"
function showName(){
  console.log(myname);
  if(0){
   var myname = "极客邦"
  }
  console.log(myname);
}
showName()
复制代码
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8069ee4022d549969fe09b2ada39e305~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

在 showName 内部查找 myname 时会先使用当前函数执行上下文里面的变量 myname ，由于`变量提升`，当前的执行上下文中就包含了变量 myname，而值是 undefined，所以获取到的 myname 的值就是 undefined。

#### 执行阶段

在此阶段，完成对所有这些变量的分配，最后执行代码，如果 `JavaScript` 引擎不能在源码中声明的实际位置找到 `let` 变量的值，它会被赋值为 `undefined`

#### 回收阶段

执行上下文出栈等待虚拟机**回收**执行上下文

#### 过程总结

1. **创建阶段** 首先**创建全局上下文**的词法环境：首先创建 `对象环境记录器`，接着创建他的外部环境引用 `outer`，值为 null
2. 创建全局上下文的变量环境：过程同上
3. 确定 this 值为全局对象（以浏览器为例，就是 window ）
4. 函数被调用，创建**函数上下文**的词法环境：首先创建 `声明式环境记录器`，接着创建他的外部环境引用 `outer`，值为 null，值为全局对象，或者为父级词法环境
5. 创建函数上下文的变量环境：过程同上
6. 确定 this 值
7. 进入函数执行上下文的 **执行阶段**
8. 执行完成后进入 **回收阶段**

### 实例讲解

将词法环境中 `outer` 抽离出来，执行上下文结构如下： ![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/968afcfacc3243eca950799a1fdb9566~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

下面我们以如下示例来分析执行上下文的创建及执行过程：

```js
function foo(){
  var a = 1
  let b = 2
  {
    let b = 3
    var c = 4
    let d = 5
    console.log(a)
    console.log(b)
  }
  console.log(b) 
  console.log(c)
  console.log(d)
}   
foo()
复制代码
```

**第一步：** 调用 `foo` 函数前先编译并创建执行上下文，在编译阶段将 `var` 声明的变量存放到变量环境中，`let` 声明的变量存放到词法环境中，需要注意的是此时在函数体内部块作用域中 `let` 声明的变量不会被存放到词法环境中，如下图所示 👇：

![1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc165c085b574b898bde8663e697a44e~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

**第二步：** 继续执行代码，当执行到**代码块**里面时，变量环境中的 a 的值已经被设置为1，词法环境中 b 的值已经被设置成了2，此时函数的执行上下文如图所示：

![2.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4f7fcc3d6ce4dae857bc38285f8ca7c~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

从图中就可以看出，当进入函数的作用域块时，作用域块中通过 `let` 声明的变量，会被存放在词法环境的一个单独的区域中，这个区域中的变量并不影响作用域块外面的变量，因此示例中在函数体内块作用域中声明的变量的 b 与函数作用域中声明的变量 b 都是独立的存在。

在词法环境内部，实际上维护了一个小型栈结构，栈底是函数最外层的变量，**进入一个作用域块后，就会把该作用域内部的变量压到栈顶**；当该块级作用域执行完成之后，该作用域的信息就会从**栈顶弹出**，这就是词法环境的结构。

**第三步：** 当代码执行到作用域块中的 `console.log(a)` 时，就需要在词法环境和变量环境中查找变量 a 的值了，具体查找方式是：沿着词法环境的栈顶向下查询，如果在词法环境中的某个块中查找到了，就直接返回给 JavaScript 引擎，如果没有查找到，那么继续在变量环境中查找。

这样一个变量查找过程就完成了，你可以参考下图：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3afcac663c2e4b47bdeee38056d28039~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

**第四步：** 当函数体内块作用域执行结束之后，其内部变量就会从词法环境的栈顶弹出，此时执行上下文如下图所示：

![3.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f579898c682c4aa985453802db8d2f94~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

**第五步：** 当foo函数执行完毕后执行栈将foo函数的执行上下文弹出。

所以，**块级作用域就是通过词法环境的栈结构来实现的**，而**变量提升是通过变量环境来实现**，通过这两者的结合，JavaScript 引擎也就同时支持了变量提升和块级作用域了。

### outer引用

> **outer** 是一个外部引用，用来指向外部的执行上下文，其是由词法作用域指定的

```js
function bar() {
  console.log(myName)
}
function foo() {
  var myName = " 极客邦 "
  bar()
}
var myName = " 极客时间 "
foo()
复制代码
```

当一段代码使用了一个变量时，JavaScript 引擎首先会在“当前的执行上下文”中查找该变量， 比如上面那段代码在查找 myName 变量时，如果在当前的变量环境中没有查找到，那么 JavaScript 引擎会继续在 outer 所指向的执行上下文中查找。为了直观理解，你可以看下面这张图：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17bba44f657046c6a82e9d919da65871~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

从图中可以看出，bar 函数和 foo 函数的 outer 都是指向全局上下文的，这也就意味着如果在 bar 函数或者 foo 函数中使用了外部变量，那么 JavaScript 引擎会去全局执行上下文中查找。我们把这个查找的链条就称为作用域链。 现在你知道变量是通过作用域链来查找的了，不过还有一个疑问没有解开，foo 函数调用的 bar 函数，那为什么 bar 函数的外部引用是全局执行上下文，而不是 foo 函数的执行上下文？

> 这是因为在 JavaScript 执行过程中，其作用域链是由词法作用域决定的。词法作用域指作用域是由代码中函数声明的位置来决定的,因此是静态的作用域

结合变量环境、词法环境以及作用域链，我们看下下面的代码：

```js
function bar() {
  var myName = " 极客世界 "
  let test1 = 100
  if (1) {
    let myName = "Chrome 浏览器 "
    console.log(test)
  }
}
function foo() {
  var myName = " 极客邦 "
  let test = 2
  {
    let test = 3
    bar()
  }
}
var myName = " 极客时间 "
let myAge = 10
let test = 1
foo()
```

对于上面这段代码，当执行到 bar 函数内部的 if 语句块时，其调用栈的情况如下图所示：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fcab189652a5428e8875fe12a169d9db~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

解释下这个过程。首先是在 bar 函数的执行上下文中查找，但因为 bar 函数的执行上下文中没有定义 test 变量，所以根据词法作用域的规则，下一步就在 bar 函数的外部作用域中查找，也就是全局作用域。