---
title: 关于使用redis实现消息队列
date: 2024-02-20
tags: [技术, Redis, 消息队列]
description: 深入探讨如何使用 Redis 实现消息队列，包括 List、Pub/Sub、Streams 三种方案的对比分析...
---

### 消息队列
#### 核心能力：解耦和削峰
##### 关于解耦
当我们在网上购买商品后，快递员进行快递的寄送，如果快递员强烈要求我们需要当面签收，这可能会让正在处理其他事情的我们不得不停下手中的事，去到小哥面前进行签收，这同样耽误了快递小哥寄送其它的快递。

:::tips
<font style="color:rgb(63, 63, 63);">上述例子就类似于我们在业务流程中基于 http/rpc 发起的一次同步请求，上游（快递小哥）在发出请求后（打电话），会阻塞等待下游（作为签收方的我们）给到反馈（完成签收操作），否则整个流程会一直阻塞住.</font>

:::



而实际上，快递小哥可以将快递存放在快递超市，然后通过信息告知我们快递的寄存，这样我们就可以各自忙各自的事情，整个流程就显得灵活很多。由于有快递超市这个缓冲区的存在，使得我们和快递小哥之间的交互流程能够实现解耦. 

:::tips
<font style="color:rgb(63, 63, 63);">在这个流程中，快递小哥就类似于生产者 producer，我们作为接收方，类似于消费者 consumer，而负责承上启下、托管快递的快递超市则类似于消息队列 mq.</font>

:::



**从技术层面，对mq的解耦进行阐述：**

在有了mq后，生产者producer不对再过多的关心consumer的身份信息，只需要将消息按照对应的协议投递到对应的topic即可

producer在完成了消息的投递后，即可认为完成了该次任务，相比于同步请求下游，整个流程变得更加轻便灵活，有了更高得吞吐量

而对于consumer，因为有consumer作为缓冲层，我们只需要设置好合理的消费规则，按照指定的速率进行消费，能够在很大程度上对consumer起到保护作用。



##### 关于削峰
倘若我们一次性购买了很多商品，快递在同一时间进行堆积，快递站就为我们起到了削峰的作用。我们无需在第一时间进行立刻的处理，而是可以选择合适的时间进行取出，且分几次取出同样是可以的。



上述所说的流程就类似mq的削峰能力。在实际的生产环境中，如果上游请求量很大，而下游都需要第一时间进行同步响应的话，必然会对下游系统造成很大的负荷。但如果我们通过mq的削峰能力，将同步转换为异步，让下游可以依据自身的消费能力进行消息的消费，就可以很好的保护下游系统。



在谈完以上的内容后，我们可以想想作为消息组件需要具备哪些基础功能

最重要的便是确保**消息不丢失**

关于这点，我们需要从三个点进行保证

+ producer将msg投递至mq不丢失
+ msg存放在mq不丢失
+ 消费者消费mq不丢失



关于第二点，大多是通过数据盘和数据备份的方式进行保证的

而对于第一点和第三点，我们则是通过两个交互环节的ack进行保证，即at least once（至少一次）

就第一点进行举例，我们将msg投递至mq后，只有当我们接收到mq的ack反馈后，我们才能认为本次消息的投递是正确完成的，否则我们就认为投递失败，需要进行重新投递。第三点同样如此。

对此，我们却无法保证消息的不重复性，为此我们需要确保在最下游的consumer具备消息幂等去重的能力，避免流程被重复处理。

<!-- 这是一张图片，ocr 内容为：正常处理 消息重复发送 消费者 MESSAGE QUEUE 消息重复? LLLLLI 幂等去重 是 忽略 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708672526679-65119a94-a29f-41b7-8130-d25ec6819d4b.png)



其次便是**消息存储**

当产生多条消息时，mq可以帮我们存储这些信息，使得我们可以在需要消费时进行消费

<!-- 这是一张图片，ocr 内容为：消息队列 生产方 消费方 MESSAGE 9个 QUEUE 投递消息 合适时机消费消息 入,...... 消息存储在缓冲区 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708672625786-b5e39c56-0453-415a-a245-f904bb7eecef.png)





#### 流程类型
从消费者的角度出发，我们可以分为`push`和`pull`

**push：**

