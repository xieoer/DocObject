---
sidebarDepth: 2
---

# springcloud学习手册

<img src='/assets/img/weifuwu.png'>

## 单体结构，分布式结构的优缺点
#### 单体结构：简单方便，高耦合，扩展性差，适合小型项目
#### 分布式架构：松耦合，框架腹胀，难度大，适合大型互联网项目
#### 微服务：一种良好的分布式架构方案

    优点：拆分粒度更小，服务更独立，耦合度更低

    缺点：框架非常复杂，运维，监控，部署难度提高

## Eureka注册中心
<img src='/assets/img/eureka.png'>

#### 在Eureka架构中，微服务角色有两类
    EurekaServer：服务端，注册中心
        记录服务信息
        心跳监控
    EurekaClient：客户端
        Provider：服务提供者
            注册自己的信息到EurekaServer
            每隔30秒向EurekaServer发送心跳
        consumer：服务消费者
            根据服务名从EurekaServer拉取服务列表
            基于服务列表做负载均衡，选中一个微服务后发起远程调用

### 使用
### 1.搭建EurekaServer   
#### 引入eureka-server依赖
``` xml
<!--eureka-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```     
#### 添加@EnableEurekaServer注解
``` java
// 启动类
@EnableEurekaServer
@SpringBootApplication
public class EurekaApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
```
##### 在application.yml（配置文件）中配置eureka地址
``` yaml
server:
  port: 10086
spring:
  application:
    name: eurekaserver # eureka的服务名称
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10086/eureka
```
### 2.注册服务（服务提供者）
#### 引入eureka-client依赖
``` xml
<!--eureka-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```
#### 在application.xml中配置eureka地址
``` yaml
spring:
  appliaction:
  name: userserver # eureka的服务名称
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10086/eureka
```
### 3.服务发现（服务消费者）
#### 引入eureka-client依赖
``` xml
<!--eureka-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```
#### 在application.yml中配置eureka地址
``` yaml
spring:
  appliaction:
  name: orderserver # eureka的服务名称
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10086/eureka
```
#### 在RestTemplate添加@LoadBalanced
``` java
// 在启动类中注入
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```
#### 用服务提供者的服务名称远程调用
``` java
@Autowired
private RestTemplate restTemplate;

public Order queryOrderById(Long orderId) {
    // 1.查询订单
    Order order = orderMapper.findById(orderId);
    String url = "http://userserver/user/" + order.getUserId();
    User forObject = restTemplate.getForObject(url, User.class);
    order.setUser(forObject);
    // 4.返回
    return order;
}
```
### Ribbon负载均衡
<img src='/assets/img/ribbon.png'>

#### 负载均衡策略
##### 通过定义IRule实现可以修改负载均衡策略，有两种方式
##### 1.代码方式：在服务消费者的启动类中，定义一个新的IRule
``` java
//变更负载均衡策略
@Bean
public IRule randomRule(){
    return new RandomRule();
}
```
##### 2.配置文件方式：在服务消费者的配置文件中，添加新的配置就可以修改规则
``` yaml
#负载均衡规则
userservice:
  ribbon:
    NFLoadBalancerRuleClassName: com.betflix.loadbalancer.RandomRule  #负载均衡规则
```
::: tip
第一种是针对该服务对于其他所有服务实行的策略，第二种是该服务对于指定服务实行的策略
:::

## nacos
### 使用
#### 1下载安装包

在Nacos的GitHub页面，提供有下载链接，可以下载编译好的Nacos服务端或者源代码：

GitHub主页：<a href='https://github.com/alibaba/nacos'>https://github.com/alibaba/nacos</a>

GitHub的Release下载页：<a href='https://github.com/alibaba/nacos/releases'>https://github.com/alibaba/nacos/releases</a>

#### 2.解压
将这个包解压到任意非中文目录

<img src='/assets/img/nacos01.png'>

-------------------------------------

<img src='/assets/img/nacos02.png'>

目录说明：
- bin：启动脚本
- conf：配置文件

#### 3.端口配置
Nacos的默认端口是8848，如果你电脑上的其它进程占用了8848端口，请先尝试关闭该进程。
如果无法关闭占用8848端口的进程，也可以进入nacos的conf目录，修改配置文件中的端口：

<img src='/assets/img/nacos03.png'>

<img src='/assets/img/nacos04.png'>

#### 4.启动
启动非常简单，进入bin目录，然后执行命令即可：
``` 
  startup.cmd -m standalone
```
#### 5.访问
在浏览器输入地址：<a href='http://192.168.244.72:8890/nacos/index.html'>http://192.168.244.72:8890/nacos/index.html</a>

（8848默认端口，根据自己修改的端口访问）

输入账号和密码，默认的账号和密码都是nacos

<img src='/assets/img/nacos05.png'>

-----------------------------------

<img src='/assets/img/nacos06.png'>

#### 6.nacos依赖
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
### nacos服务多级存储模型
#### 配置集群
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
#### 负载均衡
2.然后在服务消费者中设置负载均衡的IRule为NacosRule，这个规则优先会寻找与自己通集群的服务：
``` yaml
userservice:
  ribbon:
    NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule   #nacos
```
:::tip
注意将userservice的权重值都设置为1
:::

### 服务实例的权重设置

<img src='/assets/img/nacos07.png'>

-----------------------------------

<img src='/assets/img/nacos08.png'>

-----------------------------------

<img src='/assets/img/nacos09.png'>

:::tip
权重值越小被访问的概率就越小
:::

### 环境隔离

<img src='/assets/img/nacos10.png'>

-----------------------------------

<img src='/assets/img/nacos11.png'>

-----------------------------------

<img src='/assets/img/nacos12.png'>

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

### nacos注册中心细节

-----------------------------------

<img src='/assets/img/nacos13.png'>

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

### 统一配置中心

-----------------------------------

<img src='/assets/img/nacos14.png'>

-----------------------------------

<img src='/assets/img/nacos15.png'>

先读取bootstrap.yml文件，该文件优先级大于其他配置文件，可以将nacos的地址及配置信息写在里面

#### 导入nacos配置管理客户端依赖
``` xml
<!--nacos的配置管理依赖-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

#### 在resource目录下添加一个bootstrap.yml文件，这个文件时引导文件，优先级高于application.yml
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

<img src='/assets/img/nacos16.png'>

:::tip
Data Id与bootstrap.yml的nam，active，file-extension对应
:::

### 配置热更新
不需要重启服务器进行配置更新
#### 第一种方式
``` java
@RefreshScope
public class UserController {
    @Value("${pattern.dateformat}")     //读取配置文件
    private String dateformat;
}
```
#### 第二种方式
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

#### 读取配置文件的优先级

[服务名]-[spring.profile.active].yaml > [服务名].yaml > 本地配置

<img src='/assets/img/nacos17.png'>

### nacos集群
1.搭建mysql集群并初始化数据库表

2.下载解压nacos

3.修改集群配置（节点信息），数据库信息

4.分别启动多个nacos节点

5.nginx方向代理

## 基于Feign的远程调用
### 定义和使用Feign客户端
#### 1.引入依赖
``` xml
<!--Feign-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```
#### 2.在服务消费者的启动类添加注解开启Feign的功能
``` java
@EnableFeignClients
```
#### 3.编写Feign客户端
``` java
@FeignClient("userservice")
public interface UserClient {
    @RequestMapping("/user/{id}")
    User findUserById(@PathVariable("id") Long id);
}
```
    服务器名称：userservice
    请求方式：GET
    请求路径：/user/{id}
    请求参数：Long id
    返回值类型：User
#### 4，使用
``` java
@Autowired
private UserClient userClient;

