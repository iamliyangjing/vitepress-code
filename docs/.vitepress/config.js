import {defineConfig} from 'vitepress'

export default defineConfig({
    base: '',
    title: 'heapStack博客',
    description: '一名学习三年后端的程序员博客',
    appearance: true,
    ignoreDeadLinks: true,
    //中英文
    lang:'zh-CN',
    //文档更新时间
    lastUpdated: true,
    markdown:{
        //代码块的颜色
        theme:'github-dark',
        //代码块的行数
        lineNumbers:true
    },
    titleTemplate: '博客',
    themeConfig:{
    //    logo 图标
        logo: '/logo.svg',
        nav:[
            {text:'首页',link:'/'},
            {text:'Java',
                items: [
                    { text: '基础知识', link: 'java/basic-know' },
                    { text: '集合', link: 'java/collection.md' },
                    { text: 'IO', link: 'java/io' },
                    { text: '并发', link: 'java/concurrent' },
                    { text: 'Java8新特性', link: 'java/new-feature' },
                    { text: 'JVM', link: 'java/jvm' },
                    { text: 'JavaFX', link: 'java/JavaFx/index' },
                ]
            },
            {text:'Spring',
                items: [
                    { text: 'Spring', link: 'spring/spring' },
                    { text: 'Mybatis', link: 'spring/mybatis' },
                    { text: 'Spring-cloud', link: 'spring/cloud' },
                ]
            },
            {text:'数据库',
                items: [
                    { text: 'MySQL', link: 'database/mysql/index' },
                    { text: 'Redis', link: 'database/redis' },
                ]
            },
            {text:'面向对象',link:'/design'},
            {text:'中间件',
                items: [
                    { text: 'rabbitmq', link: 'mq/rabbitmq/' },
                    { text: 'rocket-mq', link: 'mq/rocketmq/' },
                    { text: 'kafka', link: 'mq/kafka' },
                    { text: 'netty', link: 'mq/netty' },
                ]
            },
            {text:'运维',
                items: [
                    { text: 'docker', link: 'operation/docker' },
                    { text: '服务器', link: 'operation/plugins' },
                    { text: 'K8s', link: 'operation/k8s' },
                ]
            },
            {text:'前端',
                items: [
                    { text: 'html', link: 'frontend/html/' },
                    { text: 'css', link: 'frontend/css/' },
                    { text: 'js', link: 'frontend/js/' },
                ]
            },
            {text:'408',
                items: [
                    { text: '计算机网络', link: '408/internet/' },
                    { text: '操作系统', link: '408/cs/' },
                    { text: '数据结构与算法', link: '408/alg/' },
                ]
            },
            {text:'读书笔记',link:'/book'},
            {text:'关于',link:'/about/' },
        ],
        //单项侧边栏 当点击前端才显示侧边栏
        sidebar:{
            '/frontend/js':[
                {
                    text: 'JavaScript教程',
                    //是否可以折叠
                    collapsible:true,
                    collapsed:false,
                    items: [
                        {
                            text: 'JavaScript基础学习',
                            link: '/frontend/JS/index'
                        },
                        {
                           text: 'JavaScript高级学习',
                           link:'/frontend/JS/advanced'
                        }
                    ]
                }
            ],
            // kafka
            '/mq/kafka':[
                {
                    text: 'Kafka入门',
                    //是否可以折叠
                    collapsible:true,
                    collapsed:false,
                    items: [
                        {
                            text: '概述',
                            link: 'mq/kafka/rumen'
                        },
                        {
                            text: '生产者',
                            link:'mq/kafka/producer.md'
                        },
                        {
                            text: '消费者',
                            link:'mq/kafka/consumer.md'
                        },
                        {
                            text: 'broker',
                            link:'mq/kafka/broker.md'
                        },
                        {
                            text: '外部系统集成',
                            link:'mq/kafka/outersys.md'
                        },
                        {
                            text: '生产调优手册',
                            link: 'mq/kafka/tiaoyou'
                        },
                        {
                            text: '源码解析',
                            link:'mq/kafka/originalcode'
                        }
                    ]
                }
            ],
            'java/JavaFx/index':[
                {
                    text: 'JavaFx',
                    //是否可以折叠
                    collapsible:true,
                    collapsed:false,
                    items: [
                        {
                            text: '组件',
                            link: 'java/JavaFx/组件'
                        },
                        {
                            text: 'UI',
                            link:'java/JavaFx/UI'
                        },
                        {
                            text: '事件',
                            link:'java/JavaFx/事件'
                        }
                    ]
                }
            ],
            //mysql
            'database/mysql/index':[
                {
                    text: '架构篇',
                    //是否可以折叠
                    collapsible:true,
                    collapsed:false,
                    items: [
                        {
                            text: '执行一条SQL查询，内部会发生什么？',
                            link: 'database/mysql/excutionSQLHappenWhat.md'
                        }
                    ]
                },
                {
                    text: '索引篇',
                    //是否可以折叠
                    collapsible:true,
                    collapsed:false,
                    items: [
                        {
                            text: '索引的构成',
                            link: 'database/mysql/indexOfBuilder.md'
                        },
                        {
                            text: '索引的分类',
                            link: 'database/mysql/indexOfSort.md'
                        },
                        {
                            text: '索引的优化方法',
                            link: 'database/mysql/indexOptimization.md'
                        },
                        {
                            text: '索引失效情况',
                            link: 'database/mysql/indexFailure.md'
                        },
                        {
                            text: '为什么选用B+树作为索引',
                            link: 'database/mysql/indexWhyB+.md'
                        }
                    ]
                }
            ]
        },
        socialLinks:[
            {icon:"github",link:"www.baidu.com"}
        ],
        footer: {
            message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
            copyright: 'Copyright © 2019-present <a href="https://github.com/yyx990803">Evan You</a>'
        }
    }
})
