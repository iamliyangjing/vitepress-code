> 本文将介绍Java NIO 中三大组件 Buffer、Channe、Selector的使用。
>
> 本文要一起介绍非阻塞IO 和 JDK7 的异步IO的，不过因为之前的文章真的太多了，有点影响读者阅读，所以这里将它们放到另一篇文章中进行介绍。



## Buffer

一个Buffer本质上的内存中的一块，我们可以将数据写入这块内存，之后从这块内存获取数据。

java.nio 定义了以下几个Buffer的实现，这个图应该在不少地方见过了吧。

![image-20230108140040215](markdown-img/NIO.assets/image-20230108140040215.png)

其实核心是最后的**ByteBuffer**，前面的一大串类只是包装了一下它而已，我们使用最多的通常也是<font color='red'>**ByteBuffer**</font>。

我们应该将Buffer 理解为一个数组，IntBuffer、CharBuffer、DoubleBuffer等分别对应int[]、char[]、double[]等。

MappedByteBuffer 用户实现内存映射文件，也不是本文关注的重点。

我觉得操作Buffer和操作数组、类集差不多，只不过大部分时候我们都把它放到了NIO的场景里面来使用而已。下面介绍Buffer中的几个重要属性和几个重要方法。

### 1.position、limit、capacity

就像数组有数组容量，每次访问元素要指定下标，Buffer中也有几个重要属性：position、limit、capacity。

![image-20230108140739639](markdown-img/NIO.assets/image-20230108140739639.png)

- **capacity**:<font color='red'> *它代表这个缓冲区的容量，一旦设定就不可以更改*。</font>比如capacity 为 1024 的 IntBuffer，代表其一次可以存放 1024 个int类型的值。一旦Buffer的容量达到capacity，需要清空Buffer，才能重新写入值。

> position 和 limit 是变化的，我们分别看下读和写操作下，它们是如何变化的。

- position: 初始值为0，每次往Buffer中写入一个值，position就自动加1，代表下一次的写入位置，读操作的时候也是类似的，每读一个值，position就自动加1。

从**写操作模式到读操作模式切换**的时候（**flip**），position 都会归零，这样就可以从头开始读写了。

- Limit：**写操作模式下，limit代表的是最大能写入的数据，这个时候limit等于capacity。**写结束后，切换到读模式，此时的limit等于Buffer中实际的数据大小，因为Buffer不一定被写满了。

![image-20230108141527287](markdown-img/NIO.assets/image-20230108141527287.png)

### 2.**初始化Buffer**

每个Buffer 实现类都提供了一个静态方法 allocate(int capacity)帮助我们快速实例化一个Buffer。如：

```java
ByteBuffer byteBuf = ByteBuffer.allocate(1024);
IntBuffer intBuf = IntBuffer.allocate(1024);
LongBuffer longBuf = LongBuffer.allocate(1024);
// ...
```

另外，我们可以使用wrap方法来初始化一个Buffer

```java
public static ByteBuffer wrap(byte[] array) {
    ...
}
```

### 3.填充Buffer

各个Buffer类 都提供了一些put方法用于将数据填充到Buffer，如ByteBuffer中的几个put方法：

```java
// 填充一个 byte 值
public abstract ByteBuffer put(byte b);
// 在指定位置填充一个 int 值
public abstract ByteBuffer put(int index, byte b);
// 将一个数组中的值填充进去
public final ByteBuffer put(byte[] src) {...}
public ByteBuffer put(byte[] src, int offset, int length) {...}
```

上述这些方法需要自己控制Buffer大小，不能超过capacity，超过会抛 java.nio.BufferOverflowException异常。

对于Buffer来说，另一个常见的操作中就是，我们要将来自Channel的数据填充到Buffer中，在系统层面上，这个操作我们称为<font color='red'>**读操作**</font>，因为数据是从外部（文件或网络等）读到内存中。

```java
int num = channel.read(buf);
```

上述方法会返回从Channel中读入到Buffer的数据大小。

