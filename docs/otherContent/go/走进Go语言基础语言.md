> 来自青训营课程Go



## 一、简介



### 1.1 什么是Go语言

1. 高性能、高并发
2. 语法简单、学习曲线平缓
3. 丰富的标准库
4. 完善的工具链
5. 静态链接
6. 快速便宜
7. 跨平台
8. 垃圾回收



## 二、入门



### 2.1 开发环境-安装 Golang

https://go.dev/

https://studygoland.com/dl

![image-20230115194129912](markdown-img/走进Go语言基础语言.assets/image-20230115194129912.png)

配置继承开发环境

![image-20230115194227466](markdown-img/走进Go语言基础语言.assets/image-20230115194227466.png)



### 2.2 基础语法

#### 1.Hello World

```go
package main

import "fmt"

// 单行注释

/*
这是一个main函数
*/

func main() {
	fmt.Printf("hell World")
}
```



#### 2.变量

>1. 变量名必须以字母或下划线开头，后面可以跟任意数量的字母、数字和下划线。
>2. Go语言是大小写敏感的，因此变量名大小写不同被视为不同的变量。
>3. Go语言支持类型推导，在定义变量时可以省略显式类型声明。
>4. Go语言支持批量声明变量，可以在一行中同时声明多个变量。
>5. Go语言支持赋值操作符 := 用于简化变量声明和初始化。
>6. Go语言支持默认初始值，所有变量在声明时都会被赋予一个默认初始值。
>7. 可以利用 :=进行赋值和定义变量

```go
package byteDance

import (
	"fmt"
	"math"
)

func main() {
	var a = "initial"
	var b, c int = 1, 2
	var d = true
	var e float64

	f := float32(e)
	//声明
	g := a + "foo"
	fmt.Println(a, b, c, d, e, f)
	fmt.Println(g)
	//常量
	const s string = "constant"
	const h = 500000000
	const i = 3e20 / h
	fmt.Println(s, h, i, math.Sin(h), math.Sin(i))
}
```



#### 3.if-else

> go语言的判断语句后面是没有括号的（）

```go
package main

import "fmt"

func main() {
	if 7%2 == 0 {
		fmt.Println("7 is even")
	} else {
		fmt.Println("7 is odd")
	}

	if 8%4 == 0 {
		fmt.Println("8 is divisible by 4")
	}

	if num := 9; num < 4 {
		fmt.Println(num, "is negative")
	} else if num < 10 {
		fmt.Println("has l digit")
	}
}
```



#### 4.for循环

> for循环没有括号

```go
package main

import "fmt"

func main() {
	i := 1
	for {
		fmt.Println("loop")
		break
	}

	for j := 7; j < 9; j++ {
		fmt.Println(j)
	}

	for n := 0; n < 5; n++ {
		if n%2 == 0 {
			continue
		}
		fmt.Println(n)
	}

	for i <= 3 {
		fmt.Println(i)
		i = i + 1
	}
}
```



#### 5.Switch-case

```go
import (
	"fmt"
	"time"
)

func main() {
	a := 2
	switch a {
	// 不需要 break
	// 可以加任意变量在expr
	case 1:
		fmt.Println("one")
	case 2:
		fmt.Println("two")
	case 3:
		fmt.Println("three")
	case 4:
		fmt.Println("for")
	default:
		fmt.Println("other")
		t := time.Now()
		switch {
		case t.Hour() < 12:
			fmt.Println("it is before noon")
		default:
			fmt.Println("cao")

		}
	}
}
```



#### 6.数组

```go
package main

import "fmt"

func main() {
	var a [5]int
	a[4] = 100
	fmt.Println(a[4], len(a))

	b := [5]int{1, 2, 3, 4, 5}
	
	fmt.Println(b)

	var twoD [2][3]int

	for i := 2; i < 2; i++ {
		for j := 0; j < 3; j++ {
			twoD[i][j] = i + j;
		}
	}
	fmt.Println("2d:  ", twoD)
}
```



#### 7.切片

```go
import "fmt"

func main() {
	s := make([]string, 3)
	s[0] = "a"
	s[1] = "b"
	s[2] = "c"
	fmt.Println("get:", s[2])
	fmt.Printf("len:", len(s))

	// 利用append 添加元素
	// 注意append之后需要赋值回给原来的s
	s = append(s, "d")
	s = append(s, "e", "f")
	fmt.Println(s)

	c := make([]string, len(s))
	copy(c, s)
	fmt.Println(c)

	fmt.Println(s[2:5]) // [c d e]
	fmt.Println(s[:5])  // [a b c d e]
	fmt.Println(s[2:])  // [c d e f]

	good := []string{"g", "o", "o", "d"}
	fmt.Println(good)

}
```



