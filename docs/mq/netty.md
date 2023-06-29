> Netty 是什么？

可以基于三个点来说：

1. 是一个基于<font color='red'>**NIO模型的高性能网络通信**</font>，可以认为他是对NIO网络模型的一个封住，提供一个简单易用的API
2. Netty在NIO的基础上，做了很多优化，比如<font color='red'>**零拷贝机制、高性能无锁队列、内存池**</font>
3. Netty支持很多的通信协议，比如**HTTP、WebSocket**等，并且针对**数据通信拆包粘包问题做了处理**

>  为什么使用Netty?

Netty 相比于直接去使用JDK自带的NIO相关API来更简单，它具有一下特点：

1. **统一的API，支持多种传输类型（阻塞、非阻塞、以及epoll、poll等模型）** 
2. **可以使用非常少的代码来实现多线程Reactor模型以及主从多线程Reactor模型**  
3. **自带编解码器**
4. **自带各种通信协议**
5. **Netty相对于直接使用JAVA NIO 有更高的吞吐量、更低的资源消耗、更低的延迟和更少的内存赋值** 
6. **安全性很好、有SSL、TLS支持**
7. **社区活跃度好（Dubbo、Zookeeper、Rocketmq）**

> Netty可以用来做什么？

之所以用Netty，核心的点还是在于<font color='red'>**服务器如何去承载更多的用户同时访问的问题**</font>，传统的BIO模型，由于它阻塞的特效，在高并发的场景很难去支持高吞吐量，虽然JAVA NIO 可以多路复用提供吞吐量，但是它的API对初学者不够友好，**而Netty的API 成熟简单易用，是基于NIO的封住，使用和学习成本低**



>Netty 核心组件了解吗？分别有什么作用？

Netty有三层结构组成的：

1. 网络通信层
2. 事件调度层
3. 服务编排层





## 1、网络通信层

Bootstrap：客户端启动，连接远程的NettyServe

ServerBootStrap：服务端监听、监听指定端口

Channel：负责网络通信的一个载体，



## 2、事件调度器

EventLoopGroup：线程池、负责接收IO请求、分配线程处理请求

EventLoop：线程池里面的一个具体线程



## 3、服务编排层

1. channelpipeline：负责处理多个channelhandler
2. channelhandler：针对IO数据的一个处理器，数据接收后，通过指定的一个Handler进行处理
3. channelhandlerContext：用来保存channelhandler的一个上下文信息的



> Netty里面有哪几种线程模型

三种

1. 单线程单Reactor模型
2. 多线程单Reactor模型
3. 多线程多Reactor模型（主从Reactor模型）



**Reactor模型有三个重要的组件：**

1. Reactor：负责将IO事件分配给对应的Handler
2. Acceptor：处理客户端的连接请求
3. handlers：去执行我们的业务逻辑的读写操作



## 1.单线程单Reactor模型

![image-20230107013759555](markdown-img/netty.assets/image-20230107013759555.png)







## 2.多线程单Reactor模型

![image-20230107013829212](markdown-img/netty.assets/image-20230107013829212.png)



## 3.多线程多Reactor模型

![image-20230107013911010](markdown-img/netty.assets/image-20230107013911010.png)