该方式是mq主动将相关信息发送给建立了订阅关系的消费方

**pull：**

该方式是当mq中存在消息时，消费者主动向mq进行拉取消息



而对于他们的**优缺点：**

push的方式，可以保证消息的实时性，比较契合发布/订阅模式。但我们都知道mq的一个核心能力便是解耦，而主动将消息发送给消费者似乎不是很好，但对此我们可以通过消费限流的方式进行弥补。

pull的方式，则让下游消费者更加具有主动权，能够在合适的时机进行消费。而其缺点便是实时性会弱一些，和主动 pull 的轮询机制有关



### redis实现mq的问题
<!-- 这是一张图片，ocr 内容为：存储昂贵 REDIS本身是基于内存实现的缓存组件,因此在存储消息时总容量相对有限. 数据丢失 此外,REDIS存储消息时会不可避免地存在数据丢失的风险,可以从两个方面出发考虑: .内存是易失性存储.即便REDIS中有RDB/AOF之类的持久化机制加以弥补,但这个持久化流程是异步执行 的,无法提供百分百的保证力度 REDIS,走的是AP高可用流派,数据的主从复制流程是异步执行的,主从切换时数据存在弱一致问题 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708674070214-d2a7fe1a-ac54-41f7-90c3-f2f1688769f0.png)



### redis list
redis的list是一个双向链表，十分的契合mq的queue队列模型。我们在使用list时，我们可以将mq的生产消息的操作具象化成一次将数据追加到list尾部的操作；同时，我们可以把消费消息的流程具象化一次从list头部获取数据额操作。

<!-- 这是一张图片，ocr 内容为：REDIS 生产方 消费方 DATA DATA 国个 LPUSH LIST RPOP 充当 REDIS LIST MQ -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708674665134-ea798b37-54dc-4a3d-920d-ae127fa649e2.png)



#### 操作指令
<!-- 这是一张图片，ocr 内容为：首先,在使用LIST充当消息队列时,LIST对应的KEY则对应为消息的TOPIC名称 OPIC名称 PRODUCER在投递消息时,可以使用IPUSH指令,对应的时间复杂度为0(1),指令文档链接; HTTPS://REDIS.IO/COMMANDS/LPUSH/ 127.0.0.1:6379> LPUSH MY_LIST_TOPIC MSG (INTEGER) 1 MY_LIST_TOPIC:TOPIC名称 MSG:投递的消息内容 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708674754432-5e76c1c7-290e-4d60-91c9-5f03d94297d3.png)

<!-- 这是一张图片，ocr 内容为：消费消息时,使用RPOP指令,对应的时间复杂度O(1).指令文档链接: CONSUMER HTTPS://REDIS.IO/COMMANDS/RPOP/ RPOP MY_LIST_TOPIC 127.0.0.1:6379> TMSG MY_LIST_TOPIC:TOPIC名称 MSG:获取到的消息 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708674764893-422f0c24-728c-474f-aa65-f824422aff5b.png)



#### 消费流程分析
对于该种类型的操作，存在的第一个问题是，comsumer应该如何组织主动拉取策略。

首先，在consumer进行消息消费时，一定是一个类似loop thread的自旋模型，每一轮循环中，通过rpop从list中进行消费，如果读取到了消息再进行相关的处理。

值得注意的是，list的rpop是非阻塞的，即在list没有数据时，也会返回一个nil的响应数据，这就使得我们这一段自旋程序多少有些尴尬：

一方面，我们无法保证每次的list中都存在数据，如果返回了nil数据被我们捕获时，再次进行循环可能毫无意义。且这样的高频率的自选程序，对我们的程序也是一种消耗。

另一方面，我们可以选择让consumer进行休眠，但该操作我们很难合理的把控。



但我们可以通过`brpop`得以解决，该方法可以使得list在没有数据时进行阻塞，而在有数据则进行响应

<!-- 这是一张图片，ocr 内容为：127.0.0.1:6379> BRPOP MY_LIST TOPIC O 1) "MY LIST TOPIC" 2) "MSG" MY_LIST_TOPIC:TOPIC名称 .0:阻塞等待的超时时长,达到此阅值仍未决取数据时会返回而L,如果设置为0,则代表没有这个超时限 制. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708677050035-63444c30-5b17-417b-bcda-071e41255c01.png)