public Order queryOrderById(Long orderId) {
    // 1.查询订单
    Order order = orderMapper.findById(orderId);
    //feign远程调用
    User user = userClient.findUserById(order.getUserId());
    order.setUser(user);
    // 4.返回
    return order;
}
```
### 自定义Feign配置
#### 配置Feign日志
方式一：配置文件
``` yaml
feign:
  client:
    config:
      default:  #使用default进行全局配置
        loggerLevel: FULL #日志级别
```
``` yaml
feign:
  client:
    config:
      userservice:  #使用服务名称进行局部配置
        loggerLevel: FULL #日志级别
```
方式二：代码配置
先声明一个Bean
``` java
public class DefaultFeignConfiguration {
    @Bean
    public Logger.Level loggingLevel() {
        return Logger.Level.BASIC;
    }
}
```
修改注解
``` java
//如果是全局配置，修改以下注解（在启动类）
@EnableFeignClients(defaultConfiguration = FeignClientConfiguration.class)
```
``` java
//如果是局部配置，修改以下注解（在Feign客户端）
@FeignClient(value = "userservice",configuration = FeignClientConfiguration.class)
```
### Feign性能优化
    Feign底层客户端实现：
        URLConnection：默认实现，不支持连接池
        Apache HttpClient：支持连接池
        OKHttp：支持连接池
    优化Feign的性能主要包括：
        使用连接池代替默认的URLConnection
        日志级别，最好使用basic或者none（默认是none）
#### 添加HttpClient的支持
引入依赖（服务消费者）
``` xml
<!--HttpClient-->
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-httpclient</artifactId>
</dependency>
```
配置连接池
``` yaml
feign:
  httpclient:
    enabled: true
    max-connections: 200    #最大的连接数
    max-connections-per-route: 50   #每个路径的最大连接数