#### 8.map

```go
import "fmt"

func main() {
	// map[key] value
	m := make(map[string]int)
	m["one"] = 1
	m["two"] = 2
	fmt.Println(m) // map[one :1, two:2]
	fmt.Println(len(m))
	fmt.Println(m["one"])
	fmt.Println(m["unknow"])

	r, ok := m["unknow"]
	fmt.Println(r, ok)

	delete(m, "one")

	m2 := map[string]int{"one": 1, "two": 2}
	var m3 = map[string]int{"one": 1, "two": 2}
	fmt.Println(m2, m3)
}
```



#### 9. range语法

```go
import "fmt"

func main() {
	nums := []int{2, 3, 4}
	sum := 0
	for i, num := range nums {
		sum += num
		if num == 2 {
			fmt.Println("index", i, "num:", num) // index:0 num:2
		}
	}
	fmt.Println(sum) //9

	m := map[string]string{"a": "A", "b": "B"}
	for k, v := range m {
		fmt.Println(k, v)
	}

	for k := range m {
		fmt.Println("key", k)
	}
}
```



#### 10. 函数

```go
import "fmt"

func add(a int, b int) int {
	return a + b
}

func add2(a, b int) int {
	return a + b
}

func exists(m map[string]string, k string) (v string, ok bool) {
	v, ok = m[k]
	return v, ok
}

func main() {
	res := add(1, 2)
	fmt.Println(res) //3

	v, ok := exists(map[string]string{"a": "A"}, "a")
	fmt.Println(v, ok)
}
```



#### 11.指针

```go

import "fmt"

// 指针
// 拷贝的参数形参
func add3(n int) {
	n += 2
}

// 实参
func add2ptr(n *int) {
	*n += 2
}

func main() {
	n := 5
	add3(n)
	fmt.Println(n) //5
	add2ptr(&n)
	fmt.Println(n) //7
}
```



#### 12.结构体

```java
package main

import "fmt"

type user struct {
	name     string
	password string
}

func main() {
	a := user{name: "wang", password: "1024"}
	b := user{"wang", "1024"}
	c := user{name: "Wange"}
	c.password = "1024"

	var d user
	d.password = "1024"
	d.name = "li"

	fmt.Println(a, b, c, d)
	fmt.Println(checkPassword(a, "haha"))
	fmt.Println(checkpassword2(&a, "haha"))
}

func checkPassword(u user, password string) bool {
	return u.password == password
}

func checkpassword2(u *user, password string) bool {
	return u.password == password
}
```



#### 13.结构体方法

```go
package main

// 结构体方法

import "fmt"

type user1 struct {
	name     string
	password string
}

// 移到前面来
func (u user1) checkPassword1(password string) bool {
	return u.password == password
}

// 带指针 可以对结构体进行修改
func (u *user1) resetPassword(password string) {
	u.password = password
}

func main() {
	a := user1{name: "wang", password: "1024"}
	a.resetPassword("2048")
	fmt.Println(a.checkPassword1("1024")) //true
}
```





#### 14.错误处理

```go
import (
	"errors"
	"fmt"
)

type user3 struct {
	name     string
	password string
}

func findUser(user3s []user3, name string) (v *user3, err error) {
	for _, u := range user3s {
		if u.name == name {
			return &u, nil
		}
	}
	return nil, errors.New("not found")
}

func main() {
	u, err := findUser([]user3{{"wang", "1024"}}, "wang")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(u.name) // wang

	//if u,err :=findUser([]user3{{"wang","1024"}},"li");
	//if err != nil {
	//	fmt.Println(err)
	//	return
	//}else {
	//	fmt.Println(u.name)
	//}
}
```





#### 15.字符串操作

```go
import (
	"fmt"
	"strings"
)

func main() {
	a := "hello"
	fmt.Println(strings.Contains(a, "ll"))                // true
	fmt.Println(strings.Count(a, "l"))                    // 2
	fmt.Println(strings.HasPrefix(a, "he"))               //true
	fmt.Println(strings.HasSuffix(a, "llo"))              //true
	fmt.Println(strings.Index(a, "ll"))                   // 2
	fmt.Println(strings.Join([]string{"he", "llo"}, "-")) // he-llo
	fmt.Println(strings.Repeat(a, 2))                     // hellohello
	fmt.Println(strings.Replace(a, "e", "E", -1))         // hEllo
	fmt.Println(strings.Split("a-b-c", "-"))              //[a b c]
	fmt.Println(strings.ToLower(a))                       //hello
	fmt.Println(strings.ToUpper(a))                       //HELLO
	fmt.Println(len(a))                                   //5
}
```