### 4.提取Buffer中的值

前面介绍了写操作，每写入一个值，position 的值都需要加 1，所以 position 最后会指向最后一次写入的位置的后面一个，如果 Buffer 写满了，那么 position 等于 capacity（position 从 0 开始）。

如果要读 Buffer 中的值，需要切换模式，从写入模式切换到读出模式。注意，通常在说 NIO 的读操作的时候，我们说的是从 Channel 中读数据到 Buffer 中，对应的是对 Buffer 的写入操作，初学者需要理清楚这个。

调用 Buffer的  **flip() ** 方法，可以从写入模式切换到读取模式。其实这个方法也就是设置了一下position 和 limit 值罢了。 

```java
public final Buffer flip() {
    limit = position; // 将 limit 设置为实际写入的数据数量
    position = 0; // 重置 position 为 0
    mark = -1; // mark 之后再说
    return this;
}
```

对应写入操作的一系列 put 方法，读操作提供了一系列的 get 方法：

```java
// 根据 position 来获取数据
public abstract byte get();
// 获取指定位置的数据
public abstract byte get(int index);
// 将 Buffer 中的数据写入到数组中
public ByteBuffer get(byte[] dst)
```

附一个经常使用的方法：

```java
new String(buffer.array()).trim();
```

当然了，除了将数据从 Buffer 取出来使用，更常见的操作是将我们写入的数据传输到 Channel 中，如通过 FileChannel 将数据写入到文件中，通过 SocketChannel 将数据写入网络发送到远程机器等。对应的，这种操作，我们称之为<font color='red'>**写操作**</font>。

```
int num = channel.write(buf);
```

### 5. mark() & reset()

除了 position、limit、capacity 这三个基本的属性外，还有一个常用的属性就是mark。

**mark 用于临时保存position的值，每次调用mark() 方法都会将mark 设置为当前的position**，便于后续需要的时候使用。

```java
public final Buffer mark() {
    mark = position;
    return this;
}
```

那到底什么时候用呢？考虑以下场景，我们在 position 为 5 的时候，先 mark() 一下，然后继续往下读，读到第 10 的时候，我想重新回到 position 为 5 的地方重新来一遍，**那只要调一下 reset() 方法，position 就回到 5 了。**

```java
public final Buffer reset() {
    int m = mark;
    if (m < 0)
        throw new InvalidMarkException();
    position = m;
    return this;
}
```



### 6. rewind() & clear() & compact()

**rewind()** :<font color='red'>会重置position 为 0 ，通常用于重新从头读写Buffer。</font>

```java
public final Buffer rewind() {
    position = 0;
    mark = -1;
    return this;
}
```

**clear()**：<font color='red'>有点重置 Buffer 的意思，相当于重新实例化了一样。</font>

通常，我们会先填充 Buffer，然后从 Buffer 读取数据，之后我们再重新往里填充新的数据，我们一般在重新填充之前先调用 clear()。

```java
public final Buffer clear() {
    position = 0;
    limit = capacity;
    mark = -1;
    return this;
}
```

**compact()**：<font color='red'>和 clear() 一样的是，它们都是在准备往 Buffer 填充新的数据之前调用。</font>

前面说的 clear() 方法会重置几个属性，但是我们要看到，clear() 方法并不会将 Buffer 中的数据清空，**只不过后续的写入会覆盖掉原来的数据，也就相当于清空了数据了。**

而 compact() 方法有点不一样，调用这个方法以后，会先处理还没有读取的数据，**也就是 position 到 limit 之间的数据（还没有读过的数据），先将这些数据移到左边，然后在这个基础上再开始写入**。很明显，此时 limit 还是等于 capacity，position 指向原来数据的右边。

### 7.总结

1. 向 buffer 写入数据，例如调用 channel.read(buffer)
2. 调用 flip() 切换至**读模式**
3. 从 buffer 读取数据，例如调用 buffer.get()
4. 调用 clear() 或 compact() 切换至**写模式**
5. 重复 1~4 步骤
6. 

