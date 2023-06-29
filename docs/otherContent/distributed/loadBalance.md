> 负载均衡：顾名思义，就是把客户的请求分散给不同服务器，避免全部打到一台服务器崩溃。

![image-20230112110815156](markdown-img/loadBalance.assets/image-20230112110815156.png)

这里我们将负载均衡算法：

- 简单的负载均衡算法
  - 随机
  - 轮询

## 随机

### 普通随机

> 使用Random函数，在List的size里面随机

```java
public class Random {

    public static String getServer(){
        java.util.Random random = new java.util.Random();
        return ServerIps.LIST.get(random.nextInt(ServerIps.LIST.size()));
    }

    public static void main(String[] args){
        for (int i=0;i<10;i++){
            System.out.println(getServer());
        }
    }
}
```



### 权重随机

比如我们的每一个地址都有一个权重，这样我们该怎么按照权重随机呢？（**权重越大随机到的概率越大**）

```java
    public static final Map<String,Integer> WEIGHT_MAP= new LinkedHashMap<>();
    static {
        WEIGHT_MAP.put("192.168.0.1",1);
        WEIGHT_MAP.put("192.168.0.2",2);
        WEIGHT_MAP.put("192.168.0.3",3);
        WEIGHT_MAP.put("192.168.0.4",4);
        WEIGHT_MAP.put("192.168.0.5",5);
        WEIGHT_MAP.put("192.168.0.6",6);
    };
```

我们重新**建立一个List表，然后获得我们的权重值，往里面插入address**即可。

```java
public class WeightRandom {

    public static String getServer(){
        List<String> ips = new ArrayList<>();

        for (String ip : ServerIps.WEIGHT_MAP.keySet()) {
            Integer weight = ServerIps.WEIGHT_MAP.get(ip);

            for (Integer i = 0; i < weight; i++) {
                ips.add(ip);
            }
        }
        Random random = new Random();
        return ips.get(random.nextInt(ips.size()));
    }

    public static void main(String[] args){
        for (int i=0;i<10;i++){
            System.out.println(getServer());
        }
    }
}

```



## 轮询



### 普通轮询

> 普通轮询是指按照list循环轮询即可

```java
    public volatile static int pos = 0;
    public static String getServer(){
        if (pos >= ServerIps.LIST.size()){
            pos=0;
        }
        String ip = ServerIps.LIST.get(pos);
        pos++;

        return ip;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 20; i++) {
            System.out.println(getServer());
        }
    }
```



### 权重轮询

> 按照权重来轮询，比如：
>
> 192.168.1.1   ：1
>
> 192.168.1.2   ：2
>
> 192.168.1.3   ：3

轮询结果为： **192.168.1.1 --192.168.1.2-- 192.168.1.2 -- 192.168.1.2 -- 192.168.1.3--192.168.1.3--192.168.1.3**

```java
    public static String getServer(){
        int totalOffset = 0;
        for (String s : ServerIps.WEIGHT_MAP.keySet()) {
            Integer weigth = ServerIps.WEIGHT_MAP.get(s);
            totalOffset+=weigth;
        }

        int requestId = RequestId.getIncrement();
        int offset = requestId%totalOffset;

        for (String ip : ServerIps.WEIGHT_MAP.keySet()) {
            Integer weight = ServerIps.WEIGHT_MAP.get(ip);
            if(offset<weight){
                return ip;
            }
            offset=offset-weight;
        }
        return  WeightRandom.getServer();
    }
```





### 平均加权轮询

> 分为**动态加权** 和 **静态加权**
>
> weight： 静态
>
> currentWeight ：动态

首先 currentWeight：0，0，0   A,B,C

| currentWeight +=weight | max(currentWeight) | result | max(currentWeight) -= sum(weight) | return |
| ---------------------- | ------------------ | ------ | --------------------------------- | ------ |
| 5,1,1                  | 5                  | A      | -2,1,1                            | A      |
| 3,2,2                  | 3                  | A      | -4,1,1                            | A      |
| 1,3,3                  | 3                  | B      | 1,-4 ,3                           | B      |
| 6,-3,4                 | 6                  | A      | -1,-3,4                           | A      |
| 4,-2,5                 | 5                  | C      | 4,-2,-2                           | C      |
| 9,-1,-1                | 9                  | A      | 2,-1,-1                           | A      |
| 7,0,0                  | 7                  | A      | 0,0,0                             | A      |

