module.exports = {
    // 导航栏logo
    themeConfig: {
        logo: '/assets/img/logo.png',
        //displayAllHeaders: true,
        nav: [
            {text: 'Home', link: '/'},
            // 可指定链接跳转模式：默认target: '_blank'新窗口打开，_self当前窗口打开
            // 对应blog/fontend/README.md
            {text: '前端', link: '/blog/fontend/'},
            {text: '后端', link: '/blog/backend/'},
            {text: '我的博客', link: 'http://120.76.204.102/'},
            // 支持嵌套,形成下拉式的导航菜单
            {
                text: '语言',
                ariaLabel: 'Language Menu',
                items: [
                    {text: '中文', link: '/'},
                    {text: '英文(尚未开发)', link: '/language/english/'}
                ]
            },
            {
                text: '更多',
                items: [
                    {text: 'vue官网', link: 'https://cn.vuejs.org/'},
                    {text: 'vuepress官网', link: 'https://vuepress.vuejs.org/zh/'},
                    {text: 'GitHub', link: 'https://github.com/'},
                    {text: 'CSDN', link: 'https://blog.csdn.net', target: '_blank'}
                ]
            }
        ],
        sidebar: 'auto',
        sidebar: [
            {
                title: '后端',   // 必要的
                path: '/blog/backend/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                //collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 2,    // 可选的, 默认值是 1
                children: [
                    {
                        title: 'JAVA学习手册',
                        path: '/blog/backend/java/head',
                        sidebarDepth: 2,
                        children: [
                            {
                                title: 'JAVA SE基础内容',
                                path: '/blog/backend/java/JavaSE_head',
                                sidebarDepth: 2,
                                children: [
                                    '/blog/backend/java/JavaSE1',
                                    '/blog/backend/java/JavaSE2',
                                    '/blog/backend/java/JavaSE3',
                                    '/blog/backend/java/JavaSE4',
                                    '/blog/backend/java/JavaSE5',
                                    '/blog/backend/java/JavaSE6',
                                    '/blog/backend/java/JavaSE7',
                                    '/blog/backend/java/JavaSE8',
                                    '/blog/backend/java/java',
                                ]
                            },
                            {
                                title: 'JAVA JVM虚拟机',
                                path: '/blog/backend/java/JavaJVM_head',
                                sidebarDepth: 2,
                                children: [
                                    '/blog/backend/java/JavaJVM1',
                                    '/blog/backend/java/JavaJVM2',
                                    '/blog/backend/java/JavaJVM3',
                                ]
                            },
                            {
                                title: 'JAVA JUC并发编程',
                                path: '/blog/backend/java/JavaJUC_head',
                                sidebarDepth: 2,
                                children: [
                                    '/blog/backend/java/JavaJUC1',
                                    '/blog/backend/java/JavaJUC2',
                                    '/blog/backend/java/JavaJUC3',
                                ]
                            },
                            {
                                title: 'JAVA NIO网络编程',
                                path: '/blog/backend/java/JavaNIO_head',
                                sidebarDepth: 2,
                                children: [
                                    '/blog/backend/java/JavaNIO1',
                                    '/blog/backend/java/JavaNIO2',
                                ]
                            },
                            {
                                title: 'JAVA设计模式',
                                path: '/blog/backend/java/JavaDP_head',
                                sidebarDepth: 2,
                                children: [
                                    '/blog/backend/java/JavaDP1',
                                    '/blog/backend/java/JavaDP2',
                                    '/blog/backend/java/JavaDP3',
                                    '/blog/backend/java/JavaDP4',
                                ]
                            },
                        ]
                    },
                    {
                        title: 'JavaWeb',
                        path: '/blog/backend/JavaWeb/JavaWeb_head',
                        children: [
                            '/blog/backend/JavaWeb/JavaWeb 网站开发 - JavaWeb 笔记（一）Java网络编程',
                            '/blog/backend/JavaWeb/JavaWeb 网站开发 - JavaWeb 笔记（二）数据库基础',
                            '/blog/backend/JavaWeb/JavaWeb 网站开发 - JavaWeb 笔记（三）Java与数据库',
                            '/blog/backend/JavaWeb/JavaWeb 网站开发 - JavaWeb 笔记（四）前端基础',
                            '/blog/backend/JavaWeb/JavaWeb 网站开发 - JavaWeb 笔记（五）后端开发',
                        ]
                    },
                    {
                        title: 'JAVA杂谈',
                        path: '/blog/backend/Framework/java2',
                        children: [
                            '/blog/backend/Framework/其他内容 - [扩展篇] Java 9-17新特性介绍',
                            '/blog/backend/Framework/其他内容 - [扩展篇] JavaSE关键字总结 笔记',
                            '/blog/backend/Framework/framework'
                        ]
                    },
                    {
                        title: 'JavaSSM学习手册',
                        path: '/blog/backend/spring/spring_head',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/spring/JavaSSM1',
                            '/blog/backend/spring/JavaSSM2',
                            '/blog/backend/spring/JavaSSM3',
                        ]
                    },
                    {
                        title: 'SpringBoot学习手册',
                        path: '/blog/backend/springboot/springboot_head',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/springboot/SpringBoot1',
                            '/blog/backend/springboot/SpringBoot2',
                            '/blog/backend/springboot/SpringBoot3',
                            '/blog/backend/springboot/SpringBoot4',
                            '/blog/backend/springboot/springnote'
                        ]
                    },
                    {
                        title: 'springcloud学习手册',
                        path: '/blog/backend/springcloud/springcloud_head',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/springcloud/SpringCloud1',
                            '/blog/backend/springcloud/SpringCloud2',
                            '/blog/backend/springcloud/SpringCloud3',
                            '/blog/backend/springcloud/SpringCloud4',
                            '/blog/backend/springcloud/Eureka',
                            '/blog/backend/springcloud/nacos',
                            '/blog/backend/springcloud/Feign',
                            '/blog/backend/springcloud/Gatway',
                            '/blog/backend/springcloud/Docker',
                            '/blog/backend/springcloud/RabbitMQ',
                            '/blog/backend/springcloud/Elasticsearch',
                        ]
                    },
                    {
                        title: '数据库',
                        path: '/blog/backend/Database/database',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/Database/redis',
                            '/blog/backend/Database/MySQL进阶'
                        ]
                    }
                    //'/blog/backend/springcloud',
                ]
            },
            {
                title: '前端',   // 必要的
                path: '/blog/fontend/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                //collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 1,    // 可选的, 默认值是 1
                children: []
            }
        ]
    },
    lastUpdated: 'Last Updated',
    title: '欢迎使用',
    description: 'Just playing around'
}