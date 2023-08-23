# spring常用注解

## 1. springboot启动
### 1.1 @SpringBootApplication
`通常标注在springboot主启动类上`      
`创建springboot项目之后会自动在主启动类上添加`

::: details 详细使用
这是 Spring Boot 最核心的注解，用在 Spring Boot 主类上，标识这是一个Spring Boot 应用，用来开启 Spring Boot 的各项能力。

@SpringBootApplication 这个注解是一个复合注解，

可以由以下三个注解代替:

1. @EnableAutoConfiguration：启用 SpringBoot 的自动配置机制:
   是springboot实现自动化配置的核心注解，通过这个注解把spring应用所需的bean注入容器中

2. @ComponentScan： @ComponentScan用于类或接口上主要是指定扫描路径，
   spring会把指定路径下带有指定注解的类自动装配到bean容器里。
   会被自动装配的注解包括@Controller、 @Service、@Component、@Repository等等。
   其作用等同于<context:component-scan base-package="com.xxx.xxx" />配置
   
4. @SpringBootConfiguration：允许在 Spring 上下文中注册额外的 bean 或导入其他配置类
:::
   
## 2. springBean相关
### 2.1 @Autowired

`标注在属性上。`       
`默认是将属性名作为组件的id注入到容器中。`     
`自动导入对象到类中，注意导入的对象也要被spring容器管理 比如说：service类注入到controller类中。`       

:::details 详细使用
``` java
@Service
public class UserService {
  ......
}

@RestController
@RequestMapping("/users")
public class UserController {
   @Autowired
   private UserService userService;
   ......
}
```
:::
`该注解默认是优先按照类型去容器中找对应的组件，如果有多个相同类型的组件，再通过按照属性的名称作为组件的id去容器中找。`       
`@Autowired(required = false) 默认是true，找不到会报错，设置为false后，找不到也不会报错。`       

### 2.2 @Qualifier
`搭配@Autowired注解使用，可以指定组件的名称，而不是使用属性名。`      
`自己指定组件的名称`
::: details 详细使用
``` java
@Autowired
@Qualifier(value="bookDao2")
private BookDao bookDao;
```
:::

### 2.3 @Resource
`标注在属性上`        
`默认按照名称进行自动装配，几乎和@Autowired注解功能一样，只不过不支持自定义(@Resource是java里面的注解，而@Autowired是spring中的注解)。@Autowired(required = false) 和 @Primary`

### 2.4 @Component(通用)、@Service(service层、@Controller(controller层)、@Repository（DAO层）
`标注在类上`     
`要想把类标识成可以被@Autowired注解自动装配的bean的类，就需要加入这些注解`

### 2.5 @RestController
`标注在类上，标识该类是一个控制器bean`      
`@Controller和@ResponseBody的合集。REST风格 ；前后端不分离。`      
`将函数的返回值直接填入到HTTP响应体中，返回JSON或XML数据，显示在浏览器。因为如果只是使用@Controller（传统springmvc应用）的话，我们一般都是返回一个视图。`

### 2.6 @Scope
`设置作用域`     
`标注在bean方法对象上，不用设置，因为默认是单实例。我们常用的也是单实例。`
::: details 详细使用

    @Scope("prototype") --- 设置组件为多实例，ioc容器启动不会重新调用方法创建对象放到ioc容器中，每次获取的时候才会调用，获取一次创建一次
    @Scope("singleton") --- 设置组件为单实例，ioc容器启动会调用方法创建对象放到ioc容器中，以后每次获取都是直接从容器中拿。
:::

### 2.7 @Configuration
`标注在类上`     
`将类设置为配置类`      
`用来代替 applicationContext.xml 配置文件，所有这个配置文件里面能做到的事情都可以通过这个注解所在类来进行注册。`       
`proxyBeanMethods：代理bean的方法`
::: details 详细使用

    Full(proxyBeanMethods = true)（保证每个@Bean方法被调用多少次返回的组件都是单实例的）（默认）
    Lite(proxyBeanMethods = false)（每个@Bean方法被调用多少次返回的组件都是新创建的）
:::

### 2.8 @Bean
`标注在方法上`    
`给容器中添加组件。以方法名作为组件的id。返回类型就是组件类型。返回的值，就是组件在容器中的实例`  
`设置该方法的返回值作为spring管理的bean`
::: details 详细使用
``` java
@Configuration
public class SpringConfiguration {
    @Bean
    public Student student(){
        return new Student(11,"jack",22);
    }
}
```
:::