<!-- 这是一张图片，ocr 内容为：2.3局限性分析 即便我们采用BRPOP 解决了 CONSUMER 合理阻塞消费数据的问题,这种基于REDIS LIST 实现的 MQ仍然不能称为一个成熟的实现方案,其中主要存在着以下几项缺陷: 无法支持发布/订阅模式 LIST中的数据是独一份的,被POP出去后就不复存在了. 因此REDIS.中的LIST是无法支持MG.中的发布/订阅模式的,即下游倘若存在多个独立的消费者. 组CONSUMERGROUP,各自都需要独立获取一份完整的数据,那么此时通过REDIS LIST 是无法 满足这个诉求的. 无法支持消费端ACK机制 CONSUMER通过BRPOP获取到数据后,倘若发生启机或者其他意外错误,没有一种有效的手段 能给予MQ一个消息处理失败的反馈.这条消息一旦从LIST中被取走,就不再有机会被重新获取 了,因此在这个场景下,消息就真的丢失了. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708677088507-ab06adb5-ef28-45fb-9d79-06b7452d3f6b.png)



### redis pub/sub
为解决redis list无法实现发布、订阅的功能，redis提供了pub/sub

在实现上，pub/sub会在publisher和subscriber之间建立一个用于实时通讯的通道——channel。在传递信息时，会依据channel查找到所有建立过订阅关系的subscriber，一一将消息进行送达。



#### 操作指令
<!-- 这是一张图片，ocr 内容为：首先,消费方SUBSCRIBER通过SUBSCRIBE指令建立对某个CHANNEL的订阅关系.指令文档: HTTPS://REDIS.IO/COMMANDS/SUBSCRIBE/ 127.0.0.1:6379> SUBSCRIBE MY_CHANNEL_TOPIC READING MESSAGES... (PRESS CTRL-C TO QUIT) 1) "SUBSCRIBE" "MY_CHANNEL_TOPIC" 2) 3) (INTEGER) 1 MY.CHANNEL.TOPIC:TOPIC名称 每个通过SUBSCRIBE指令建立CHANNEL订阅关系的使用方都会被视为一个独立的 SUBSCRIBER,后续CHANNEL 中有消息到达时,会被复制成多份,一一推送到各个 SUBSCRIBER 手中, -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708701480966-5e76825d-76ed-4be7-842a-756815802955.png)

<!-- 这是一张图片，ocr 内容为：消费方A SUBSCRIBE 消费方B CHANNEL 1个 SUBSCRIBE 消费方C SUBSCRIBE -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708701511826-bc8fecce-ee25-4196-810f-bc9e91cdf6e8.png)

<!-- 这是一张图片，ocr 内容为：生产方 PUBLISHER 通过 通过PUBLISH指令往对应的CHANNEL中执行消息投递操作.指令文档: HTTPS://REDIS.IO/COMMANDS/PUBLISH/ 127.0.0.1:6379> PUBLISH MY_CHANNEL_TOPIC MSG (INTEGER) 1 消费方A 天 DATA 生产方 消费方B CHANNEL DATA DATA SALAY ILLL PUBLISH 消费方C DATA -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708701538648-3c3748f1-4661-4e93-95e1-fbbf8ce32d96.png)

<!-- 这是一张图片，ocr 内容为：此时,之前对这个 CHANNEL执行过 SUBSCRIBE 操作的 SUBSCRIBER 都会接收到这则消息: 1) "MESSAGE" "MY_CHANNEL_TOPIC" 2) 3) "MSG" -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708701568426-072396b8-bb28-48c7-896b-599e17506c7b.png)

值得一提的是，消费者通过subscribe指令会对channel采用**阻塞模式进行监听**，只有在有消息到来时，才会从阻塞状态唤醒



#### 实现原理
<!-- 这是一张图片，ocr 内容为：REDIS SUBSCRIBER 更新CHANNEL与 执行指令: 是 SUBSCRIBE 映射关系 SUBSCRIBE CHANNEL SUBSCRIBER 4 SUBSCRIBER B CHANNEL PRODUCER SUBSCRIBER C 对应 查询 执行指令: 往各SUBSCRIBER CHANNEL 名单 SUBSCRIBER 缓冲区推MSG PUBLISH CHANNEL MSG BUFFER BUFFER BUFFER V! SUBSERIBE SUBSCRIBER C SUBSCRIBER.B SUBSCRIBER A 小徐先生的编程世界 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708702199793-d483c1d1-199d-4ffe-85a0-c83ac3f0e812.png)

