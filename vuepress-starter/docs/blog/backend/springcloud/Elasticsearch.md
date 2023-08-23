# Elasticsearch
    Elasticsearch是一款非常强大的开源搜索引擎，可以帮助我们从海量的数据中快速找到需要的内容。
    elasticsearch结合kibana，logstash，Beats，也就是elastic stack（ELK）。被广泛应用在日志数据分析，实时监控等领域。
    elasticsearch是elastic stack的核心，负责存储，搜索，分析数据。

<img src='/assets/img/el01.png'>

### Lucene
    Elasticsearch的底层基于Lucene，Lucene是一个java语言的搜索引擎类库，是Apache公司的顶级项目，由DoungCutting于1999年研发。
    Lucene的优势：易扩展，高性能（基于倒排索引）
    Lucene的缺点：只限于Java语言开发，学习曲线陡峭，不支持水平扩展
    而elasticsearch相对于Lucene的优势有：支持分布式，可水平扩展，提供Restful接口，可被任何语言调用

<a href="https://lucene.apache.org">Lucene官方网站</a>

<a href="https://www.elastic.co/cn">Elasticsearch官方网站</a>

## 正向索引和倒排索引
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

## 安装elasticsearch（Linux）
### 1.创建网络
因为我们还需要部署kibana容器，因此需要让es和kibana容器互联。这里先创建一个网络

``` sh
docker network create es-net
```
### 2.加载容器
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
### 3.运行elasticsearch
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

### 4.运行kibana
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

### 5.DevTools
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

## IK分词器
es在创建倒排索引时需要对文档分词;在搜索时，需要对用户输入内容分词。但默认的分词规则对中文处理并不友好。
### 在线安装
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
### 离线安装
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

### 扩展词词典
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

### 停用词词典
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

## 索引库
### mapping属性
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
### 创建索引库和mapping的DSL语法
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
### 查看，删除索引库
查看
``` properties
GET /索引库名称
```
删除
``` properties
DELETE /索引库名称
```
### 修改索引库
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
## 文档操作
### 插入文档
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
### 查找文档
``` properties
GET /索引库名/_doc/文档id
```
### 查找所有文档
``` properties
GET /索引库名/_search
```
### 删除文档
``` properties
DELETE /索引库名/_doc/文档id
```
### 修改文档
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
## RestClient
### ES官方提供了各种不同语言的客户端，用来操作ES。这些客户端本质就是组装了DSL语句，通过http请求发送给ES。

<a href="https://www.elastic.co/guide/en/elasticsearch/client/index.html">官方文档地址</a>

:::tip
在 Elasticsearch7.15版本之后，Elasticsearch官方将它的高级客户端 RestHighLevelClient标记为弃用状态。
同时推出了全新的 Java API客户端 Elasticsearch Java API Client，该客户端也将在 Elasticsearch8.0及以后版本中成为官方推荐使用的客户端。
:::

### 以下使用的是官方7.12.1 ，最新版本使用请参考官方文档
### 导入依赖
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
### 索引库操作
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
### 文档操作
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
## DSL查询语法
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

### DSL Query基本语法
``` properties
GET /索引库名/_search
{
  "query": {
    "查询条件": "条件值"
  }
}
```
### 全文检索查询
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
### 精确查询
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
### 地理查询
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
### 相关性算分
当我们利用match查询时，文档结果会根据与搜素词条的关联度打分（_score），返回结果时按照分值降序排列
#### TF算法
<img src='/assets/img/el10.png'>

#### TF—IDF算法
<img src='/assets/img/el11.png'>

#### BM25算法
<img src='/assets/img/el12.png'>

:::tip
新版本采用的是BM25算法，BM25算法相较于TF-IDF算法受词频影响较小，得分不会一直增加
:::

### Function Score Query
使用Function Score Query，可以修改文档的相关性算分（query score），根据新的到的分数进行排序

<img src='/assets/img/el13.png'>

### 复合查询Boolean Query
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
## 搜索结果处理
### 排序
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
### 分页
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
### 高亮
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
## RestClient进阶查询
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
### RestClient与文档对照
match_all

<img src='/assets/img/el15.png'>

解析

<img src='/assets/img/el14.png'>

高亮

<img src='/assets/img/el16.png'>