### 2.9 @ResponseBody
`@ResponseBody注解既可以在方法上使用，也可以在类上使用，在类上使用表明该类中所有方法均返回JSON数据，也可以与@Controller注解合并为@RestController。
它的作用是将controller的方法返回的对象通过适当的转换器转换为指定的格式之后，写入到response对象的body区，通常用来返回JSON数据或者是XML数据。
注意：在使用此注解之后不会再走视图处理器，而是直接将数据写入到输入流中，他的效果等同于通过response对象输出指定格式的数据。`

## 3.REST风格 — 处理常见的HTTP请求类型
### 3.1 @GetMapping
`标注在方法上`
::: details 详细使用
``` java
@GetMapping("users")  等价于  
@RequestMapping(value="/users",method=RequestMethod.GET)
```
:::
### 3.2 @POSTMapping
`标注在方法上`
::: details 详细使用
``` java
@PostMapping("users") 等价于  
@RequestMapping(value="/users",method=RequestMethod.POST)
```
:::
### 3.3 @PutMapping
`标注在方法上`
::: details 详细使用
``` java
@PutMapping("/users/{userId}") 等价于 
@RequestMapping(value="/users/{userId}",method=RequestMethod.PUT)
```
:::
### 3.4 @DeleteMapping
`标注在方法上`
::: details 详细使用
``` java
@DeleteMapping("/users/{userId}")等价于
@RequestMapping(value="/users/{userId}",method=RequestMethod.DELETE)
```
:::
### 3.5 @RequestMapping
`标注在方法上或者类上（一般是方法上）`    
`这个注解会将 HTTP 请求映射到 MVC 和 REST 控制器的处理方法上`
::: details 详细使用
是一个用来处理请求地址映射的注解，可用于类或方法上。用于类上，表示类中的所有响应请求的方法都是以该地址作为父路径。
该注解中的属性释义：  
value： 指定请求的实际地址        
method： 指定请求的method类型， GET、POST、PUT、DELETE等；    
consumes： 指定处理请求的提交内容类型（Content-Type），例如application/json, text/html;    
produces: 指定返回的内容类型，仅当request请求头中的(Accept)类型中包含该指定类型才返回；    
params： 指定request中必须包含某些参数值是，才让该方法处理。   
headers： 指定request中必须包含某些指定的header值，才能让该方法处理请求。 
:::

## 4.前后端传值
### 4.1 @PathVariable
`标注在形参`     
`用于获取路径参数，使用{参数名称}描述路径参数`   
`获取url中的数据`   
::: details 详细使用 
``` java
@GetMapping("/klasses/{klassId}")
public List<Teacher> getKlassRelatedTeachers(
         @PathVariable("klassId") Long klassId ) {
...
}

如果我们请求的url是这个：/klasses/{123456}
那么123456这个值就会传入到被@PathVariable标注的对应的形参上，即klassId = 123456
```
:::
### 4.2 @RequestParam
`标注在形参`     
`绑定请求参数和处理器形参之间的关系`
`获取请求参数的值（指问号后的参数，url?a=1&b=2）`   
::: details 详细使用
``` java
@RequestMapping("/getUser")
public String getUser(@RequestParam(value = "uid", required = false)Integer id) {
    System.out.println("id:"+id);
    return "user";
}

请求地址：http://localhost:8080/User/getUser?uid=123
那么我们形参中id的值就是123.
```
用于获取查询参数，   
语法：@RequestParam(value=”参数名”,required=”true/false”,defaultValue=””)     
value：参数名   
required：是否包含该参数，默认为true，表示该请求路径中必须包含该参数，如果不包含就报错。      
defaultValue：默认参数值，如果设置了该值，required=true将失效，自动为false,如果没有传该参数，就使用默认值    
:::
### 4.3 @RequestBody
`标注在形参`
`读取请求的body部分且Content-Type 为 application/json格式的数据，接收到数据之后会自动将数据绑定到 java对象上。`
`@ResponseBody作用在方法上或类上，让该方法的返回结果直接写入 HTTP response body 中，不会经过视图解析器，返回数据直接在页面展示。`
::: details 详细使用
``` java
@PostMapping("/payment/create")   
public CommonResult create(@RequestBody Payment payment){
    int result = paymentService.create(payment);
    log.info("*****插入结果："+result);
    if(result > 0){
        return new CommonResult(200,"插入数据库成功,serverport:"+serverPort,result);
    }else {
        return new CommonResult(444,"插入数据库失败",null);
    }
}
```
不要和@ResponseBody混淆了，@RequestBody主要用来接收前端传递给后端的json字符串中的数据的(请求体中的数据的), 
Content-Type 为 application/json 格式；GET方式无请求体，所以使用@RequestBody接收数据时，前端不能使用GET方式提交数据，而是用POST方式进行提交。     
比如前端以post方式传json字符串，此时后端就可以使用@RequestBody来接收    
:::
### 4.4 @RequestHeader
`获取请求头`
### 4.5 @CookieValue
`获取Cookie值`
### 4.6 @RequestAttribute
`获取request域属性`
### 4.7 @MatrixVariable
`矩阵变量`

