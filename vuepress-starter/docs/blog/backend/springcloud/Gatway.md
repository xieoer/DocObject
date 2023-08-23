# Gateway网关
## 搭建网关
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
## 路由断言工厂
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
## 全局过滤器GlobalFilter
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
## 过滤器执行顺序
    每一个过滤器都必须指定一个int类型的order值，order值越小，优先级越高，执行顺序越靠前。
    GlobalFilter通过实现Ordered接口，或者添加@Order注解来指定order值，
    由我们自己指定路由过滤器和defaultFilter的order由Spring指定，默认是按照声明顺序从1递增。
    当过滤器的order值一样时，会按照 defaultFilter > 路由过滤器 > GlobalFilter的顺序执行
## 跨域配置
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