#### 16.字符串格式化

> %v 打印任意类型的变量
>
> %+v 打印详细的变量
>
> %#v 打印更加详细的变量

```go
import "fmt"

type point struct {
	x, y int
}

func main() {
	s := "hello"
	n := 123
	p := point{1, 2}
	fmt.Println(s, n) // hello 123
	fmt.Println(p)    //{1,2}

	fmt.Println("s =%v\n", s)   // s= hello
	fmt.Println("n = %v\n", n)  //n =123
	fmt.Println("p = %v\n", p)  // p={1 2}
	fmt.Println("p = %+v\n", p) // p = {x:1 y:2}
	fmt.Println("p = %#v\n", p) // p = main.point{x:1 ,y:2}

	f := 3.141592653
	fmt.Println(f)           // 3.141592653
	fmt.Println("%.2f\n", f) //3.14
}
```



#### 17.JSON处理

> 第一次字母大写即可



```go
import (
	"encoding/json"
	"fmt"
)

type userInfo struct {
	Name  string
	Age   int `json:"age"`
	Hobby []string
}

func main() {
	// 首字母大写即可
	a := userInfo{Name: "wang", Age: 18, Hobby: []string{"Golang", "Typescript"}}
	// json序列化字符串
	buf, err := json.Marshal(a)
	if err != nil {
		panic(err)
	}
	fmt.Println(buf)         //[123 34 78 97]
	fmt.Println(string(buf)) // {"Name":"wang","age":18,"Hobby":["Golang","TypeScript"]}

	buf, err = json.MarshalIndent(a, "", "\t")
	if err != nil {
		panic(err)
	}
	fmt.Println(string(buf))
	var b userInfo
	err = json.Unmarshal(buf, &b)
	if err != nil {
		panic(err)
	}
	fmt.Println("%#v \n", b)
}
```



#### 18.时间处理

```go
import (
	"fmt"
	"time"
)

func main() {
	now := time.Now()
	fmt.Println(now)
	t := time.Date(2022, 3, 27, 1, 25, 36, 0, time.UTC)
	t2 := time.Date(2022, 3, 27, 2, 30, 36, 0, time.UTC)
	fmt.Println(t)
	// 时间日期
	fmt.Println(t.Year(), t.Month(), t.Day(), t.Hour())
	// 时间格式化
	fmt.Println(t.Format("2006-01-02 15:04:05"))
	// 两个时间段的时间间隔
	diff := t2.Sub(t)
	fmt.Println(diff)                           // 1h5m3s
	fmt.Println(diff.Minutes(), diff.Seconds()) //6s 3900
	t3, err := time.Parse("2006-01-02 15:04:05", "2022-03-27 15:04:05")
	if err != nil {
		panic(err)
	}
	fmt.Println(t3 == t)    //true
	fmt.Println(now.Unix()) // 时间戳
}
```





#### 19. 数字解析

```go

import (
	"fmt"
	"strconv"
)

func main() {
	f, _ := strconv.ParseFloat("1.234", 64)
	fmt.Println(f) // 1.234

	n, _ := strconv.ParseInt("111", 10, 64)
	fmt.Println(n) // 111

	n, _ = strconv.ParseInt("0x1000", 0, 64)
	fmt.Println(n) // 4096
	// Atoi 快速将一个十进制 转换为进制
	n2, _ := strconv.Atoi("123")
	fmt.Println(n2) //123

	n2, err := strconv.Atoi("AAA")
	fmt.Println(n2, err)
}
```



#### 20.进程信息

```go

import (
	"fmt"
	"os"
	"os/exec"
)

//进程信息

func main() {
	// go run example/main,go a b c d
	fmt.Println(os.Args)
	fmt.Println(os.Getenv("PATH")) // /usr/local/go/bin
	fmt.Println(os.Setenv("AA", "BB"))

	buf, err := exec.Command("gerp", "127.0.0.1", "/etc/hosts").CombinedOutput()
	if err != nil {
		panic(err)
	}
	fmt.Println(string(buf))
}

```





## 三、实战



### 1.猜数字

### 2.在线字典

### 3.Socks5 代理介绍

>  类似于代理服务器

![image-20230115231202312](markdown-img/走进Go语言基础语言.assets/image-20230115231202312.png)