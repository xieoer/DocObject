# Eureka注册中心
<img src='/assets/img/eureka.png'>

### 在Eureka架构中，微服务角色有两类
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

## 使用
## 1.搭建EurekaServer
### 引入eureka-server依赖
``` xml
<!--eureka-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```     
### 添加@EnableEurekaServer注解
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
#### 在application.yml（配置文件）中配置eureka地址
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
## 2.注册服务（服务提供者）
### 引入eureka-client依赖
``` xml
<!--eureka-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```
### 在application.xml中配置eureka地址
``` yaml
spring:
  appliaction:
  name: userserver # eureka的服务名称
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10086/eureka
```
## 3.服务发现（服务消费者）
### 引入eureka-client依赖
``` xml
<!--eureka-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```
### 在application.yml中配置eureka地址
``` yaml
spring:
  appliaction:
  name: orderserver # eureka的服务名称
eureka:
  client:
    service-url:
      defaultZone: http://127.0.0.1:10086/eureka
```
### 在RestTemplate添加@LoadBalanced
``` java
// 在启动类中注入
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```
### 用服务提供者的服务名称远程调用
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
## Ribbon负载均衡
<img src='/assets/img/ribbon.png'>

### 负载均衡策略
#### 通过定义IRule实现可以修改负载均衡策略，有两种方式
#### 1.代码方式：在服务消费者的启动类中，定义一个新的IRule
``` java
//变更负载均衡策略
@Bean
public IRule randomRule(){
    return new RandomRule();
}
```
#### 2.配置文件方式：在服务消费者的配置文件中，添加新的配置就可以修改规则
``` yaml
#负载均衡规则
userservice:
  ribbon:
    NFLoadBalancerRuleClassName: com.betflix.loadbalancer.RandomRule  #负载均衡规则
```
::: tip
第一种是针对该服务对于其他所有服务实行的策略，第二种是该服务对于指定服务实行的策略
:::