## Channel

所有的NIO操作始于通道，通道是数据来源或数据**写入的目的地，主要地**，我们关心java.nio包中实现的以下几个channel：

![image-20230108151905140](markdown-img/NIO.assets/image-20230108151905140.png)

- FileChannel ：**文件通道，用于文件的读和写**
- DatagramChannel ： **用于 UDP 连接的接收和发送**
- SocketChannel：**把它理解为 TCP 连接通道，简单理解就是 TCP 客户端**
- ServerSocketChannel：**TCP 对应的服务端，用于监听某个端口进来的请求**

*这里不是很理解这些也没关系，我们最应该关注，也是后面将会重点介绍的是 SocketChannel 和 ServerSocketChannel。*

<font color='red'>**Channel 经常翻译为通道，类似IO中的流，用于读取和写入**</font>。它与前面介绍的Buffer打交道，读操作的时候将Channel中的数据填充到Buffer中，而写操作时将Buffer中的数据写入到Channel中。

![image-20230108152519721](markdown-img/NIO.assets/image-20230108152519721.png)

![image-20230108152532205](markdown-img/NIO.assets/image-20230108152532205.png)

至少读者应该记住一点，这两个方法都是channel实例的方法。

### 1.FileChannel

**FileChannel是不支持非阻塞的。**

简单介绍

**这里算是简单介绍下常用的操作吧**

**初始化：**

```java
FileInputStream inputStream = new FileInputStream(new File("/data.txt"));
FileChannel fileChannel = inputStream.getChannel();
```

当然了，我们也可以从 RandomAccessFile#getChannel 来得到 FileChannel。

**读取文件内容：**

```java
ByteBuffer buffer = ByteBuffer.allocate(1024);
int num = fileChannel.read(buffer);
```

前面我们也说了，所有的 Channel 都是和 Buffer 打交道的。

**写入文件内容：**

```java
ByteBuffer buffer = ByteBuffer.allocate(1024);
buffer.put("随机写入一些内容到 Buffer 中".getBytes());
// Buffer 切换为读模式
buffer.flip();
while(buffer.hasRemaining()) {
    // 将 Buffer 中的内容写入文件
    fileChannel.write(buffer);
}
```

### 2.SocketChannel

**可以将 SocketChannel 理解成一个 TCP 客户端**,使用方式：

打开一个TCP链接：

```java
SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("https://www.javadoop.com", 80));
```

当然了，上面的这行代码等价于下面的两行：

```java
// 打开一个通道
SocketChannel socketChannel = SocketChannel.open();
// 发起连接
socketChannel.connect(new InetSocketAddress("https://www.javadoop.com", 80));
```

SocketChannel 的读写和 FileChannel 没什么区别，就是操作缓冲区。

```java
// 读取数据
socketChannel.read(buffer);
// 写入数据到网络连接中
while(buffer.hasRemaining()) {
    socketChannel.write(buffer);   
}
```

不要在这里停留太久，先继续往下走。

### 3.ServerSocketChannel

之前说 SocketChannel 是 TCP 客户端，这里说的ServerSocketChannel 就是对应的服务端。ServerSocketChannel 用于监听机器端口，管理从这个端口进来的 TCP 连接。

```java
// 实例化
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
// 监听 8080 端口
serverSocketChannel.socket().bind(new InetSocketAddress(8080));

while (true) {
    // 一旦有一个 TCP 连接进来，就对应创建一个 SocketChannel 进行处理
    SocketChannel socketChannel = serverSocketChannel.accept();
}
```

> 这里我们可以看到SocketChannel的第二个实例化方式

到这里，我们应该能理解 SocketChannel 了，它不仅仅是 TCP 客户端，它代表的是一个网络通道，可读可写。

**ServerSocketChannel 不和 Buffer 打交道了**，因为它并不实际处理数据，它一旦接收到请求后，实例化 SocketChannel，之后在这个连接通道上的数据传递它就不管了，因为它需要继续监听端口，等待下一个连接。

