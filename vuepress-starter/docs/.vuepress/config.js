module.exports = {
  // 导航栏logo
  themeConfig: {
    logo: '/assets/img/logo.png',
    //displayAllHeaders: true,
    nav: [
      { text: 'Home', link: '/' },
      // 可指定链接跳转模式：默认target: '_blank'新窗口打开，_self当前窗口打开
      // 对应blog/fontend/README.md
      { text: '前端', link: '/blog/fontend/' },
      { text: '后端', link: '/blog/backend/' },
      // 支持嵌套,形成下拉式的导航菜单
      {
        text: '语言',
        ariaLabel: 'Language Menu',
        items: [
          { text: '中文', link: '/language/chinese/' },
          { text: '英文', link: '/language/english/' }
        ]
      },
      {
        text: '更多',
        items: [
          { text: 'vue官网', link: 'https://cn.vuejs.org/' },
          { text: 'vuepress官网', link: 'https://vuepress.vuejs.org/zh/' },
          { text: 'GitHub', link: 'https://github.com/' },
          { text: '百度', link: 'https://www.baidu.com', target: '_blank' },
          { text: 'CSDN', link: 'https://blog.csdn.net', target: '_blank' }
        ]
      }
    ],
    sidebar: 'auto',
    sidebar: [
      {
        title: '后端',   // 必要的
        path: '/blog/backend/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        //collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
          '/blog/backend/java',
          '/blog/backend/spring',
          '/blog/backend/springboot',
          '/blog/backend/springcloud'
        ]
      },
      {
        title: '前端',   // 必要的
        path: '/blog/fontend/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        //collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1,    // 可选的, 默认值是 1
        children: [
        ]
      }
    ]
  },
  lastUpdated: 'Last Updated',
  title: '欢迎使用',
  description: 'Just playing around'
}