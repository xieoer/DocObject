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
                        path: '/blog/backend/java/java',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/java/java',
                            '/blog/backend/java/JavaDP1',
                            '/blog/backend/java/JavaDP2',
                            '/blog/backend/java/JavaDP3',
                            '/blog/backend/java/JavaDP4',
                        ]
                    },
                    '/blog/backend/spring/spring',
                    {
                        title: 'springboot学习手册',
                        path: '/blog/backend/springboot/springboot',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/springboot/springnote'
                        ]
                    },
                    {
                        title: 'springcloud学习手册',
                        path: '/blog/backend/springcloud/springcloud_head',
                        sidebarDepth: 2,
                        children: [
                            '/blog/backend/springcloud/Eureka',
                            '/blog/backend/springcloud/nacos',
                            '/blog/backend/springcloud/Feign',
                            '/blog/backend/springcloud/Gatway',
                            '/blog/backend/springcloud/Docker',
                            '/blog/backend/springcloud/RabbitMQ',
                            '/blog/backend/springcloud/Elasticsearch',
                        ]
                    },
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