<!-- 这是一张图片，ocr 内容为：*首先,消费方SUBSCIBER通过SUBSCIBE指令建立和指定CHANNEL之间的订阅关系.这时在REDIS中会维 护好CHANNEL和对应SUBSCRIBER列表的映射关系,并在内存中为每个在线活跃的SUBSCRIBER分配好一 个缓冲区BUFFER,用以承载后续到来的消息数据 .接下来随着PUBLISHER执行PUBLISH指令,往对应CHANNEL中投道消息后,此时REDIS会实时查看 CHANNEL对应SUBSCRIBER名单,往每个SUBSCRIBER的缓中区BUFFER中推送这条数据 .各执行了 SUBSCRIBE指令的SUBSCRIBER会处于阻塞监听缓中区BUFFER的状态,随着新数据到达, SUBSCRIBER会获取到这笔数据 基于这个流程,我们能看出来,PUB/SUB/SUB对于CHANNEL 以及SUBSCRIBERS之间的实时映射关 系存在强依赖,因此在操作的执行顺序上,我们需要保证先执行SUBSCRIBE指令,再执行 PUBLISH执行,否则前几笔PUBLISH 投通的数据就会因为不存在 SUBSCRIBER 而被直接丢弃. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708702215184-54c2197e-ad9f-4105-b5cc-e6eac61295be.png)



#### 优缺点分析
关于sub/pub最大的优点就是支持发布/订阅模式，同一份消息会推送给所有通过subscribe操作进行订阅操作了该channel的subscriber



而其缺点也很明显，便是不支持ack机制，当subscriber接收消息失败后，想要执行消息的重放操作是无法做到的

缺乏消息存储能力，redis的sub/pub仅仅是维护了channel和subscribe的映射关系，而对于其中的消息确实即来即走的，容易发生消息的丢失，关于消息的丢失存在以下几个场景：

<!-- 这是一张图片，ocr 内容为：,SUBSCIBER言机:俏若某个SUBSCRIBER中途言机,则会被提出名单,在恢复前的这段时间内,到达的 消息都会彻底与这个SUBSCRIBER无缘 消费方A DATA 生产方 消费方B CHANNEL 宕机 DATA DOTA 消息丢失 PUBLISH 消费方C DATA -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708702648572-cc8c60db-c6e0-42fe-869a-0a7deeb59616.png)

<!-- 这是一张图片，ocr 内容为：REDISS启机:每条PUBLISH的消息都会第一时间分发到SUBSCIIBER对应的内存缓中区中,而这个缓中区 是完全基于内存实现的易失性存储.一旦REDIS服务端客机,缓中区中的数据就完全丢失目不可饮复了. 此外, PUB/SUB 模式下的消息数据不属于REDIS 中的基本数据兴型,因此REDIS 中的寿久化机制RDB 和AOF对于PUB/SUB中的数据是完全不生效的,数据丢失的可能性大幅度提高 .SUBSCRIBER消息积压:由于消息数据会被放在REDIS侧各SUBSCIBER的缓中区BUFFER中,这部分空间 是相对有限的,一旦基个SUBSCIBER因为消费能力弱,导致BUFFER中的的数据发生积压,此时REDIS 很可能会自动把SUBSCRIBER踢除下线,于是这部分数据也丢失了 REDIS 生产方 消费方 CHANNEL DATA DATA VII PUBLISH 缓冲区6UFFER -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708702744300-0c2699bc-ea5b-469f-ad73-62f65b453142.png)