## 5. 读取配置信息
### 5.1 @Value
`标注在字段、方法、参数及注解上`
`作用：读，然后赋值`
::: details 详细使用
``` java
1.基本数值
@Value("张三")
private String name;

2.可以写SpEL:#{}
@Value("#{20-2}")
private Integer age;

3.可以写${},取出配置文件（properties、yml ...）中的值
@Value("${person.nickName}")   # 在配置文件中的写法：person.nickName=张三
private String nickName;
```
:::
### 5.2 @ConfigurationProperties
`标注在类上`
`和@Value一样可以读取配置文件的信息`
::: details 详细使用
比如有一个application.yml文件
library:
    location: gz
    books:
        - name: Java
        description: Java程序设计
        - name: Python
        description: Python从入门到放弃
        - name: C++
        description: C++从入门到入土

``` java
@Component
@ConfigurationProperties(prefix = "library")
class LibraryProperties {
@NotEmpty
private String location;
private List<Book> books;
    @Setter
    @Getter
    @ToString
    static class Book {
        String name;
        String description;
    }
省略getter/setter
......
}
```
:::
### 5.3 @PropertySource
`标注在类上`     
`读取配置文件中的值`
::: details 详细使用
``` java
@Component
@PropertySource("classpath:website.properties")
class WebSite {
    @Value("${url}")
    private String url;

  省略getter/setter
  ......
}
```
:::

## 6. 数据库实体类相关
### 6.1 @Table @Entity @Id @GeneratedValue
`@Table @Entity` 标注在类上

`@Id @GeneratedValue` 标注在属性上

`@Table` 设置表名（当实体类的名字和数据库中名字不一致或者不符合规范命名的时候使用）

`@Entity` 声明一个类对应一个数据库实体

`@Id` 声明一个字段为主键

`@GeneratedValue` 声明主键的生成策略

::: details 详细使用
``` java
@Entity
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    省略getter/setter......
}
```
:::
### 6.2 @Param
`标注在形参位置`   
`作用：赋值`     
`专门为SQL服务的`     
`在形参位置标注，外部传入形参对应的值，值会赋给SQL语句中，进行动态sql。`    
::: details 详细使用
``` java
public User selectUser(@Param("userName") String name,@Param("password") String pwd);
```
``` xml
<select id="selectUser" resultMap="User">  
select * from user  where user_name = #{userName} and user_password=#{password}  
</select>
```
我们在方法中相应的形参位置标注了@Param("userName") String name，然后xml映射文件中sql语句，我们是user_name = #{userName}。
那么当外部调用方法传入userName具体的值时，相应的sql语句中user_name的值就是我们传入的值。

当一个实体类有很多属性时，如果一个一个的写在形参上会很冗余，我们也可以直接是通过一个整个实体类，通过@Param标识一个实体类来进行。
``` java
public List<User> getAllUser(@Param("user") User u);
```
``` xml
<select id="getAllUser" parameterType="com.vo.User" resultMap="userMapper">  
   select   
   from user t where 1=1  
        and t.user_name = #{user.userName}  
        and t.user_age = #{user.userAge}  
</select>  
```
当使用了@Param注解来声明参数的时候，SQL语句取值使用#{}
:::

