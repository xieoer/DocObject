# 基于Feign的远程调用
## 定义和使用Feign客户端
### 1.引入依赖
``` xml
<!--Feign-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```
### 2.在服务消费者的启动类添加注解开启Feign的功能
``` java
@EnableFeignClients
```
### 3.编写Feign客户端
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
### 4，使用
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
## 自定义Feign配置
### 配置Feign日志
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
## Feign性能优化
    Feign底层客户端实现：
        URLConnection：默认实现，不支持连接池
        Apache HttpClient：支持连接池
        OKHttp：支持连接池
    优化Feign的性能主要包括：
        使用连接池代替默认的URLConnection
        日志级别，最好使用basic或者none（默认是none）
### 添加HttpClient的支持
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
## Feign的最佳实践
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