<!-- 这是一张图片，ocr 内容为：针对最后这一点,SUBSCRIBER对应的缓冲区容量阈值可以在REDIS.CONF文件中进行配置,其默 认值为: CLIENT-OUTPUT-BUFFER-LIMIT PUBSUB 32MB 8MB 60 对应的含义是,倘若某个SUBSCRIBER的缓冲区BUFFER大小达到32MB,则 SUBSCRIBER 会被 踢下线;俏若缓冲区内数据量在连续60S内达到8MB大小,SUBSCRIBER也会踢下线. 聊到这里,我们发现不论是REDIS中的LIST还是PUB/SUB功能,各自都存在看比较明显的功能 缺陷,都是无法被当作一个成熟的MG组件来使用的, -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708702774675-32038578-28bf-42b0-a6c5-2cae8965b427.png)



### redis stream
从redis5.0开始，一个新的数据类型——stream被推出了。这种数据类型的目标正是奔着实现mq的组件的功能去的。



#### 执行操作
关于redis stream使用时涉及到的几个核心操作指令

<!-- 这是一张图片，ocr 内容为：消费者组A REDIS XREADGROUP 生产者 X4CK STREAMS XREADGROUP X4DD 消费者组B MSGID4 MSGID3 MSGID2 MSGID1 XACK -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708702993790-f35f50e4-8f49-4658-bc4b-2bd893a4e50f.png)

**生产消息**

<!-- 这是一张图片，ocr 内容为：首先是用于生产消息的指令,通过XADD指令往TOPIC中投入一组KV对消息,指令文档: HTTPS://REDIS.IO/COMMANDS/XADD/ XADD MY_STREAMS TOPIC KEY1 VAL1 "1638515664470-0" 1 * KEY2 VAL2 XADD TOPIC1 "1638515672769-0" MY_STREAMS_TOPIC:TOPIC名称 .*:消息自动生成唯一标识ID,基于时间戳+自增序号生成 KEY1/VAL1,KEY2/VAL2:消息数据KV对 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703080219-51b51054-9a61-44b8-813a-7f4c1bfe2e5d.png)

**消费消息**

<!-- 这是一张图片，ocr 内容为：接下来是用于消费消息的指令,通过XREAD指令从对应TOPIC中获取消息,指令文档: HTTPS://REDIS.IO/COMMANDS/XREAD/ XREAD STREAMS MY STREAMS TOPIC O-0 1) 1) "MY_STREAMS_TOPIC" "1638515664470-0" 2) 1) 1) 2) 1) "KEY1" 2) "VAL1" 2) 1) "1638515672769-0" 2) 1) "KEY2" 2) "VAL2" STREAMSTOPIC:TOPIC名称 MY_ .0-0:从头开始消费.俏若这里填为某条消息ID,则代表从这条消息之后(不包含这条消息)开始消费 阻塞模式消费消息: -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703099003-1d025a8b-e7c8-4ddd-80e7-4e5c045fee82.png)

**streams支持在消费时，采用阻塞模式进行消费，俏若存在数据则即时返回处理，否则会阻塞消**

**费流程**

<!-- 这是一张图片，ocr 内容为：STREAMS支持在消费时,采用阻塞模式进行消费,俏若存在数据则即时返回处理,否则会阻塞消 费流程 #BLOCK?表示阻塞等待时没有超时时间上限 XREAD BLOCK O STREAMS IS MY_STREAMS_TOPIC 1638515672769-0 (NIL) BLOCK:阻塞消费模式 .0:阻塞等待超时时间,超过这个时长会返回NIL.设置为0则表示不设置超时阈值 创建消费者组 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703169827-2a08c680-cee9-4045-ad7b-1daf4bd840bb.png)

**streams 也支持发布订阅模式，能保证消息被多个消费者组 consumer group 同时消费到**

<!-- 这是一张图片，ocr 内容为：STREAMS 也支持发布订阅模式,能保证消息被多个消费者组 CONSUMER GROUP 同时消费到. 首先需要进行消费者组的创建.指令文档:HTTPS://REDIS.JO/COMMANDS/XGROUP-CREATE/ XGROUP CREATE MY STREAMS TOPIC MY GROUP O-O OK MY STREAMS TOPIC:TOPIC名称 MY.GROUP:消费者组名称 0-0:从头开始消费 基于消费者组消费消息 同一份数据在同一个消费者组下只会被消费到一次.不同消费者组各自能获取到独立完整的消息数 据. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703401886-956ad134-7d49-4548-adf6-169f67f6484e.png)