### 4.DatagramChannel

UDP 和 TCP不一样，DatagramChannel 一个类处理了服务端和客户端。

> 科普一下，UDP 是面向无连接的，不需要和对方握手，不需要通知对方，就可以直接将数据包投出去，至于能不能送达，它是不知道的

**监听端口：**

```java
DatagramChannel channel = DatagramChannel.open();
channel.socket().bind(new InetSocketAddress(9090));
```

```java
ByteBuffer buf = ByteBuffer.allocate(48);

channel.receive(buf);
```

**发送数据：**

```java
String newData = "New String to write to file..."
                    + System.currentTimeMillis();

ByteBuffer buf = ByteBuffer.allocate(48);
buf.put(newData.getBytes());
buf.flip();

int bytesSent = channel.send(buf, new InetSocketAddress("jenkov.com", 80));
```



## Selector

NIO 三大组件就剩Selector了，**Selector建立在<font color='red'>非阻塞</font>的基础之上**，大家经常听到的 **多路复用** 在 Java 世界中指的就是它，用于<font color='red'>**实现一个线程管理多个 Channel**</font>。

- 首先，我们开启一个selector。你们爱翻译成**选择器**也好，**多路复用器**也好。

  ```java
  Selector selector = Selector.open();
  ```

- 将channel 注册到 Selector上。前面我们说了，Selector 建立在非阻塞模式之上，所以注册到 Selector 的 Channel 必须要支持非阻塞模式，**FileChannel 不支持非阻塞**，我们这里讨论最常见的 SocketChannel 和 ServerSocketChannel。

  ```java
  // 将通道设置为非阻塞模式，因为默认都是阻塞模式的
  channel.configureBlocking(false);
  // 注册
  SelectionKey key = channel.register(selector, SelectionKey.OP_READ);
  ```

register方法的第二个int 型参数（使用二进制的标志位）用于表明需要监听那些感兴趣的事件，共以下四种事件：

- SelectionKey.OP_READ

  ```java
  对应 00000001，通道中有数据可以进行读取
  ```

- SelectionKey.OP_WRITE

  ```
  对应 00000100，可以往通道中写入数据
  ```

- SelectionKey.OP_CONNECT

  ```
  对应 00001000，成功建立 TCP 连接
  ```

- SelectionKey.OP_ACCEPT

  ```
  对应 00010000，接受 TCP 连接
  ```

  我们可以同时监听一个Channel中的发生的多个事件，比如我们要监听ACCEPT 和 READ事件，那么指定参数为二进制的 000**1**000**1** 即十进制数值 17 即可。

  注册方法返回值是 SelectionKey实例，它包含了 Channel 和 Selector 信息，也包括了一个叫做 Interest Set 的信息，即我们设置的我们感兴趣的正在监听的事件集合。

  

- 调用select() 方法获取通道信息。用于判断是否有我们感兴趣的事件已经发生了。

  Selector 的操作就是以上 3 步，这里来一个简单的示例，大家看一下就好了。之后在介绍非阻塞 IO 的时候，会演示一份可执行的示例代码。

```java
Selector selector = Selector.open();
channel.configureBlocking(false);
SelectionKey key = channel.register(selector, SelectionKey.OP_READ);
while(true) {
  // 判断是否有事件准备好
  int readyChannels = selector.select();
  if(readyChannels == 0) continue;
  // 遍历
  Set<SelectionKey> selectedKeys = selector.selectedKeys();
  Iterator<SelectionKey> keyIterator = selectedKeys.iterator();
  while(keyIterator.hasNext()) {
    SelectionKey key = keyIterator.next();
    if(key.isAcceptable()) {
        // a connection was accepted by a ServerSocketChannel.
    } else if (key.isConnectable()) {
        // a connection was established with a remote server.
    } else if (key.isReadable()) {
        // a channel is ready for reading
    } else if (key.isWritable()) {
        // a channel is ready for writing
    }
    keyIterator.remove();
  }
}
```

