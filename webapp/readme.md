# docker mongodb

```
$ docker exec -it mongodb_mongo_1 mongo -u root
Enter password: example
```

# seed
```
> use spa;

> db.user.insert({"name":"Terry","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
> db.user.insert({"name":"Mike","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
> db.user.insert({"name":"Rin","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
> db.user.insert({"name":"Mika","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
```

# 8.4.1 オブジェクト型を検証する

## 馬を示すMogoDBのコレクションを新規作成する
```
$ curl -X POST -H "Content-Type: application/json" -d '{"css_map":{"color":"#ddd","name":"ED"}}' localhost:3000/horse/create

$ curl -X POST -H "Content-Type: application/json" -d '{"css_map":{"color":"#2e0","name":"Winner"}}' localhost:3000/horse/create
```

## 馬の群を確認する

```
$ curl http://localhost:3000/horse/list
```

# 8.4.2.5 受信クライアントデータを検証する

```
# leftプロパティが欠落
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"Bety","css_map":{"background-color":"#ddd","top":22}}' localhost:3000/user/create

# 登録可能
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"Bety","css_map":{"background-color":"#ddd","top":22, "left":500 }}' localhost:3000/user/create

# 更新
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"Hana","css_map":{"background-color":"#ddd","top":22, "left":500 }}' localhost:3000/user/update/5e9133f3b06897647b0edaaf

# 削除
$ curl http://localhost:3000/user/delete/5e9133f3b06897647b0edaaf
```