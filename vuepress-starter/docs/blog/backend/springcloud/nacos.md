# nacos注册中心
## 使用
### 1下载安装包

在Nacos的GitHub页面，提供有下载链接，可以下载编译好的Nacos服务端或者源代码：

GitHub主页：<a href='https://github.com/alibaba/nacos'>https://github.com/alibaba/nacos</a>

GitHub的Release下载页：<a href='https://github.com/alibaba/nacos/releases'>https://github.com/alibaba/nacos/releases</a>

### 2.解压
将这个包解压到任意非中文目录

<img src='/assets/img/nacos/nacos01.png'>

-------------------------------------

<img src='/assets/img/nacos/nacos02.png'>

目录说明：
- bin：启动脚本
- conf：配置文件

### 3.端口配置
Nacos的默认端口是8848，如果你电脑上的其它进程占用了8848端口，请先尝试关闭该进程。
如果无法关闭占用8848端口的进程，也可以进入nacos的conf目录，修改配置文件中的端口：

<img src='/assets/img/nacos/nacos03.png'>

<img src='/assets/img/nacos/nacos04.png'>

### 4.启动
启动非常简单，进入bin目录，然后执行命令即可：
``` 
  startup.cmd -m standalone
```
### 5.访问
在浏览器输入地址：<a href='http://192.168.244.72:8890/nacos/index.html'>http://192.168.244.72:8890/nacos/index.html</a>

（8848默认端口，根据自己修改的端口访问）

输入账号和密码，默认的账号和密码都是nacos

<img src='/assets/img/nacos/nacos05.png'>

-----------------------------------

<img src='/assets/img/nacos/nacos06.png'>

### 6.nacos依赖
父工程：
``` xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-dependencies</artifactId>
    <version>2.2.5.RELEASE</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```
客户端：
``` xml
<!-- nacos客户端依赖包 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```
## nacos服务多级存储模型
### 配置集群
1.修改application.yml
``` yaml
spring:
  application:
    name: userservice  #服务名称
  cloud:
    nacos:
      server-addr: localhost:8890  #nacos服务地址
      discovery:
        cluster-name: SH  #nacos集群名称
```
### 负载均衡
2.然后在服务消费者中设置负载均衡的IRule为NacosRule，这个规则优先会寻找与自己通集群的服务：
``` yaml
userservice:
  ribbon:
    NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule   #nacos
```
:::tip
注意将userservice的权重值都设置为1
:::

## 服务实例的权重设置

<img src='/assets/img/nacos/nacos07.png'>

-----------------------------------

<img src='/assets/img/nacos/nacos08.png'>

-----------------------------------

<img src='/assets/img/nacos/nacos09.png'>

:::tip
权重值越小被访问的概率就越小
:::

## 环境隔离

<img src='/assets/img/nacos/nacos10.png'>

-----------------------------------

<img src='/assets/img/nacos/nacos11.png'>

-----------------------------------

<img src='/assets/img/nacos/nacos12.png'>

在配置类中添加namespace
``` yaml
spring:
  application:
    name: userservice  #服务名称
  cloud:
    nacos:
      server-addr: localhost:8890  #nacos服务地址
      discovery:
        cluster-name: SH  #nacos集群名称
        namespace: 83505ac9-0337-4dbf-8fea-d72e58240c7b
```

## nacos注册中心细节

-----------------------------------

<img src='/assets/img/nacos/nacos13.png'>

:::tip
服务注册到nacos时，默认时临时实例，注册到Nacos时，可以选择注册为临时实例或者非临时实例，通过以下配置可以实现
:::

``` yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral:false
```

## 统一配置中心

-----------------------------------

<img src='/assets/img/nacos/nacos14.png'>

-----------------------------------

<img src='/assets/img/nacos/nacos15.png'>

先读取bootstrap.yml文件，该文件优先级大于其他配置文件，可以将nacos的地址及配置信息写在里面

### 导入nacos配置管理客户端依赖
``` xml
<!--nacos的配置管理依赖-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

### 在resource目录下添加一个bootstrap.yml文件，这个文件时引导文件，优先级高于application.yml
``` yml
spring:
  application:
    name: userservice
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: localhost:8890
      config:
        file-extension: yaml  #文件后缀名
```

<img src='/assets/img/nacos/nacos16.png'>

:::tip
Data Id与bootstrap.yml的nam，active，file-extension对应
:::

## 配置热更新
不需要重启服务器进行配置更新
### 第一种方式
``` java
@RefreshScope
public class UserController {
    @Value("${pattern.dateformat}")     //读取配置文件
    private String dateformat;
}
```
### 第二种方式
写一个配置类
``` java
@Data
@Component
@ConfigurationProperties(prefix = "pattern")
public class PatternProperties {
    private String dateformat;
}
```
装配
``` java
@Autowired
    private PatternProperties properties;
```
使用
``` java
properties.getDateformat()
```

### 读取配置文件的优先级

[服务名]-[spring.profile.active].yaml > [服务名].yaml > 本地配置

<img src='/assets/img/nacos/nacos17.png'>

## nacos集群
1.搭建mysql集群并初始化数据库表

2.下载解压nacos

3.修改集群配置（节点信息），数据库信息

4.分别启动多个nacos节点

5.nginx方向代理