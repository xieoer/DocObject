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