这样轮询的时候，同一地址ip就不会紧挨着了，就是一种**平滑加权算法**

```java
public class WeightRoundRobin {

    private static Map<String,Weight> WEIGHT = new ConcurrentHashMap<>();

    public static String getServer(){
        if (WEIGHT.isEmpty()){
            for (String ip : ServerIps.WEIGHT_MAP.keySet()) {
                Integer weight = ServerIps.WEIGHT_MAP.get(ip);
                WEIGHT.put(ip,new Weight(ip,weight,0));
            }
        }
        // 权重和 sum(weight)
        int total=0;
        for (Integer weight : ServerIps.WEIGHT_MAP.values()) {
            total+=weight;
        }
        // currentWeight += weight
        for (Weight weight : WEIGHT.values()) {
            weight.setCurrentWeight(weight.getCurrentWeight()+weight.getWeight());
        }

        // max(currentWeight)
        Weight maxCurrentWeight=null;
        for (Weight weight : WEIGHT.values()) {
            if(maxCurrentWeight ==null || weight.getCurrentWeight()>maxCurrentWeight.getCurrentWeight()){
                maxCurrentWeight=weight;
            }
        }
        // max(currentWeight) -= sum(weight)
        maxCurrentWeight.setCurrentWeight(maxCurrentWeight.getWeight()-total);
        // return
        return maxCurrentWeight.getIp();
    }
    public static void main(String[] args) {
        for (int i = 0; i < 20; i++) {
            System.out.println(getServer());
        }
    }
}
```



## 一致性哈希算法

![image-20230112140904065](markdown-img/loadBalance.assets/image-20230112140904065.png)

为了避免数据倾斜问题（节点不够分散，大量请求落到同一节点），还引入了虚拟节点的概念。通过虚拟节点可以让节点更加分散，有效均衡各个节点的请求了。

![image-20230112141059414](markdown-img/loadBalance.assets/image-20230112141059414.png)

> 哈希环，**任意地往集合里面放元素，会排序**。

我们先了解<font color='red'>TreeMap</font>的两个API firstKey()、tailMap("");

```java
    public static void main(String[] args) {
        TreeMap treeMap = new TreeMap<>();

        treeMap.put("1","1");
        treeMap.put("2","2");
        treeMap.put("3","3");
        treeMap.put("4","4");
        treeMap.put("5","5");
        // 有序  第一个key 是最小的key
        System.out.println(treeMap.firstKey());
        // 返回大于等于4的树
        SortedMap sortedMap = treeMap.tailMap("4");
        System.out.println(sortedMap.firstKey());
    }
```

![image-20230112143641012](markdown-img/loadBalance.assets/image-20230112143641012.png)

```java
public class ConsistentLoadBalance {

    private static TreeMap<Integer,String> virtualNodes = new TreeMap<>();
    private static final int VIRTUAL_NODES = 160;

    static {
        for (String ip : ServerIps.LIST) {
            for (int i = 0; i < VIRTUAL_NODES; i++) {
                int hash = getHash(ip+1);
                //放置虚拟节点
                virtualNodes.put(hash,ip);
            }
        }
    }

    private static String getServer(String client){
        int hash = getHash(client);

        //大于Hash，virtualNodes的子树的firstKey
        SortedMap<Integer, String> subMap = virtualNodes.tailMap(hash);
        
        Integer firstKey = null;
        //如果sumMap为null，证明大于此节点的子树为空，则从零开始
        if (subMap==null){
            firstKey = virtualNodes.firstKey();
        }else {
            firstKey  = subMap.firstKey();
        }
        return virtualNodes.get(firstKey);
    }


    private static int getHash(String str){
        final int p = 16777619;
        int hash =(int) 2166136261L;
        for (int i = 0; i < str.length(); i++) {
            hash = (hash ^ str.charAt(i)) *p;
            hash+=hash<<13;
            hash^=hash>>7;
            hash+=hash<<3;
            hash^=hash>>17;
            hash+=hash<<5;
            //如果算出来的值为负数则取绝对值
            if (hash < 0){
                hash= Math.abs(hash);
            }
        }
        return hash;
    }

}
```