## 7. 事务
### 7.1 @Transactional
`标注在类上或者方法上`
`在要开启事务的方法上使用@Transactional注解`
::: details 详细使用
我们知道 Exception 分为运行时异常 RuntimeException 和非运行时异常。    
在@Transactional注解中如果不配置rollbackFor属性,那么事物只会在遇到RuntimeException的时候才会回滚,加上rollbackFor=Exception.class,可以让事物在遇到非运行时异常时也回滚。

作用于类：当把@Transactional 注解放在类上时，表示所有该类的public 方法都配置相同的事务属性信息。     
作用于方法：当类配置了@Transactional，方法也配置了@Transactional，方法的事务会覆盖类的事务配置信息。
:::

## 8. 测试相关(Junit5中)
### 8.1 @Test
`标注在方法上`
`声明一个方法为测试方法`
::: details 详细使用
``` java
@Test
void should_import_student_success() throws Exception {
    ......
}
```
:::
### 8.2 其余注解
`@ParameterizedTest`：表示方法是参数化测试。    
`@RepeatedTest`：表示方法可重复执行。   
`@DisplayName`：为测试类或者测试方法设置展示名称。    
`@BeforeEach`：表示在每个单元测试之前执行。    
`@AfterEach`：表示在每个单元测试之后执行。     
`@BeforeAll`：表示在所有单元测试之前执行。     
`@AfterAll`：表示在所有单元测试之后执行。  
`@Tag`：表示单元测试类别，类似于JUnit4中的@Categories。     
`@Disabled`：表示测试类或测试方法不执行，类似于JUnit4中的@Ignore。   
`@Timeout`：表示测试方法运行如果超过了指定时间将会返回错误。     
`@ExtendWith`：为测试类或测试方法提供扩展类引用。     

## 9. 整合相关
### 9.1 @ComponentScan
`标注在类上`
`扫描注解（扫描被@Component、@Service、@Controller、@Repository）注解的bean`   
`包扫描`   
::: details 详细使用
``` java
@ComponentScan(value="com.atguigu")

//设置哪些不扫描  excludeFilters = Filter[] 指定扫描的时候按照什么规则排除哪些组件，不包含哪些组件
//type是指按哪种类型来进行过滤，classes为一个数组，里面为具体的过滤条件实体。
@ComponentScan(value="com.atguigu",excludeFilters = {
@ComponentScan.Filter(type= FilterType.ANNOTATION,classes = {Service.class})
})

//includeFilter =Filter[] 只包含哪些组件,必须设置useDefaultFilters = false，禁用默认全局扫描
@ComponentScan(value="com.atguigu",includeFilters = {
          @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = {Controller.class})
},useDefaultFilters = false )

//设置多个扫描策略
@ComponentScans(
value={ @ComponentScan(value="com.atguigu",includeFilters = {
        @ComponentScan.Filter(type = FilterType.ANNOTATION,classes = {Controller.class})
},useDefaultFilters = false )
,@ComponentScan(value="com.atguigu",excludeFilters = {
        @ComponentScan.Filter(type= FilterType.ANNOTATION,classes = {Service.class})
})}
)
```
:::
### 9.2 @Import
`标注在类上`     
`@Import({User.class, DBHelper.class})： 给容器中自动创建出这两个类型的组件、默认组件的名字就是全类名`     
`导入配置类`
::: details 详细使用
``` java
@SpringBootApplication
@Import({SmsConfig.class})
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```
@Import只能用在类上 ，@Import通过快速导入的方式实现把实例加入spring的IOC容器中     
用法：     
@Import({ 类名.class , 类名.class… })
:::
### 9.3 @ImportResource
`导入Spring配置文件`
::: details 详细使用
``` java
@ImportResource("classpath:beans.xml")
public class MyConfig {
...
}
```
:::
### 9.3 @Conditional
`条件装配：满足Conditional指定的条件，则进行组件注入`
::: details 详细使用
``` java
@ConditionalOnMissingBean(name = "tom")//没有tom名字的Bean时，MyConfig类的Bean才能生效。
public class MyConfig {

    @Bean
    public User user01(){
        User zhangsan = new User("zhangsan", 18);
        zhangsan.setPet(tomcatPet());
        return zhangsan;
    }

    @Bean("tom22")
    public Pet tomcatPet(){
        return new Pet("tomcat");
    }
}
```
:::

<a href="http://t.csdn.cn/L4ORj">更多注解</a>