```
### Feign的最佳实践
方式一（继承）：给消费者的FeignClient和提供者的controller定义统一的父接口作为标准

<img src='/assets/img/feign.png'>

:::tip
不推荐使用，耦合度高
:::

方式二（抽取）：将FeignClient抽取为独立的模块，并且把接口有关的POJO，默认的Feign配置都放在这个模块中，提供给所有的服务消费者使用

<img src='/assets/img/feign2.png'>

    实现最佳实践方式二的步骤如下
    1.首先创建一个module，命名为feign-api，然后引入feign的starter依赖
    2.将order-service中编写的UserClient、User、DefaultFeignConfiguration都复制到feign-api项目中
    3.在order-service中引入feign-api的依赖
    <dependency>
        <groupId>cn.itcast.demo</groupId>
        <artifactId>feign-api</artifactId>
        <version>1.0</version>
    </dependency>
    4.修改order-service中的所有与上述三个组件有关的import部分，改成导入feign-api中的包

## Gateway网关
### 搭建网关
创建模块，引入依赖
``` xml
<!--网关依赖-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<!--nacos服务发现依赖-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```
启动类
``` java
@SpringBootApplication
public class GatewayApplication{
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```
配置文件
``` yaml
server:
  port: 10086
spring:
  application:
    name: gateway
  cloud:
    nacos:
      server-addr: localhost:8890
    gateway:
      routes:
        - id: user-service #路由标识，必须唯一
          uri: lb://userservice #路由的目标地址
          predicates:
            - Path=/user/** #路径断言，判断路径是否以user开头，如果是则符合
        - id: order-service
          uri: lb://orderservice
          predicates:
            - Path=/order/**
```
### 路由断言工厂
    我们在配置文件中写的断言规则只是字符串，
    这些字符串会被Predicate Fatory读取并处理，转变为路由判断的条件，
    例如Path=/user/**是按照路径匹配，
    这个规则是由
    org.springframework.cloud.gateway.handlerpredicate.PathRoutePredicateFactory类
    来处理的，像这样的断言工厂在SpringCloudGateway还有十几个

<a href="https://springdoc.cn/spring-cloud-gateway/#addrequestheader">SpringCloudGateway断言工厂</a>

如果要对所有的路由都生效，则可以将过滤器工厂写到default下
``` yaml
server:
  port: 10086
spring:
  application:
    name: gateway
  cloud:
    nacos:
      server-addr: localhost:8890
    gateway:
      routes:
        - id: user-service #路由标识，必须唯一
          uri: lb://userservice #路由的目标地址
          predicates:
            - Path=/user/** #路径断言，判断路径是否以user开头，如果是则符合
        - id: order-service
          uri: lb://orderservice
          predicates:
            - Path=/order/**
      default-filters: #默认过滤器，会对所有的请求路由都生效
        - AddRequestHeader=Truth, hello world!  #添加请求头
```
### 全局过滤器GlobalFilter
    全局过滤器的作用也是处理一切进入网关的请求和微服务响应，
    与GatewayFilter的作用一样区别在于GatewayFilter通过配置定义，处理逻辑是固定的。
    而GlobalFilter的逻辑需要自己写代码实现。定义方式是实现GlobalFilter接口。
例如
``` java
//@Order(-1)    //设置优先级
@Component
public class AuthorizeFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //获取请求参数
        ServerHttpRequest request = exchange.getRequest();
        MultiValueMap<String, String> queryParams = request.getQueryParams();
        //获取请求参数中的authorization参数
        String authorization = queryParams.getFirst("authorization");
        //判断阐述值是否等于admin
        if("admin".equals(authorization)){
            //放行
            return chain.filter(exchange);
        }
        //拦截
        //设置授权码
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        //请求拦截
        return exchange.getResponse().setComplete();
    }

    //优先级
    @Override
    public int getOrder() {
        return -1;
    }
}
```
:::tip
全局过滤器的作用是什么?

对所有路由都生效的过滤器，并且可以自定义处理逻辑

实现全局过滤器的步骤?

1.实现GlobalFilter接口

2.添加@Order注解或实现Ordered接口

3.编写处理逻辑
:::
### 过滤器执行顺序
    每一个过滤器都必须指定一个int类型的order值，order值越小，优先级越高，执行顺序越靠前。
    GlobalFilter通过实现Ordered接口，或者添加@Order注解来指定order值，
    由我们自己指定路由过滤器和defaultFilter的order由Spring指定，默认是按照声明顺序从1递增。
    当过滤器的order值一样时，会按照 defaultFilter > 路由过滤器 > GlobalFilter的顺序执行
### 跨域配置
网关处理跨域采用的同样是CORS方案，并且只需要简单配置即可实现
``` yaml
spring:
  cloud:
    gateway:
      globalcors: # 全局的跨域处理
        add-to-simple-url-handler-mapping: true # 解决options请求被拦截问题
        corsConfigurations:
          '[/**]':
            allowedOrigins: # 允许哪些网站的跨域请求
              - "http://localhost:8090"
              - "http://www.leyou.com"
            allowedMethods: # 允许的跨域ajax的请求方式
              - "GET"
              - "POST
              - "DELETE"
              - "PUT"
              - "OPTIONS"
            allowedHeaders: "*" # 允许在请求中携带的头信息
            allowCredentials: true # 是否允许携带cookie
            maxAge: 360000 # 这次跨域检测的有效期
```
## Docker
### Docker的作用
#### 解决依赖兼容问题
    Docker如何解决大型项目依赖关系复杂，不同组件依赖的兼容性问题?
    Docker允许开发中将应用、依赖、函数库、配置一起打包，形成可移植镜像
    Docker应用运行在容器中，使用沙箱机制，相互隔离
#### 解决不同系统的环境问题
    Docker如何解决开发、测试、生产环境有差异的问题
    Docker镜像中包含完整运行环境，包括系统函数库，
    仅依赖系统的Linux内核，因此可以在任意Linux操作系统上运行
#### Docker与虚拟机的差别
    docker是一个系统进程;虚拟机是在操作系统中的操作系统
    docker体积小、启动速度快、性能好;虚拟机体积大、启动速度慢、性能一般
### Docker架构
    镜像(lmage):Docker将应用程序及其所需的依赖、函数库、环境、配置等文件打包在一起，称为镜像。
    容器(Container):镜像中的应用程序运行后形成的进程就是容器，只是Docker会给容器做隔离，对外不可见。
    服务端:接收命令或远程请求，操作镜像或容器
    客户端:发送命令或者请求到Docker服务端
    DockerHub:一个镜像托管的服务器，类似的还有阿里云镜像服务，统称为DockerRegistry
### docker安装（linux）
#### 1.安装docker

首先需要虚拟机联网，安装yum工具

``` sh
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```

然后更新本地镜像源

``` sh
# 设置docker镜像源
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

yum makecache fast
```

然后输入命令
``` sh
yum install -y docker-ce
```
docker-ce为社区免费版本。稍等片刻，docker即可安装成功

#### 2.启动docker
Docker应用需要用到各种端口，逐一去修改防火墙设置。非常麻烦，因此建议直接关闭防火墙！
``` sh
# 关闭
systemctl stop firewalld
# 禁止开机启动防火墙
systemctl disable firewalld
# 查看防火墙状态
systemctl status firewalld
```
通过命令启动docker
``` sh
# 启动docker服务
systemctl start docker  
# 停止docker服务
systemctl stop docker  
# 重启docker服务
systemctl restart docker  
```
查看docker版本
``` sh
docker -v
```
配置镜像加速

<a href="https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors">阿里云的镜像加速文档</a>

``` sh
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://1vkiv6jt.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 镜像
<img src='/assets/img/docker01.png'>

    查看镜像：docker images
    
    导出镜像：docker save [OPTIONS] IMAGE [IMAGE...]
    例如：docker save -o image01.tar mysql:latest
    将mysql:latest镜像打包成image01.tar其中-o：输出到的文件

    删除镜像：docker rmi [OPTIONS] IMAGE [IMAGE...]
    例如：docker rmi image01（ 删除镜像image01）
    docker rmi image1 image2 image3（删除多个镜像）
    docker rmi -f image1（删除镜像，但保留其标签）
    
    导入镜像：docker load [OPTIONS]
    例如：docker load image01.tar

    拉取镜像：docker pull [镜像名]:[版本]
    可以去到dockerhub的官网查看各个镜像拉取的命令

:::tip
dockerhub官网可能无法访问，可以使用该网站<a href="https://hub-stage.docker.com/">https://hub-stage.docker.com/</a>
:::
    
### 自定义镜像
#### Dockerfile
    Dockerfile就是一个文本文件，其中包含一个个的指令(Instruction)，
    用指令来说明要执行什么操作来构建镜像。一个指令都会形成一层Layer。

| 指令   | 说明       | 示例   
| :-----: |:-----------:|:------------
|FROM|指定基础镜像|FROM centos:6
|ENV|设置环境变量|ENV key value
|COPY|拷贝本地文件到镜像的指定目录|COPY ./mysql-5.7.rpm /tmp
|RUN|执行Linux的shell命令，一般是安装过程的命令|RUN yum install gcc
|EXPOSE|指定容器运行时监听的端口，是给镜像使用者看的|EXPOSE 8080
|ENTRYPOINT|镜像中的启动命令，容器运行时调用|ENTRYPOINT java -jar xx.jar

#### 基于java:8-alpine镜像，将一个java项目构建为镜像
##### 新建一个空的目录，然后在目录中新建一个文件，命名为Dockerfile
##### 将打包好的jar包拷贝到目录下
##### 编写Dockerfile文件
``` sh
#指定基础镜像
FROM java:8-alpine

COPY ./docker-demo.jar /tmp/app.jar

#暴露端口
EXPOSE 8090

#入口，java项目的启动命令好
ENTRYPOINT java -jar /tmp/app.jar
```
##### 使用docker build命令构建镜像
进入项目目录，该目录下包含jar包和Dockerfile文件
```` sh
docker build -t javaweb:2.0 .
````
:::tip
最后有一个点，表示Dockerfile目录，因为是在当前目录，所以是一个点
:::
##### 使用docker run创建容器并运行

### 容器

<img src='/assets/img/docker02.png'>

    进入容器：docker exec [容器名]
    容器启动：docker start [容器名]
    停止容器：docker stop [容器名]
    查看日志：docker logs [容器名] -f
    查看所有容器运行状态：docker ps
    
#### 运行容器
``` sh
docker run --name [容器的名字，自己起] -p 80:80 -d [镜像名称]
```
:::tip
docker run:创建并运行容器
--name:给容器起名
-p:将宿主机端口与容器端口映射，冒号左侧时宿主端口，右侧是容器端口
-d:后台运行
:::

#### 进入容器
``` sh
docker exec -it [容器名称] bash
```
:::tip
-it:给当前进入的容器创建一个标准输入，输出终端，允许我们与容器交互
bash:进入容器后执行的命令，bash是一个linux终端交互命令
:::

### 数据卷
<img src='/assets/img/docker03.png'>

    数据卷（volume）是一个虚拟的目录，指向宿主机文件系统的某个目录
    
#### 数据卷操作语法
``` sh
docker volume [COMMAND]
```
:::tip
docker volume命令是数据卷操作，根据命令后跟随的command来确定下一步操作
create：创建一个volume
inspect：显示一个或多个volume的信息
ls：列出所有的数据卷
prune：删除未使用的volume
rm：删除一个或多个指定的数据卷
:::
#### 数据卷挂载案例

已知nginx的html目录所在位置/usr/share/nginx/html，我们需要把这个目录挂载到html这个数据卷上

``` sh
docker run --name [容器名] -v html:/usr/share/nginx/html -p 80:80 -d nginx
```

``` sh
#查看html数据卷所在位置
docker volume inspect html
#进入该目录
cd /var/lib/docker/volunes/html/_data
#修改文件
vi index.html
```

### DockerCompose
    Docker Compose可以基于Compose文件帮我们快速的部署分布式应用，而无需手动一个个创建和运行容器!
    Compose文件是一个文本文件，通过指令定义集群中的每个容器如何运行。
#### 安装DockerCompose
##### 1.Linux下需要通过命令下载
``` sh
# 安装
curl -L https://github.com/docker/compose/releases/download/1.23.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```
#### 2.修改文件权限
``` sh
# 修改权限
chmod +x /usr/local/bin/docker-compose
```

### 微服务集群DockerCompose部署

#### 将打包好的项目以及DockerCompose文件放在同一个目录下面

<img src='/assets/img/docker04.png'>

#### 将项目中的数据库，nacos地址都命名为docker-compose中的服务名
#### 使用maven打包工具，将项目中的每个微服务都打包成app.jar
#### 将打包好的app.jar拷贝到上述目录对应的子目录中
#### 将上述目录下的文件上传到虚拟机，利用docker-compose up -d来部署

:::tip
每个微服务的文件夹都有一个Dockerfile文件和该微服务的jar包
:::

<img src='/assets/img/docker05.png'>

##### Dockerfile文件

``` sh
FROM java:8-alpine
COPY ./app.jar /tmp/app.jar
ENTRYPOINT java -jar /tmp/app.jar
```
##### docker-compose.yml文件

``` sh
version: "3.2"

service:
  nacos:
    image: nacos/nacos-server
    environment:
      MODE: standalone
    ports:
      - "8848:8848"
  mysql:
    image:mysql:5.7.25
    environment:
      MYSQL_ROOT_PASSWORD:123  #密码
    volumes:
      - "$PWD/mysql/data:/var/lib/mysql"
      - "$PWD/mysql/conf:/etc/mysql/conf.d"
  userservice:
    build: ./user-service
  orderservice:
    build: ./order-service
  gateway:
    build: ./gateway
    ports: 
      - "10010:10010"
```
:::tip
在写微服务项目的时候，访问对应服务的地址就是docker-compose.yml文件中该服务的名称
:::

<img src='/assets/img/docker06.png'>

## 异步通讯
    同步与异步通讯的优缺点
    同步通讯时效性强，可以立即得到结果，
    但是耦合度高，性能和吞吐率能力低，有额外的资源消耗，有级联失败问题
    异步通讯耦合度低，吞吐量高，故障隔离，
    但依赖于Borker的可靠性，安全性，吞吐能力，架构复杂，业务没有明显的流程线，不好追踪管理

### MQ消息队列
    MQ(MessageQueue)，中文是消息队列，字面来看就是存放消息的队列。也就是事件驱动架构中的Broker。

|       |RabbitMQ|ActiveMQ|RocketMQ|kafka|
|:---:|:---:|:---:|:---:|:---:|
|公司/社区|Rabbit|Apache|阿里|Apache|
|开发语言|Erlang|Java|Java|Scala&Java|
|协议支持|AMQP,XMPP,</br>SMTP,STOMP|OpenWire,STOMP,REST,</br>XMPP,AMQP|自定义协议|自定义协议|
|可用性|高|一般|高|
|单机吞吐量|一般|差|高|高|非常高|
|消息延迟|微秒级|毫秒级|毫秒级|毫秒以内|
|消息可靠性|高|一般|高|一般|

### RabbitMQ

<img src='/assets/img/rabbitmq01.png'>

#### centos7使用docker安装RabbitMQ
#### 1.在线拉取
``` sh
docker pull rabbitmq
```
#### 2.安装mq
``` sh
docker run \
-e RABBITMQ_DEFAULT_USER=huang \
-e RABBITMQ_DEFAULT_PASS=123456 \
--name mq \
--hostname mq1 \
-p 15672:15672 \
-p 5672:5672 \
-d \
rabbitmq:latest
```
#### 3.进入容器
``` sh
docker exec -it 容器id /bin/bash
```
#### 4.打开管理界面
``` sh
rabbitmq-plugins enable rabbitmq_management
```
#### 5.访问
    主机ip:15672

<img src='/assets/img/rabbitmq02.png'>

#### RabbitMQ中的几个概念
    channel：操作MQ的工具
    exchange：路由消息到队列
    queue：缓存消息
    virtualhost：虚拟主机，是对queue，exchange等资源的逻辑分组

### SpringAMQP
#### 引入依赖
``` xml
<!--AMQP依赖，包含RabbitMQ-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```
#### 消息发送
配置文件（消息发送者和接收者都要配置）
``` yaml
logging:
  pattern:
    dateformat: MM-dd HH:mm:ss:SSS
spring:
  rabbitmq:
    host: 192.168.112.128     #服务地址
    port: 5672      
    username: huang     #账号
    password: 123456    #密码
    virtual-host: /     #虚拟主机
```
发送消息
``` java
public class PublisherTest {
    @Test
    public void testSendMessage() throws IOException, TimeoutException {
        // 1.建立连接
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.设置连接参数，分别是：主机名、端口号、vhost、用户名、密码
        factory.setHost("192.168.112.128");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("huang");
        factory.setPassword("123456");
        // 1.2.建立连接
        Connection connection = factory.newConnection();

        // 2.创建通道Channel
        Channel channel = connection.createChannel();

        // 3.创建队列
        String queueName = "simple.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.发送消息
        String message = "hello, rabbitmq!";
        channel.basicPublish("", queueName, null, message.getBytes());
        System.out.println("发送消息成功：【" + message + "】");

        // 5.关闭通道和连接
        channel.close();
        connection.close();

    }
}
```
编写消费逻辑（消息接收者）
``` java
public class SpringRabbitListener {
    @RabbitListener(queues = {"simple.queue"})
    public void listenSimpleQueue(String msg) throws InterruptedException {
        System.out.println("消费者接收到的消息：" + msg);
    }
}
```
### WorkQueue模型

<img src='/assets/img/rabbitmq03.png'>

#### 模拟WorkQueue，实现一个队列绑定多个消费者
基本思路如下:

1.在消息发送者的服务中定义测试方法，每秒产生50条消息，发送到simple.queue
``` java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringAmqpTest {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    public void demoSend2() throws InterruptedException {
        String queueName = "simple.queue";
        String message = "hello, rabbitmq__";
        for (int i = 0; i < 50; i++) {
            rabbitTemplate.convertAndSend(queueName, message + i);
            Thread.sleep(20);
        }
    }
}
```
2.在消息接收者的服务中定义两个消息监听者，都监听simple.queue队列
``` java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = {"simple.queue"})
    public void listenSimpleQueue(String msg) throws InterruptedException {
        System.out.println(msg);
        Thread.sleep(20);
    }
    @RabbitListener(queues = {"simple.queue"})
    public void listenSimpleQueue2(String msg) throws InterruptedException {
        System.err.println(msg);
        Thread.sleep(200);
    }
}
```
3.消费者1每秒处理50条消息，消费者2每秒处理10条消息

<img src='/assets/img/rabbitmq04.png'>

:::tip
发现：两个消费者平均分配消息，但是它们的处理速度不一样，导致处理速度较快的消费者分到的消息与处理速度较慢的消费者一致，整体的处理速度较慢。
这样的现象是WorkQueue模式里面的消息预取机制.
:::

4.修改消息接收者的配置文件
``` yaml
logging:
  pattern:
    dateformat: MM-dd HH:mm:ss:SSS
spring:
  rabbitmq:
    host: 192.168.112.128 # 主机名
    port: 5672  # 端口号
    username: huang  # 用户名
    password: 123456  # 密码
    virtual-host: /
    listener:
      simple:
        prefetch: 1 # 消费者每次只能获取一条消息，处理完毕再获取下一条
```
配置prefetch即可

### 发布（Publish）订阅（Subscribe）模型
    发布订阅模式与之前案例的区别就是允许将同一消息发送给多个消费者。实现方式是加入了exchange(交换机)
    常见exchange类型包括:
    Fanout:广播
    Direct:路由
    Topic: 话题
    exchange负责消息路由，而不是存储，路由失败则消息丢失
#### (1)FanoutExchange
#### Fanout Exchange 会将接收到的消息路由到每一个跟其绑定的queue

<img src='/assets/img/rabbitmq05.png'>

#### 交换机绑定队列
``` java
@Configuration
public class FanoutConfig {
    // huang.fanout 交换机
    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange("huang.fanout");
    }

    // huang.queue1 队列1
    @Bean
    public Queue fanoutQueue1() {
        return new Queue("huang.queue1");
    }

    // huang.queue2 队列2
    @Bean
    public Queue fanoutQueue2() {
        return new Queue("huang.queue2");
    }

    // 绑定队列1
    @Bean
    public Binding fanoutBind(Queue fanoutQueue1,FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    // 绑定队列2
    @Bean
    public Binding fanoutBind2(Queue fanoutQueue2,FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(fanoutQueue2).to(fanoutExchange);
    }
}
```
#### 消息发送
``` java
@Test
public void demoSend3() throws InterruptedException {
    String exchangeName = "huang.fanout";
    String message = "hello, rabbitmq__";
    rabbitTemplate.convertAndSend(exchangeName, "", message);
    Thread.sleep(20);
}
```
#### 消息接收
``` java
@RabbitListener(queues = {"huang.queue1"})
public void listenSimpleQueue3(String msg) throws InterruptedException {
    System.out.println(msg);
    Thread.sleep(20);
}
@RabbitListener(queues = {"huang.queue2"})
public void listenSimpleQueue4(String msg) throws InterruptedException {
    System.err.println(msg);
    Thread.sleep(20);
}
```
<img src='/assets/img/rabbitmq06.png'>

:::tip
两个队列都接收到消息
:::

#### (2)DirectExchange
    Direct Exchange 会将接收到的消息根据规则路由到指定的Queue，因此称为路由模式 (routes)。
    每一个Queue都与Exchange设置一个BindingKey
    发布者发送消息时，指定消息的RoutingKey。
    Exchange将消息路由到BindingKey与消息RoutingKey一致的队列

<img src='/assets/img/rabbitmq07.png'>

#### 绑定消息队列
``` java
@RabbitListener(bindings = @QueueBinding(
        value = @Queue("direct.queue1"),
        exchange = @Exchange(name = "huang.direct",type = ExchangeTypes.DIRECT),
        key = {"red","blue"}
))
public void listenSimpleQueue5(String msg) throws InterruptedException {
    System.out.println(msg);
}

@RabbitListener(bindings = @QueueBinding(
        value = @Queue("direct.queue2"),
        exchange = @Exchange(name = "huang.direct",type = ExchangeTypes.DIRECT),
        key = {"red","yellow"}
))
public void listenSimpleQueue6(String msg) throws InterruptedException {
    System.err.println(msg);
}
```

#### 发送消息
``` java
@Test
public void demoSend4(){
    String exchangeName = "huang.direct";
    String message = "hello, blue";
    rabbitTemplate.convertAndSend(exchangeName, "blue", message);
}

@Test
public void demoSend5(){
    String exchangeName = "huang.direct";
    String message = "hello, yellow";
    rabbitTemplate.convertAndSend(exchangeName, "yellow", message);
}

@Test
public void demoSend6(){
    String exchangeName = "huang.direct";
    String message = "hello, red";
    rabbitTemplate.convertAndSend(exchangeName, "red", message);
}
```
#### (3)TopicExchange
#### TopicExchange与DirectExchange类似，区别在于routingKey必须是多个单词的列表，并且以.分割。

<img src='/assets/img/rabbitmq08.png'>

#### 绑定消息队列
``` java
@RabbitListener(bindings = @QueueBinding(
        value = @Queue("topic.queue1"),
        exchange = @Exchange(name = "huang.topic",type = ExchangeTypes.TOPIC),
        key = "china.#"
))
public void listenSimpleQueue7(String msg){
    System.err.println(msg);
}

@RabbitListener(bindings = @QueueBinding(
        value = @Queue("topic.queue2"),
        exchange = @Exchange(name = "huang.topic",type = ExchangeTypes.TOPIC),
        key = "#.news"
))
public void listenSimpleQueue8(String msg){
    System.err.println(msg);
}
```
#### 发送消息
``` java
@Test
public void demoSend7(){
    String exchangeName = "huang.topic";
    String message = "中国成为世界第一经济体！！！";
    rabbitTemplate.convertAndSend(exchangeName, "china.news", message);
}
```

#### 消息转换器（序列化消息对象）
    Spring对消息对象的处理是由org.springframework.amqp.support.converter.MessageConverter来处理的。
    而默认实现是SimpleMessageConverter，基于JDK的ObjectOutputStream完成序列化。
    如果要修改只需要定义一个MessageConverter 类型的Bean即可。推荐用JSON方式序列化。
#### 引入依赖（消息发送者和接收者）
``` xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xm</artifactId>
    <version>2.9.10</version>
</dependency>
```
#### 声明MessageConverter（消息发送者和接收者）
``` java
@Bean
public MessageConverter jsonMessageConverter(){
    return new Jackson2JsonMessageConverter():
}
```
#### 接收
``` java
@RabbitListener(queues = "object.queue")
public void listenObjectQueue(Map<String， Object> msg) {
    System,out.println("收到消息:[”+ msg +“]");
}
```

## Elasticsearch
    Elasticsearch是一款非常强大的开源搜索引擎，可以帮助我们从海量的数据中快速找到需要的内容。
    elasticsearch结合kibana，logstash，Beats，也就是elastic stack（ELK）。被广泛应用在日志数据分析，实时监控等领域。
    elasticsearch是elastic stack的核心，负责存储，搜索，分析数据。

<img src='/assets/img/el01.png'>

#### Lucene
    Elasticsearch的底层基于Lucene，Lucene是一个java语言的搜索引擎类库，是Apache公司的顶级项目，由DoungCutting于1999年研发。
    Lucene的优势：易扩展，高性能（基于倒排索引）
    Lucene的缺点：只限于Java语言开发，学习曲线陡峭，不支持水平扩展
    而elasticsearch相对于Lucene的优势有：支持分布式，可水平扩展，提供Restful接口，可被任何语言调用

<a href="https://lucene.apache.org">Lucene官方网站</a>

<a href="https://www.elastic.co/cn">Elasticsearch官方网站</a>

### 正向索引和倒排索引
传统数据库（MySQL）采用正向索引，例如给下表（tb_goods）中的id创建索引

<img src='/assets/img/el02.png'>

正向索引通过关键词然后一条一条数据进行查找，符合要求的存入结果集

elasticsearch采用倒排索引

<img src='/assets/img/el03.png'>

|MySQL|Elasticsearch|说明
|:---:|:---:|:---:|
|Table|Index|索引（index），就是文档的集合，类似于数据库的表（Table）
|Row|Document|文档（Document），就是一条条的数据，类似于数据库中的行（Row），文档都是一种JSON格式
|Column|Field|字段（Field），就是JSON文档中的字段，类似于数据库中的列（Column）
|Schema|Mapping|Mapping（映射）是索引中文档的约束，例如字段类型约束。类似数据库的表结构（Schema）
|SQL|DSL|DSL是elasticsearch提供的JSON风格的请求语句，用来操作elasticsearch，实现CRUD
:::tip
MySQL:擅长事务类型操作，可以确保数据的安全和一致性

Elasticsearch:擅长海量数据的搜索，分析，计算
:::

### 安装elasticsearch（Linux）
#### 1.创建网络
因为我们还需要部署kibana容器，因此需要让es和kibana容器互联。这里先创建一个网络

``` sh
docker network create es-net
```
#### 2.加载容器
这里我们采用elasticsearch和kibana的7.12.1版本的镜像。
``` sh
docker pull elasticsearch:7.12.1
```
``` sh
docker pull kibana:7.12.1
```
:::tip
kibana的版本需要和elasticsearch版本一致
:::
#### 3.运行elasticsearch
``` sh
docker run -d \
	--name es \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -e "discovery.type=single-node" \
    -v es-data:/usr/share/elasticsearch/data \
    -v es-plugins:/usr/share/elasticsearch/plugins \
    --privileged \
    --network es-net \
    -p 9200:9200 \
    -p 9300:9300 \
elasticsearch:7.12.1
```
    命令解释：
    
    - `-e "cluster.name=es-docker-cluster"`：设置集群名称
    - `-e "http.host=0.0.0.0"`：监听的地址，可以外网访问
    - `-e "ES_JAVA_OPTS=-Xms512m -Xmx512m"`：内存大小
    - `-e "discovery.type=single-node"`：非集群模式
    - `-v es-data:/usr/share/elasticsearch/data`：挂载逻辑卷，绑定es的数据目录
    - `-v es-logs:/usr/share/elasticsearch/logs`：挂载逻辑卷，绑定es的日志目录
    - `-v es-plugins:/usr/share/elasticsearch/plugins`：挂载逻辑卷，绑定es的插件目录
    - `--privileged`：授予逻辑卷访问权
    - `--network es-net` ：加入一个名为es-net的网络中
    - `-p 9200:9200`：端口映射配置

在浏览器中输入：http://主机ip:9200 即可看到elasticsearch的响应结果

<img src='/assets/img/el04.png'>

#### 4.运行kibana
``` sh
docker run -d \
--name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=es-net \
-p 5601:5601  \
kibana:7.12.1
```
    - `--network es-net` ：加入一个名为es-net的网络中，与elasticsearch在同一个网络中
    - `-e ELASTICSEARCH_HOSTS=http://es:9200"`：设置elasticsearch的地址，因为kibana已经与elasticsearch在一个网络，因此可以用容器名直接访问elasticsearch
    - `-p 5601:5601`：端口映射配置

kibana启动一般比较慢，需要多等待一会，可以通过命令查看运行日志

``` sh
docker logs -f kibana
```

在浏览器输入地址访问：http://主机ip:5601，即可看到结果

<img src='/assets/img/el05.png'>

#### 5.DevTools
kibana中提供了一个DevTools界面，这个界面中可以编写DSL来操作elasticsearch。并且对DSL语句有自动补全功能。

<img src='/assets/img/el06.png'>

<img src='/assets/img/el07.png'>

``` 
GET /_analyze
{
  "analyzer": "ik_smart",
  "text": "我是黄小二，一名程序员！"
}
语法说明：
POST:请求方式
/analyze: 请求路径，这里省略了http://主机ip:9200，有kibana帮我们补充
请求参数，json风格:
    analyzer:分词器类型，这里是默认的standard分词器
    text:要分词的内容
```

### IK分词器
es在创建倒排索引时需要对文档分词;在搜索时，需要对用户输入内容分词。但默认的分词规则对中文处理并不友好。
#### 在线安装
``` shell
# 进入容器内部
docker exec -it elasticsearch /bin/bash

# 在线下载并安装
./bin/elasticsearch-plugin  install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.12.1/elasticsearch-analysis-ik-7.12.1.zip

#退出
exit
#重启容器
docker restart elasticsearch
```
#### 离线安装
查看数据卷目录

安装插件需要知道elasticsearch的plugins目录位置，而我们用了数据卷挂载，因此需要查看elasticsearch的数据卷目录，通过下面命令查看

``` sh
docker volume inspect es-plugins
```
显示结果：

``` json
[
    {
        "CreatedAt": "2022-05-06T10:06:34+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/es-plugins/_data",
        "Name": "es-plugins",
        "Options": null,
        "Scope": "local"
    }
]
```
说明plugins目录被挂载到了：`/var/lib/docker/volumes/es-plugins/_data `这个目录中。

解压缩分词器安装包（需要提前下载好）

上传到es容器的插件数据卷中

<img src='/assets/img/el08.png'>

重启容器
``` shell
# 4、重启容器
docker restart es
```
``` sh
# 查看es日志
docker logs -f es
```
IK分词器包含两种模式：

* `ik_smart`：最少切分，拆分的是每个词，例如：`程序员`，不会再拆分

* `ik_max_word`：最细切分，拆分出每个词后还能再拆分的话会继续拆分，例如：`程序员`，拆分后还会拆出，`程序`和`员`

#### 扩展词词典
随着互联网的发展，“造词运动”也越发的频繁。出现了很多新的词语，在原有的词汇列表中并不存在。比如：“白嫖”等。
所以我们的词汇也需要不断的更新，IK分词器提供了扩展词汇的功能。

1.打开IK分词器config目录

<img src='/assets/img/el09.png'>

2.在IKAnalyzer.cfg.xml配置文件内容添加
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
        <comment>IK Analyzer 扩展配置</comment>
        <!--用户可以在这里配置自己的扩展字典 *** 添加扩展词典-->
        <entry key="ext_dict">ext.dic</entry>
</properties>
```
3.新建一个`ext.dic`，可以参考config目录下复制一个配置文件进行修改
``` properties
白嫖
黄小二
```
5.重启elasticsearch 
``` sh
docker restart es
```

#### 停用词词典
1.在IKAnalyzer.cfg.xml配置文件内容添加
``` xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
        <comment>IK Analyzer 扩展配置</comment>
        <!--用户可以在这里配置自己的扩展字典-->
        <entry key="ext_dict">ext.dic</entry>
         <!--用户可以在这里配置自己的扩展停止词字典  *** 添加停用词词典-->
        <entry key="ext_stopwords">stopword.dic</entry>
</properties>
```
2.在 stopword.dic 添加停用词
``` properties
的
了
啊
哦
额
嗯
```
3.重启elasticsearch 
``` sh
docker restart es
```
:::tip
注意当前文件的编码必须是 UTF-8 格式，严禁使用Windows记事本编辑
:::

### 索引库
#### mapping属性
    mapping是对索引库中文档的约束，常见的mapping属性包括：
    type:字段数据类型，常见的简单类型有:
        * 字符串: text(可分词的文本)、keyword (精确值，例如:品牌、国家、ip地址)
        * 数值: long、integer、short、byte、double、float、
        * 布尔:boolean
        * 日期: date
        * 对象: object
    index:是否创建索引，默认为true
    analyzer:使用哪种分词器
    properties:该字段的子字段
#### 创建索引库和mapping的DSL语法
``` properties
PUT /索引库名称
{
  "mappings": {
    "properties": {
      "字段名1": {
        "type": "text",
        "analyzer": "ik_smart"
      },
      "字段名2": {
        "type": "keyword",
        "index": false
      },
      "字段名3": {
        "type": "object",
        "properties": {
          "子字段名1": {
            "type": "keyword"
          },
          "子字段名2": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```
#### 查看，删除索引库
查看
``` properties
GET /索引库名称
```
删除
``` properties
DELETE /索引库名称
```
#### 修改索引库
:::tip
索引库和mapping一旦创建就无法修改，但是可以添加新字段
:::
``` properties
PUT /索引库名/_mapping
{
  "properties": {
    "新字段名": {
      "type":"text"
    }
  }
}
```
### 文档操作
#### 插入文档
``` properties
POST /索引库名/_doc/文档id
{
  "字段1":"黄xiaoer",
  "字段2":"12345@qq.com",
  "字段3":{
    "子字段1":"黄",
    "子字段2":"xiaoer"
  }
}
```
#### 查找文档
``` properties
GET /索引库名/_doc/文档id
```
#### 查找所有文档
``` properties
GET /索引库名/_search
```
#### 删除文档
``` properties
DELETE /索引库名/_doc/文档id
```
#### 修改文档
方式一：全量修改，会删除旧文档，添加新文档，如果文档id在索引库中存在，则进行修改操作，如果不存在，进行添加操作
``` properties
PUT /索引库名/_doc/文档id
{
  "字段1":"值1",
  "字段2":"值2",
  "字段3":{
    "子字段1":"值3",
    "子字段2":"值4"
  }
}
```
方式二：增量修改，修改指定字段值
``` properties
POST /索引库名/_update/文档id
{
  "doc":{
    "字段名":"新的值",
    "字段名":"新的值"
  }
}
```
### RestClient
#### ES官方提供了各种不同语言的客户端，用来操作ES。这些客户端本质就是组装了DSL语句，通过http请求发送给ES。

<a href="https://www.elastic.co/guide/en/elasticsearch/client/index.html">官方文档地址</a>

:::tip
在 Elasticsearch7.15版本之后，Elasticsearch官方将它的高级客户端 RestHighLevelClient标记为弃用状态。
同时推出了全新的 Java API客户端 Elasticsearch Java API Client，该客户端也将在 Elasticsearch8.0及以后版本中成为官方推荐使用的客户端。
:::

#### 以下使用的是官方7.12.1 ，最新版本使用请参考官方文档
#### 导入依赖
``` xml
<!--RestClient-->
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
</dependency>
<!--FastJson-->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.71</version>
</dependency>
```
#### 索引库操作
``` java
public class HotelIndexTest {

    private RestHighLevelClient client;

    //创建连接
    @BeforeEach
    public void initShards() {
        this.client = new RestHighLevelClient(
                RestClient.builder(HttpHost.create("http://175.178.161.40:9200"))
        );
    }

    @Test
    void testInit(){
        System.out.println(client);
    }

    //创建索引库
    @Test
    void createHotelIndex() throws IOException {
        // 1.创建Request对象
        CreateIndexRequest request = new CreateIndexRequest("hotel");
        // 2.准备请求的参数：DSL语句，MAPPING_TEMPLATE是需要添加的文档内容的json常量
        request.source(MAPPING_TEMPLATE , XContentType.JSON);
        // 3.发送请求
        client.indices().create(request, RequestOptions.DEFAULT);
    }

    //删除索引库
    @Test
    void testDeleteHotelIndex() throws IOException{
        // 1.创建Request对象
        DeleteIndexRequest request = new DeleteIndexRequest("hotel");
        // 2.发送请求
        client.indices().delete(request, RequestOptions.DEFAULT);
    }

    //查看索引库是否存在
    @Test
    void testExistsHotelIndex() throws IOException{
        GetIndexRequest request = new GetIndexRequest("hotel");
        boolean exists = client.indices().exists(request, RequestOptions.DEFAULT);
        System.out.println(exists?"索引库存在":"索引库不存在");
    }

    //关闭连接
    @AfterEach
    void tearDown() throws IOException {
        this.client.close();
    }
}
```
#### 文档操作
``` java
@SpringBootTest
public class HotelDocumentTest {

    @Autowired
    private IHotelService hotelService;

    private RestHighLevelClient client;

    //创建连接
    @BeforeEach
    public void initShards() {
        this.client = new RestHighLevelClient(
                RestClient.builder(HttpHost.create("http://175.178.161.40:9200"))
        );
    }

    //添加文档
    @Test
    void TestAddDocument() throws IOException {
        //从mysql数据库中根据id查找数据
        Hotel hotel = hotelService.getById(61083L);
        HotelDoc hotelDoc = new HotelDoc(hotel);
        //1.准备request对象
        IndexRequest request = new IndexRequest("hotel").id(hotelDoc.getId().toString());
        //2.准备json文档
        request.source(JSON.toJSONString(hotelDoc),XContentType.JSON);
        //3.发送请求
        client.index(request,RequestOptions.DEFAULT);
    }

    //文档查询
    @Test
    void TestGetDocument() throws IOException {
        //1.准备Request
        GetRequest request = new GetRequest("hotel", "61083");
        //2.发送请求，得到响应
        GetResponse response = client.get(request, RequestOptions.DEFAULT);
        //3.解析响应结果
        String json = response.getSourceAsString();
        HotelDoc hotelDoc= JSON.parseObject(json,HotelDoc.class);
        System.out.println(hotelDoc);
    }
    
    //文档更新
    @Test
    void testUpdateDocument() throws IOException {
        //1.准备Request
        UpdateRequest request = new UpdateRequest("hotel", "61083");
        //2.准备请求参数
        request.doc(
                "price","999",
                "starName","四钻"
        );
        //3.发送请求
        client.update(request,RequestOptions.DEFAULT);
    }

    //文档删除
    @Test
    void testDeleteDocument() throws IOException {
        //1.准备文档
        DeleteRequest request = new DeleteRequest("hotel", "61083");
        //2.发送请求
        client.delete(request, RequestOptions.DEFAULT);
    }

    //批量添加
    @Test
    void testBulkRequest() throws IOException {
        //批量查询酒店数据
        List<Hotel> hotels = hotelService.list();
        List<HotelDoc> hotelDocs = hotels.stream().map(HotelDoc::new).collect(Collectors.toList());
        //创建Request
        BulkRequest request = new BulkRequest();
        hotelDocs.forEach(hotelDoc -> {
            request.add(new IndexRequest("hotel")
                    .id(hotelDoc.getId().toString())
                    .source(JSON.toJSONString(hotelDoc), XContentType.JSON));
        });
        //发送请求
        client.bulk(request,RequestOptions.DEFAULT);
    }

    //关闭连接
    @AfterEach
    void tearDown() throws IOException {
        this.client.close();
    }
}
```
### DSL查询语法
    Elasticsearch提供了基于JSON的DSL（Domain Specific Language）来定义查询。常见的查询类型包括：
    查询所有：查询出所有的数据，一般测试用。例如：match_all
    全文检索（full text）查询：利用分词器对用户输入的内容分词，然后去倒排索引库中匹配。例如：
        match_query
        multi_match_query
    精确索引：根据精确词条值查询数据，一般是查找keyword，数值，日期，boolean等类型字段。例如：
        ids
        range
        term
    地理（geo）查询：根据经纬度查询。例如：
        geo_distance
        geo_bounding_box
    复合（compound）查询：复合查询可以将上述各种查询条件组合起来，合并查询条件。例如：
        bool
        function_score

#### DSL Query基本语法
``` properties
GET /索引库名/_search
{
  "query": {
    "查询条件": "条件值"
  }
}
```
#### 全文检索查询
match查询：全文检索查询的一种，会对用户输入内容分词，然后去倒排索引库检索，语法：
``` properties
GET /索引库名/_search
{
  "query": {
    "match": {
      "字段名": "查询内容"
    }
  }
}
```
multi_match：与match查询类似，只不过允许同时查询多个字段，语法：
``` properties
GET /索引库名/_search
{
  "query": {
    "multi_match": {
      "query": "查询内容",
      "fields": ["字段名1","字段名2","字段名3"]
    }
  }
}
```
#### 精确查询
term查询
``` properties
GET /索引库名/_search
{
  "query": {
    "term": {
      "字段名": {
        "value": "查询内容"
      }
    }
  }
}
```
range查询
``` properties
GET /索引库名/_search
{
  "query": {
    "range": {
      "字段名": {
        "gte": 大于等于某个值,
        "lte": 小于等于某个值
      }
    }
  }
}
```
:::tip
"gte":大于等于某个值   
"lte":小于等于某个值   
"gt":大于某个值  
"lt":小于某个值  
:::
#### 地理查询
geo_bounding_box:查询geo_point值落在某个矩形范围的所有文档
``` properties
GET /索引库名/_search
{
  "query": {
    "geo_bounding_box": {
      "字段名": {
        "top_left":{
          "lat":上顶点的经度,
          "lon":上顶点的维度
        },
        "bottom_right":{
          "lat":下顶点经度,
          "lon":下顶点的维度
        }
      }
    }
  }
}
```
geo_distance:查询到指定中心点小于某个距离值的所有文档
``` properties
GET /索引库名/_search
{
  "query": {
    "geo_distance": {
      "distance": "2km",
      "location": "31.21,121.5"
    }
  }
}
```
#### 相关性算分
当我们利用match查询时，文档结果会根据与搜素词条的关联度打分（_score），返回结果时按照分值降序排列
##### TF算法
<img src='/assets/img/el10.png'>

##### TF—IDF算法
<img src='/assets/img/el11.png'>

##### BM25算法
<img src='/assets/img/el12.png'>

:::tip
新版本采用的是BM25算法，BM25算法相较于TF-IDF算法受词频影响较小，得分不会一直增加
:::

#### Function Score Query
使用Function Score Query，可以修改文档的相关性算分（query score），根据新的到的分数进行排序

<img src='/assets/img/el13.png'>

#### 复合查询Boolean Query
布尔查询是一个或多个查询子句的组合。子查询的组合方式有：

    must：必须匹配每个子查询，类似于’与‘
    should：选择性匹配子查询，类似于’或‘
    must_not：必须不匹配，不参与算分，类似于’非‘
    filter：必须匹配，不参与算分
实例：
``` properties
GET /hotel/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": "如家"
          }
        }
      ],
      "must_not": [
        {
          "range": {
            "price": {
              "gt": 400
            }
          }
        }
      ],
      "filter": [
        {
          "geo_distance": {
            "distance": "10km",
            "location": {
              "lat": 31.21,
              "lon": 121.5
            }
          }
        }
      ]
    }
  }
}
```
### 搜索结果处理
#### 排序
elasticsearch支持对搜索结果排序，默认是根据相关度算分（_score）来排序。可以排序的字段有keyword类型，数值类型，地理坐标类型，日期类型等
``` properties
GET /索引库名/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "字段名": "desc(降序)或者asc(升序)"
    }
  ]
}

#地理坐标排序
GET /索引库名/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "_geo_distance": {
        "字段名": "经度,维度",
        "order": "asc",
        "unit": "km"
      } 
    }
  ]
}
```
#### 分页
``` properties
GET /索引库名/_search
{
  "query": {
    "match_all": {}
  },
  "from": 10, //分页开始的位置，默认为0
  "size": 20,  //期望获取的文档总数
  "sort": [
    {"字段名": "asc"}
  ]
}
```
:::tip
es的分页是进行逻辑上的分页，例如：from的值为990，size的值为10，es就会搜索出前1000条数据，然后从990开始截取10条数据。 

深度分页问题      
es是分布式的，所以会面临深度分页的问题。例如：按价格排序，获取from=990，size=10的数据。
首先会在es集群每个数据分片上都排序并查询前1000条文档，然后将所有节点的结果聚合，在内存中重新排序选出前1000条文档，
最后从这1000条文档中，选取990开始的10条文档

如果搜索页数过深，或者结果集（from+size）越大，对内存和CPU的消耗也就越高。因此es设定结果集查询的上限是10000。

针对深度分页，es提供了两种解决方案      
search after：分页时需要排序，原理是从上一次的排序值开始，查询下一页数据。官方推荐使用的方式。       
scroll：原理是将排序数据形成快照，保存在内存。官方已经不推荐使用。
:::
#### 高亮
高亮：就是在搜索结果中把关键字突出显示。原理：将搜索结果中的关键字用标签标记出来，在页面中给标签添加css样式
语法
``` properties
GET /索引库名/_search
{
  "query": {
    "match": {
      "字段名": "值"
    }
  },
  "highlight": {
    "fields": {     //指定高亮的字段
      "字段名": {
        "require_field_match": "false", 
        "pre_tags": "<em>",     //高亮字段前置标签
        "post_tags": "</em>"    //高亮字段后置标签
      }
    }
  }
}
```
### RestClient进阶查询
```` java
public class HotelSearchTest {

    private RestHighLevelClient client;

    //创建连接
    @BeforeEach
    public void initShards() {
        this.client = new RestHighLevelClient(
                RestClient.builder(HttpHost.create("http://175.178.161.40:9200")));
    }

    //matchAll
    @Test
    void testMatchAll() throws IOException {
        // 1.准备Request
        SearchRequest request = new SearchRequest("hotel");
        // 2.准备DSL
        request.source().query(QueryBuilders.matchAllQuery());
        // 3.发送请求
        SearchResponse response = this.client.search(request, RequestOptions.DEFAULT);
        handleResponse(response);
    }

    //match
    @Test
    void testMatch() throws IOException {
        // 1.准备Request
        SearchRequest request = new SearchRequest("hotel");
        // 2.准备DSL
        request.source().query(QueryBuilders.matchQuery("all","如家"));
        // 3.发送请求
        SearchResponse response = this.client.search(request, RequestOptions.DEFAULT);
        handleResponse(response);
    }

    //Boolean Query,term,geo_distance,range
    @Test
    void testBooleanQuery() throws IOException {
        // 1.准备Request
        SearchRequest request = new SearchRequest("hotel");
        // 2.准备DSL
        // 2.1准备BooleanQuery
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        // 2.2添加term和geo_distance
        boolQuery.must(QueryBuilders.termQuery("city", "上海"));
        boolQuery.must(QueryBuilders.geoDistanceQuery("location").
                distance(5,DistanceUnit.KILOMETERS).point(31.21,121.5));
        // 2.3添加range
        boolQuery.filter(QueryBuilders.rangeQuery("price").lte(250));
        // 2.4添加should
        boolQuery.should(QueryBuilders.termQuery("name","如家"));

        request.source().query(boolQuery);
        // 3.发送请求
        SearchResponse response = this.client.search(request, RequestOptions.DEFAULT);
        handleResponse(response);
    }

    //分页和排序
    @Test
    void testPageAndSort() throws IOException {
        // 1.准备Request
        SearchRequest request = new SearchRequest("hotel");
        // 2.准备DSL
        request.source().query(QueryBuilders.matchAllQuery());
        // 2.1排序
        request.source().sort("price", SortOrder.ASC);
        // 2.2分页
        request.source().from(30).size(10);
        // 3.发送请求
        SearchResponse response = this.client.search(request, RequestOptions.DEFAULT);
        handleResponse(response);
    }

    //高亮
    @Test
    void testHighLight() throws IOException{
        // 1.准备Request
        SearchRequest request = new SearchRequest("hotel");
        // 2.准备DSL
        request.source().query(QueryBuilders.matchQuery("all","如家"));
        // 2.1高亮
        request.source().highlighter(
               new HighlightBuilder().field("name").requireFieldMatch(false));
        // 3.发送请求
        SearchResponse response = this.client.search(request, RequestOptions.DEFAULT);
        // 4.解析响应结果
        SearchHits searchHits = response.getHits();
        // 4.1 文档数组
        SearchHit[] hits = searchHits.getHits();
        // 4.2 遍历
        for (SearchHit hit: hits) {
            // 获取文档source
            String json = hit.getSourceAsString();
            // 反序列化
            HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
            // 获取文档高亮
            Map<String, HighlightField> highlightFields = hit.getHighlightFields();
            if(!CollectionUtils.isEmpty(highlightFields)){
                //获取高亮结果
                HighlightField highlightField = highlightFields.get("name");
                if(highlightField != null){
                    String name = highlightField.getFragments()[0].string();
                    hotelDoc.setName(name);
                }
            }
            System.out.println(hotelDoc);
        }
    }

    //方法抽取（Ctrl+Alt+M）
    private void handleResponse(SearchResponse response) {
        // 4.解析响应结果
        SearchHits searchHits = response.getHits();
        // 4.1 获取总条数
        long total = searchHits.getTotalHits().value;
        System.out.println("搜索到的 ："+total + "条数据");
        // 4.2 文档数组
        SearchHit[] hits = searchHits.getHits();
        // 4.3 遍历
        for (SearchHit hit: hits) {
            // 获取文档source
            String json = hit.getSourceAsString();
            // 反序列化
            HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
            System.out.println(hotelDoc);
        }
    }

    //关闭连接
    @AfterEach
    void tearDown() throws IOException {
        this.client.close();
    }
}
````
:::tip
查询基本步骤：     
1.创建SearchRequest对象     
2.准备Request.source()，也就是DSL

①QueryBuilders来构建查询条件       
②传入Request.source()的query()方法    

3.发送请求，得到结果     
4.解析结果（参考JSON结果，从外到内，逐层解析）
:::
#### RestClient与文档对照
match_all

<img src='/assets/img/el15.png'>

解析

<img src='/assets/img/el14.png'>

高亮

<img src='/assets/img/el16.png'>