对于Selector，我们还需要非常熟悉以下几个方法：

- **select()**

​	调用此方法，会将**上次select之后**的准备好的channel 对应的selectionKey 复制到 selected set中。如果没有任何通道准备好，这个方法会阻塞，直到至少有一个通道准备好。

- **selectNow()**

​	功能和 select 一样，<font color='red'>**区别在于如果没有准备好的通道，那么此方法会立即返回 0**。</font>

- **select(long timeout)**

看了前面两个，这个应该很好理解了，如果没有通道准备好，此方法会等待一会

- **wakeup()**

这个方法是用来唤醒等待在select() 和 select（timeout）上的线程的。如果wakeup()先被调用，此时没有线程在 select 上阻塞，那么之后的一个 select() 或 select(timeout) 会立即返回，而不会阻塞，当然，它只会作用一次。





## NIO VS BIO

### 1.Stream VS channel

- stream 不会自动缓冲数据，channel会利用系统提供的发送缓冲区、接收缓冲区（更为底层）
- stream 仅支持阻塞API，channel同时支持阻塞、非阻塞API，网络channel可配合selector实现多路复用
- 二者均为全双工，即读写可以同时进行。



### 2.IO模型

同步阻塞、同步非阻塞、同步多路复用、异步阻塞（没有此情况）、异步非阻塞

* 同步：线程自己去获取结果（一个线程）
* 异步：线程自己不去获取结果，而是由其它线程送结果（至少两个线程）



当调用一次 channel.read 或 stream.read 后，会切换至操作系统内核态来完成真正数据读取，而读取又分为两个阶段，分别为：

* 等待数据阶段
* 复制数据阶段

![](markdown-img/NIO.assets/0033.png)

* 阻塞 IO

  ![](markdown-img/NIO.assets/0039.png)

* 非阻塞  IO

  ![](markdown-img/NIO.assets/0035.png)

* 多路复用

  ![](markdown-img/NIO.assets/0038.png)

* 信号驱动

* 异步 IO

  ![](markdown-img/NIO.assets/0037.png)

* 阻塞 IO vs 多路复用

  ![](markdown-img/NIO.assets/0034.png)

  ![](markdown-img/NIO.assets/0036.png)

### 3.零拷贝

#### 传统 IO 问题

传统的 IO 将一个文件通过 socket 写出

```java
File f = new File("helloword/data.txt");
RandomAccessFile file = new RandomAccessFile(file, "r");

byte[] buf = new byte[(int)f.length()];
file.read(buf);

Socket socket = ...;
socket.getOutputStream().write(buf);
```

内部工作流程是这样的：

![](markdown-img/NIO.assets/0024.png)

1. java 本身并不具备 IO 读写能力，因此 read 方法调用后，要从 java 程序的**用户态**切换至**内核态**，去调用操作系统（Kernel）的读能力，将数据读入**内核缓冲区**。这期间用户线程阻塞，操作系统使用 DMA（Direct Memory Access）来实现文件读，其间也不会使用 cpu

   > DMA 也可以理解为硬件单元，用来解放 cpu 完成文件 IO

2. 从**内核态**切换回**用户态**，将数据从**内核缓冲区**读入**用户缓冲区**（即 byte[] buf），这期间 cpu 会参与拷贝，无法利用 DMA

3. 调用 write 方法，这时将数据从**用户缓冲区**（byte[] buf）写入 **socket 缓冲区**，cpu 会参与拷贝

4. 接下来要向网卡写数据，这项能力 java 又不具备，因此又得从**用户态**切换至**内核态**，调用操作系统的写能力，使用 DMA 将 **socket 缓冲区**的数据写入网卡，不会使用 cpu



可以看到中间环节较多，java 的 IO 实际不是物理设备级别的读写，而是缓存的复制，底层的真正读写是操作系统来完成的

* 用户态与内核态的切换发生了 3 次，这个操作比较重量级
* 数据拷贝了共 4 次



