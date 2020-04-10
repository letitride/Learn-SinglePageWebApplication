# docker mongodb

```
$ docker exec -it mongodb_mongo_1 mongo -u root
Enter password: example
```

# seed
```
use spa;

db.user.insert({"name":"Terry","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
db.user.insert({"name":"Mike","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
db.user.insert({"name":"Rin","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
db.user.insert({"name":"Mika","is_online":false,"css_map":{"top":0,"left":120,"background-color":"rgb(136,255,136)"}});
```