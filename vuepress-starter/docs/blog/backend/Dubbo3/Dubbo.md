#Dubbo

<a href="https://cn.dubbo.apache.org/zh-cn/overview/what/overview/">官网地址</a>

## Dubbo 核心概念和架构

<img src="/assets/img/dubbo01.png">

以上是 Dubbo 的工作原理图，从抽象架构上分为两层：**服务治理抽象控制面** 和 **Dubbo 数据面** 。

**~服务治理控制面**:服务治理控制面不是特指如注册中心类的单个具体组件，而是对 Dubbo 治理体系的抽象表达。控制面包含协调服务发现的注册中心、
流量管控策略、Dubbo Admin 控制台等，如果采用了 Service Mesh 架构则还包含 Istio 等服务网格控制面。

**~Dubbo 数据面**:数据面代表集群部署的所有 Dubbo 进程，进程之间通过 RPC 协议实现数据交换，
Dubbo 定义了微服务应用开发与调用规范并负责完成数据传输的编解码工作。   
* 服务消费者 (Dubbo Consumer)，发起业务调用或 RPC 通信的 Dubbo 进程     
* 服务提供者 (Dubbo Provider)，接收业务调用或 RPC 通信的 Dubbo 进程

## Dubbo与Spring Cloud的关系

<img src="/assets/img/dubbo02.png">

从上图我们可以看出，Dubbo 和 Spring Cloud 有很多相似之处，它们都在整个架构图的相同位置并提供一些相似的功能。
* **Dubbo 和 Spring Cloud 都侧重在对分布式系统中常见问题模式的抽象（如服务发现、负载均衡、动态配置等）**，
同时对每一个问题都提供了配套组件实现，形成了一套微服务整体解决方案，让使用 Dubbo 及 Spring Cloud 的用户在开发微服务应用时可以专注在业务逻辑开发上。

* **Dubbo 和 Spring Cloud 都完全兼容 Spring 体系的应用开发模式**，Dubbo 对 Spring 应用开发框架、Spring Boot 微服务框架都做了很好的适配， 
  由于 Spring Cloud 出自 Spring 体系，在这一点上自然更不必多说。

虽然两者有很多相似之处，但由于它们在诞生背景与架构设计上的巨大差异，**两者在性能、适用的微服务集群规模、生产稳定性保障、服务治理等方面都有很大差异**。

Spring Cloud 的优势在于：

* 同样都支持 Spring 开发体系的情况下，Spring Cloud 得到更多的原生支持    
* 对一些常用的微服务模式做了抽象如服务发现、动态配置、异步消息等，同时包括一些批处理任务、定时任务、持久化数据访问等领域也有涉猎     
* 基于 HTTP 的通信模式，加上相对比较完善的入门文档和演示 demo 和 starters，让开发者在第一感觉上更易于上手    

Spring Cloud 的问题有：

* 只提供抽象模式的定义不提供官方稳定实现，开发者只能寻求类似 Netflix、Alibaba、Azure 等不同厂商的实现套件，而每个厂商支持的完善度、稳定性、活跃度各异
* 有微服务全家桶却不是能拿来就用的全家桶，demo 上手容易，但落地推广与长期使用的成本非常高
* 欠缺服务治理能力，尤其是流量管控方面如负载均衡、流量路由方面能力都比较弱
* 编程模型与通信协议绑定 HTTP，在性能、与其他 RPC 体系互通上存在障碍
* 总体架构与实现只适用于小规模微服务集群实践，当集群规模增长后就会遇到地址推送效率、内存占用等各种瓶颈的问题，但此时迁移到其他体系却很难实现
* 很多微服务实践场景的问题需要用户独自解决，比如优雅停机、启动预热、服务测试，再比如双注册、双订阅、延迟注册、服务按分组隔离、集群容错等

而以上这些点，都是 Dubbo 的优势所在：

* 完全支持 Spring & Spring Boot 开发模式，同时在服务发现、动态配置等基础模式上提供与 Spring Cloud 对等的能力。
* 是企业级微服务实践方案的整体输出，Dubbo 考虑到了企业微服务实践中会遇到的各种问题如优雅上下线、多注册中心、流量管理等，因此其在生产环境的长期维护成本更低
* 在通信协议和编码上选择更灵活，包括 rpc 通信层协议如 HTTP、HTTP/2(Triple、gRPC)、TCP 二进制协议、rest等，序列化编码协议Protobuf、JSON、Hessian2 等，支持单端口多协议。
* Dubbo 从设计上突出服务服务治理能力，如权重动态调整、标签路由、条件路由等，支持 Proxyless 等多种模式接入 Service Mesh 体系
* 高性能的 RPC 协议编码与实现，
* Dubbo 是在超大规模微服务集群实践场景下开发的框架，可以做到百万实例规模的集群水平扩容，应对集群增长带来的各种问题
* Dubbo 提供 Java 外的多语言实现，使得构建多语言异构的微服务体系成为可能