#### NIO 优化

通过 DirectByteBuf 

* ByteBuffer.allocate(10)  HeapByteBuffer 使用的还是 java 内存
* ByteBuffer.allocateDirect(10)  DirectByteBuffer 使用的是操作系统内存

![](markdown-img/NIO.assets/0025.png)

大部分步骤与优化前相同，不再赘述。唯有一点：java 可以使用 DirectByteBuf 将堆外内存映射到 jvm 内存中来直接访问使用

* 这块内存不受 jvm 垃圾回收的影响，因此内存地址固定，有助于 IO 读写
* java 中的 DirectByteBuf 对象仅维护了此内存的虚引用，内存回收分成两步
  * DirectByteBuf 对象被垃圾回收，将虚引用加入引用队列
  * 通过专门线程访问引用队列，根据虚引用释放堆外内存
* 减少了一次数据拷贝，用户态与内核态的切换次数没有减少



进一步优化（底层采用了 linux 2.1 后提供的 sendFile 方法），java 中对应着两个 channel 调用 transferTo/transferFrom 方法拷贝数据

![](markdown-img/NIO.assets/0026.png)

1. java 调用 transferTo 方法后，要从 java 程序的**用户态**切换至**内核态**，使用 DMA将数据读入**内核缓冲区**，不会使用 cpu
2. 数据从**内核缓冲区**传输到 **socket 缓冲区**，cpu 会参与拷贝
3. 最后使用 DMA 将 **socket 缓冲区**的数据写入网卡，不会使用 cpu

可以看到

* 只发生了一次用户态与内核态的切换
* 数据拷贝了 3 次



进一步优化（linux 2.4）

![](D:/CodeResoure/黑马/Netty/讲义/img/0027.png)

1. java 调用 transferTo 方法后，要从 java 程序的**用户态**切换至**内核态**，使用 DMA将数据读入**内核缓冲区**，不会使用 cpu
2. 只会将一些 offset 和 length 信息拷入 **socket 缓冲区**，几乎无消耗
3. 使用 DMA 将 **内核缓冲区**的数据写入网卡，不会使用 cpu

整个过程仅只发生了一次用户态与内核态的切换，数据拷贝了 2 次。所谓的【零拷贝】，并不是真正无拷贝，而是在不会拷贝重复数据到 jvm 内存中，零拷贝的优点有

* 更少的用户态与内核态的切换
* 不利用 cpu 计算，减少 cpu 缓存伪共享
* 零拷贝适合小文件传输



### 5.3 AIO

AIO 用来解决数据复制阶段的阻塞问题

* 同步意味着，在进行读写操作时，线程需要等待结果，还是相当于闲置
* 异步意味着，在进行读写操作时，线程不必等待结果，而是将来由操作系统来通过回调方式由另外的线程来获得结果

> 异步模型需要底层操作系统（Kernel）提供支持
>
> * Windows 系统通过 IOCP 实现了真正的异步 IO
> * Linux 系统异步 IO 在 2.6 版本引入，但其底层实现还是用多路复用模拟了异步 IO，性能没有优势

#### 文件 AIO

先来看看 AsynchronousFileChannel

```java
@Slf4j
public class AioDemo1 {
    public static void main(String[] args) throws IOException {
        try{
            AsynchronousFileChannel s = 
                AsynchronousFileChannel.open(
                	Paths.get("1.txt"), StandardOpenOption.READ);
            ByteBuffer buffer = ByteBuffer.allocate(2);
            log.debug("begin...");
            s.read(buffer, 0, null, new CompletionHandler<Integer, ByteBuffer>() {
                @Override
                public void completed(Integer result, ByteBuffer attachment) {
                    log.debug("read completed...{}", result);
                    buffer.flip();
                    debug(buffer);
                }

                @Override
                public void failed(Throwable exc, ByteBuffer attachment) {
                    log.debug("read failed...");
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
        }
        log.debug("do other things...");
        System.in.read();
    }
}
```

输出