<!-- 这是一张图片，ocr 内容为：通过XREADGROUP指令,以消费者组的身份进行消费.指令文档: HTTPS://REDIS.IO/COMMANDS/XREADGROUP/ O STREAMS MY_STREAMS_TOPIC > XREADGROUP GROUP MY GROUP CONSUMER BLOCK O 1) 1) "TOPIC1" 2) 1) 1) "1638515664470-0" 2) 1) "KEY1" 2) "VAL1" 2) 1) "1638515672769-0" 2) 1) "KEY2" 2)"VAL2" MY_GROUP:消费者组名称 CONSUMER:消费者名称 MY_STREAMS_TOPIC:TOPIC名称 :BLOCK 0:采用阻塞等待的模式,0代表没有超时上限 :读最新的消息(尚未分配给某个 CONSUMER的消息) -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703538501-8daed9f3-5ece-4cdd-82b5-26ea58fbe8f8.png)

<!-- 这是一张图片，ocr 内容为：还有另一种消费模式,读取的是已分配给当前消费者,但是还未经确认的老消息: XREADGROUP GROUP MY_GROUP CONSUMER STREAMS MY_STR _STREAMS_TOPIC O-0 1) 1) "TOPIC1" 2) 1) 1) "1638515664470-0" 2) 1) "KEY1" 2) "VAL1" 2) 1) "1638515672769-0" 2) 1) "KEY2" 2) "VAL2" .0-0:标识读取已分配给当前CONSUMER,但是还没经过XACK指令确认的消息 确认消息: 通过XACK指令,携带上消费者组,TOPIC名称以及消息ID,能够完成对某条消息的确认操作. 文档链接:HTTPS://REDIS.IO/COMMANDS/XACK/ 127.0.0.1:6379> XACK MY STREAMS TOPIC MY GROUP 1638515664470-0 (INTEGER) 1 MY_STREAMS TOPIC:TOPIC名称 MY_GROUP:消费者组名称 1638515664470-0:消息ID -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703584205-10fefb63-8f64-4eb7-b3b3-dd46cb37129a.png)



#### 优缺点分析
**支持发布/订阅模式**

redis streams引入了消费者组group的概念，因此是能够保证各个消费者组consumer group获取一份独立而完整的信息



**数据可持久化**

<!-- 这是一张图片，ocr 内容为：REDIS 中的 STREAMS和 STRING,LIST等数据类型一样,都能够通过RDB(REDIS DATABASE). AOF( AP (APPENDONLYFLE)的持久化机制进行落盘存储,能够在很大程度上降低数据丢失的概率. REDIS STREAMS MSGID4 MSGID3 MSGIDA MSGID1 持久化 持久化 (40F) APPEND ONLY FILE REDIS DATABASE (RDB) RECORDING INCREMENTAL SNAPSHOT -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703711111-c1e128da-a335-4b2e-8c46-2664c25a6639.png)



**支持消费端ack机制**

<!-- 这是一张图片，ocr 内容为：CONSUMER 的 ACK能力.CONSUMER 在处理 REDISSTREAMS中另一项非常重要的改进,是支持 好某条消息后,能通过XACK指令对该消息进行确认.这样对于没经过ACK确认的消息,REDIS STREAMS还是为CONSUMER保留了重新消费的能力. REDIS MSGIDA 消费者组A STREAMS XREADGROUP X4CK MSGIDA MSGID4 MSGID3 MSGID2 MSGID1 消费者组A 小徐先生的编程世界 消费进度 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708703848667-6289e4d3-d3ee-4b02-8a47-37d3bb4d6c94.png)



**支持消息缓存**

<!-- 这是一张图片，ocr 内容为：和PUB/SUB模式不同的是,REDISS LISSTREAMS中会实际开辟内存空间用于存储STREAMS 中的数 据.因此哪伯某个CONSUMERGROUP是在消息生产之后才完成注册操作,也能够进行消息湖源, 从TOPIC起点开始执行消息的消费操作. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708704096422-21282cea-2cf8-40fe-a802-4ec7bd2fdee3.png)

这里需要考虑的是，redis是基于内存实现消息数据的存储，倘若大量的消息进行堆积为及时进行消费而堆积在内存上，可能会导致OOM问题。

基于此，redis stream支持在每次投递消息时，显示的设置一个topic中能缓存的数据长度，来认为的限制这个缓存空间的容量。

