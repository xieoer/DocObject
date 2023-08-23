# Docker
## Docker的作用
### 解决依赖兼容问题
    Docker如何解决大型项目依赖关系复杂，不同组件依赖的兼容性问题?
    Docker允许开发中将应用、依赖、函数库、配置一起打包，形成可移植镜像
    Docker应用运行在容器中，使用沙箱机制，相互隔离
### 解决不同系统的环境问题
    Docker如何解决开发、测试、生产环境有差异的问题
    Docker镜像中包含完整运行环境，包括系统函数库，
    仅依赖系统的Linux内核，因此可以在任意Linux操作系统上运行
### Docker与虚拟机的差别
    docker是一个系统进程;虚拟机是在操作系统中的操作系统
    docker体积小、启动速度快、性能好;虚拟机体积大、启动速度慢、性能一般
## Docker架构
    镜像(lmage):Docker将应用程序及其所需的依赖、函数库、环境、配置等文件打包在一起，称为镜像。
    容器(Container):镜像中的应用程序运行后形成的进程就是容器，只是Docker会给容器做隔离，对外不可见。
    服务端:接收命令或远程请求，操作镜像或容器
    客户端:发送命令或者请求到Docker服务端
    DockerHub:一个镜像托管的服务器，类似的还有阿里云镜像服务，统称为DockerRegistry
## docker安装（linux）
### 1.安装docker

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

### 2.启动docker
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

## 镜像
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

## 自定义镜像
### Dockerfile
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

### 基于java:8-alpine镜像，将一个java项目构建为镜像
#### 新建一个空的目录，然后在目录中新建一个文件，命名为Dockerfile
#### 将打包好的jar包拷贝到目录下
#### 编写Dockerfile文件
``` sh
#指定基础镜像
FROM java:8-alpine

COPY ./docker-demo.jar /tmp/app.jar

#暴露端口
EXPOSE 8090

#入口，java项目的启动命令好
ENTRYPOINT java -jar /tmp/app.jar
```
#### 使用docker build命令构建镜像
进入项目目录，该目录下包含jar包和Dockerfile文件
```` sh
docker build -t javaweb:2.0 .
````
:::tip
最后有一个点，表示Dockerfile目录，因为是在当前目录，所以是一个点
:::
#### 使用docker run创建容器并运行

## 容器

<img src='/assets/img/docker02.png'>

    进入容器：docker exec [容器名]
    容器启动：docker start [容器名]
    停止容器：docker stop [容器名]
    查看日志：docker logs [容器名] -f
    查看所有容器运行状态：docker ps

### 运行容器
``` sh
docker run --name [容器的名字，自己起] -p 80:80 -d [镜像名称]
```
:::tip
docker run:创建并运行容器
--name:给容器起名
-p:将宿主机端口与容器端口映射，冒号左侧时宿主端口，右侧是容器端口
-d:后台运行
:::

### 进入容器
``` sh
docker exec -it [容器名称] bash
```
:::tip
-it:给当前进入的容器创建一个标准输入，输出终端，允许我们与容器交互
bash:进入容器后执行的命令，bash是一个linux终端交互命令
:::

## 数据卷
<img src='/assets/img/docker03.png'>

    数据卷（volume）是一个虚拟的目录，指向宿主机文件系统的某个目录

### 数据卷操作语法
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
### 数据卷挂载案例

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

## DockerCompose
    Docker Compose可以基于Compose文件帮我们快速的部署分布式应用，而无需手动一个个创建和运行容器!
    Compose文件是一个文本文件，通过指令定义集群中的每个容器如何运行。
### 安装DockerCompose
#### 1.Linux下需要通过命令下载
``` sh
# 安装
curl -L https://github.com/docker/compose/releases/download/1.23.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```
### 2.修改文件权限
``` sh
# 修改权限
chmod +x /usr/local/bin/docker-compose
```

## 微服务集群DockerCompose部署

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

#### Dockerfile文件

``` sh
FROM java:8-alpine
COPY ./app.jar /tmp/app.jar
ENTRYPOINT java -jar /tmp/app.jar
```
#### docker-compose.yml文件

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