```
13:44:56 [DEBUG] [main] c.i.aio.AioDemo1 - begin...
13:44:56 [DEBUG] [main] c.i.aio.AioDemo1 - do other things...
13:44:56 [DEBUG] [Thread-5] c.i.aio.AioDemo1 - read completed...2
         +-------------------------------------------------+
         |  0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f |
+--------+-------------------------------------------------+----------------+
|00000000| 61 0d                                           |a.              |
+--------+-------------------------------------------------+----------------+
```

可以看到

* 响应文件读取成功的是另一个线程 Thread-5
* 主线程并没有 IO 操作阻塞



#### 💡 守护线程

默认文件 AIO 使用的线程都是守护线程，所以最后要执行 `System.in.read()` 以避免守护线程意外结束



#### 网络 AIO

```java
public class AioServer {
    public static void main(String[] args) throws IOException {
        AsynchronousServerSocketChannel ssc = AsynchronousServerSocketChannel.open();
        ssc.bind(new InetSocketAddress(8080));
        ssc.accept(null, new AcceptHandler(ssc));
        System.in.read();
    }

    private static void closeChannel(AsynchronousSocketChannel sc) {
        try {
            System.out.printf("[%s] %s close\n", Thread.currentThread().getName(), sc.getRemoteAddress());
            sc.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static class ReadHandler implements CompletionHandler<Integer, ByteBuffer> {
        private final AsynchronousSocketChannel sc;

        public ReadHandler(AsynchronousSocketChannel sc) {
            this.sc = sc;
        }

        @Override
        public void completed(Integer result, ByteBuffer attachment) {
            try {
                if (result == -1) {
                    closeChannel(sc);
                    return;
                }
                System.out.printf("[%s] %s read\n", Thread.currentThread().getName(), sc.getRemoteAddress());
                attachment.flip();
                System.out.println(Charset.defaultCharset().decode(attachment));
                attachment.clear();
                // 处理完第一个 read 时，需要再次调用 read 方法来处理下一个 read 事件
                sc.read(attachment, attachment, this);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void failed(Throwable exc, ByteBuffer attachment) {
            closeChannel(sc);
            exc.printStackTrace();
        }
    }

    private static class WriteHandler implements CompletionHandler<Integer, ByteBuffer> {
        private final AsynchronousSocketChannel sc;

        private WriteHandler(AsynchronousSocketChannel sc) {
            this.sc = sc;
        }

        @Override
        public void completed(Integer result, ByteBuffer attachment) {
            // 如果作为附件的 buffer 还有内容，需要再次 write 写出剩余内容
            if (attachment.hasRemaining()) {
                sc.write(attachment);
            }
        }

        @Override
        public void failed(Throwable exc, ByteBuffer attachment) {
            exc.printStackTrace();
            closeChannel(sc);
        }
    }

    private static class AcceptHandler implements CompletionHandler<AsynchronousSocketChannel, Object> {
        private final AsynchronousServerSocketChannel ssc;

        public AcceptHandler(AsynchronousServerSocketChannel ssc) {
            this.ssc = ssc;
        }

        @Override
        public void completed(AsynchronousSocketChannel sc, Object attachment) {
            try {
                System.out.printf("[%s] %s connected\n", Thread.currentThread().getName(), sc.getRemoteAddress());
            } catch (IOException e) {
                e.printStackTrace();
            }
            ByteBuffer buffer = ByteBuffer.allocate(16);
            // 读事件由 ReadHandler 处理
            sc.read(buffer, buffer, new ReadHandler(sc));
            // 写事件由 WriteHandler 处理
            sc.write(Charset.defaultCharset().encode("server hello!"), ByteBuffer.allocate(16), new WriteHandler(sc));
            // 处理完第一个 accpet 时，需要再次调用 accept 方法来处理下一个 accept 事件
            ssc.accept(null, this);
        }

        @Override
        public void failed(Throwable exc, Object attachment) {
            exc.printStackTrace();
        }
    }
}
```