<!-- 这是一张图片，ocr 内容为：参数,用于指定TOPIC中能缓存的数据长度: 这里可以通过在XADD指令中加上 MAXLEN TOPIC1 MAXLEN 10000 KEY1 VAL1 XADD TO MAXLEN10000:最多缓存10000条数据 这样倘若TOPIC数据容量超限,则新消息的到达会把最老的消息挤出队列,意味着也可能存在数 据丢失的风险,因此大家在使用时需要合理设置MAXLEN参数. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708704087937-498f8426-f952-4d74-b04f-b487a94a0765.png)

<!-- 这是一张图片，ocr 内容为：REDIS 设置 STREAMS最大长度为4 STREAMS 老消息丢弃 新消息到达 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708704107550-d607cdb0-e86e-4327-96ca-ba46e5fdf4cb.png)



#### 整体分析对比
<!-- 这是一张图片，ocr 内容为：到这里为止,最后一个实现方案REDISSTREAMS也介绍完毕,最后我们回过头对今天介绍过的几 类REDIS实现MQ的方案进行一轮总结, 消费端ACK机制 数据丢失风险 实现方案 发布/订阅能力 消息缓存能力 MQ 不支持 支持 不支持 低高低 LIST 不支持 不支持 支持 PUB/SUB 支持 支持 支持 STREAMS 可以看到,在各项能力上LIST和PUB/SUB互有干秋,而STREAMS 可以说是兼具了各方面的优 势,称得上是已经趋近于成熟的MQ实现方案. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708704149281-91989e60-dced-4e95-be92-e21187d6dcb3.png)

<!-- 这是一张图片，ocr 内容为：然而,大家应该能注意到,我在此处评价STREAMS方案的数据丢失风险时,仅仅是评价为"低". 而不是"无",这一点我接下来会继续加以说明. S和业界专业的MQ组件进行对比,就以我比较熟悉的 下面我们再进一步拿REDISSTREAMS和 KAFKA组件为例,来看看 REDIS STREAM存在哪些方面的优劣: 运维成本 消息分区/并发能力 MQ组件 数据丢失风险 消息存储介质 低 低 不支持 内存 REDIS STREAMS 理论上不存在 支持 磁盘 偏高 KAFKA 可以看到,REDIS STREAMS在存储介质上需要使用内存,因此消息存储容量相对有限:且同一个 TOPIC的数据由于对应为同一个KEY,因此会被分发到相同节点,无法实现数据的纵向分治,因 此不具备类似于KAFKA纵向分区以提高并发度的能力. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27677393/1708704182208-36c9725c-db0c-4626-91f1-b89bf0aa005b.png)



此外，很重要的一个点是，基于 redis 实现的 mq 一定是存在消息丢失的风险的. 尽管在生产端和消费端，producer/consumer 在和 mq 交互时可以通过 ack 机制保证在交互环节不出现消息的丢失，然而在 redis 本身存储消息数据的环节就可能存在数据丢失问题，原因在于：

+ • redis 数据基于内存存储：哪怕通过最严格 aof 等级设置，由于持久化流程本身是异步执行的，也无法保证数据绝对不丢失
+ • redis 走的是 ap 高可用流派：为保证可用性，redis 会在一定程度上牺牲数据一致性. 在主从复制时，采用的是异步流程，倘若主节点宕机，从节点的数据可能存在滞后，这样在主从切换时消息就可能丢失

与之相对的，kafka 只要合理设置好 ISR（In Sync Replica） 有关参数，理论上在集群存在多数节点仍能正常运作的情况下，对应的消息数据是不会出现丢失的.



前面我们谈到了 redis 相比于传统 mq 组件的一些劣势，现在我们再来聊聊它具备的一些优势：就是相对轻量化，相比于传统 mq 组件有着更低的使用和运维成本.

因此，在实际的选型过程中，我们可以根据业务诉求进行抉择. 倘若业务流程对于数据的精度没有特别严格的要求，那此时使用 redis streams 这样一种轻量化的 mq 实现方案未尝不是一种好的选择和尝试.

<font style="color:rgb(63, 63, 63);"></font>

<font style="color:rgb(63, 63, 63);"></font>