## 核心优势
### 快速易用
* 多语言 SDK：Dubbo 提供几乎所有主流语言的 SDK 实现，定义了一套统一的微服务开发范式。Dubbo 与每种语言体系的主流应用开发框架做了适配，
  总体编程方式、配置符合大多数开发者已有编程习惯。 
  
* 任意通信协议：Dubbo 微服务间远程通信实现细节，支持 HTTP、HTTP/2、gRPC、TCP 等所有主流通信协议。与普通 RPC 框架不同，
  Dubbo 不是某个单一 RPC 协议的实现，它通过上层的 RPC 抽象可以将任意 RPC 协议接入 Dubbo 的开发、治理体系。

* 项目脚手架

  <a href="https://start.dubbo.apache.org/bootstrap.html">脚手架</a>
  
  <a href="https://cn.dubbo.apache.org/zh-cn/overview/tasks/develop/template/">脚手架官方文档</a>
  
  <img src="/assets/img/dubbo03.png">

* 开发测试：相比于单体应用，微服务分布式的特性会让不同组织之间的研发协同变得困难，这时我们需要有效的配套工具，用来提升整体的微服务研发效率。         
  Dubbo 从内核设计和实现阶段就考虑了如何解决开发、测试与运维问题，比如 Dubbo RPC 协议均支持 curl 访问，让开发协作更简单；
  配合官方提供的生态工具，可以实现服务测试、服务 Mock、文档管理、单机运维等能力，并通过 Dubbo Admin 控制台将所有操作都可视化的展现出来。
  
  <img src="/assets/img/dubbo03.png">

### 超高性能
Dubbo 被设计用于解决阿里巴巴超大规模的电商微服务集群实践，并在各个行业头部企业经过多年的十万、百万规模的微服务实践检验， 因此，
Dubbo 在通信性能、稳定性方面具有无可比拟的优势，非常适合构建近乎无限水平伸缩的微服务集群，这也是 Dubbo 从实践层面优于业界很多同类的产品的巨大优势

<a href="https://cn.dubbo.apache.org/zh-cn/overview/what/advantages/performance/">官方文档</a>
### 服务治理
* 流量管控:在地址发现和负载均衡机制之外，Dubbo 丰富的流量管控规则可以控制服务间的流量走向和 API 调用，
  基于这些规则可以实现在运行期动态的调整服务行为如超时时间、重试次数、限流参数等，通过控制流量分布可以实现 A/B 测试、金丝雀发布、
  多版本按比例流量分配、条件匹配路由、黑白名单等，提高系统稳定性。

* 微服务生态:围绕 Dubbo 我们构建了完善的微服务治理生态，对于绝大多数服务治理需求，通过简单几行配置即可开启。
  对于官方尚未适配的组件或者用户内部系统，也可以通过 Dubbo 扩展机制轻松适配。
  
* 可视化控制台:Dubbo Admin 是 Dubbo 官方提供的可视化 Web 交互控制台，基于 Admin 你可以实时监测集群流量、服务部署状态、排查诊断问题。

* 安全体系:Dubbo 支持基于 TLS 的 HTTP、HTTP/2、TCP 数据传输通道，并且提供认证、鉴权策略，让开发者实现更细粒度的资源访问控制。

* 服务网格:基于 Dubbo 开发的服务可以透明的接入 Istio 等服务网格体系，Dubbo 支持基于 Envoy 的流量拦截方式，
  也支持更加轻量的 Proxyless Mesh 部署模式。

<a href="https://cn.dubbo.apache.org/zh-cn/overview/what/advantages/governance/">官方文档</a>

## 快速开发

### 创建项目
<a href="https://start.dubbo.apache.org/bootstrap.html">Dubbo微服务项目脚手架</a>（支持浏览器页面、命令行和 IDE）
可用于快速创建微服务项目，只需要告诉脚手架期望包含的功能或组件，脚手架最终可以帮助开发者生成具有必要依赖的微服务工程。

<img src="/assets/img/dubbo03.png">




