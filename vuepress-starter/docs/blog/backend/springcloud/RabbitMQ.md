# 异步通讯
    同步与异步通讯的优缺点
    同步通讯时效性强，可以立即得到结果，
    但是耦合度高，性能和吞吐率能力低，有额外的资源消耗，有级联失败问题
    异步通讯耦合度低，吞吐量高，故障隔离，
    但依赖于Borker的可靠性，安全性，吞吐能力，架构复杂，业务没有明显的流程线，不好追踪管理

## MQ消息队列
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

## RabbitMQ

<img src='/assets/img/rabbitmq01.png'>

### centos7使用docker安装RabbitMQ
### 1.在线拉取
``` sh
docker pull rabbitmq
```
### 2.安装mq
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
### 3.进入容器
``` sh
docker exec -it 容器id /bin/bash
```
### 4.打开管理界面
``` sh
rabbitmq-plugins enable rabbitmq_management
```
### 5.访问
    主机ip:15672

<img src='/assets/img/rabbitmq02.png'>

### RabbitMQ中的几个概念
    channel：操作MQ的工具
    exchange：路由消息到队列
    queue：缓存消息
    virtualhost：虚拟主机，是对queue，exchange等资源的逻辑分组

## SpringAMQP
### 引入依赖
``` xml
<!--AMQP依赖，包含RabbitMQ-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```
### 消息发送
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
## WorkQueue模型

<img src='/assets/img/rabbitmq03.png'>

### 模拟WorkQueue，实现一个队列绑定多个消费者
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

## 发布（Publish）订阅（Subscribe）模型
    发布订阅模式与之前案例的区别就是允许将同一消息发送给多个消费者。实现方式是加入了exchange(交换机)
    常见exchange类型包括:
    Fanout:广播
    Direct:路由
    Topic: 话题
    exchange负责消息路由，而不是存储，路由失败则消息丢失
### (1)FanoutExchange
### Fanout Exchange 会将接收到的消息路由到每一个跟其绑定的queue

<img src='/assets/img/rabbitmq05.png'>

### 交换机绑定队列
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
### 消息发送
``` java
@Test
public void demoSend3() throws InterruptedException {
    String exchangeName = "huang.fanout";
    String message = "hello, rabbitmq__";
    rabbitTemplate.convertAndSend(exchangeName, "", message);
    Thread.sleep(20);
}
```
### 消息接收
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

### (2)DirectExchange
    Direct Exchange 会将接收到的消息根据规则路由到指定的Queue，因此称为路由模式 (routes)。
    每一个Queue都与Exchange设置一个BindingKey
    发布者发送消息时，指定消息的RoutingKey。
    Exchange将消息路由到BindingKey与消息RoutingKey一致的队列

<img src='/assets/img/rabbitmq07.png'>

### 绑定消息队列
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

### 发送消息
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
### (3)TopicExchange
### TopicExchange与DirectExchange类似，区别在于routingKey必须是多个单词的列表，并且以.分割。

<img src='/assets/img/rabbitmq08.png'>

### 绑定消息队列
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
### 发送消息
``` java
@Test
public void demoSend7(){
    String exchangeName = "huang.topic";
    String message = "中国成为世界第一经济体！！！";
    rabbitTemplate.convertAndSend(exchangeName, "china.news", message);
}
```

### 消息转换器（序列化消息对象）
    Spring对消息对象的处理是由org.springframework.amqp.support.converter.MessageConverter来处理的。
    而默认实现是SimpleMessageConverter，基于JDK的ObjectOutputStream完成序列化。
    如果要修改只需要定义一个MessageConverter 类型的Bean即可。推荐用JSON方式序列化。
### 引入依赖（消息发送者和接收者）
``` xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xm</artifactId>
    <version>2.9.10</version>
</dependency>
```
### 声明MessageConverter（消息发送者和接收者）
``` java
@Bean
public MessageConverter jsonMessageConverter(){
    return new Jackson2JsonMessageConverter():
}
```
### 接收
``` java
@RabbitListener(queues = "object.queue")
public void listenObjectQueue(Map<String， Object> msg) {
    System,out.println("收到消息:[”+ msg +“]");
}
```