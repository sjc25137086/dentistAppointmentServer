const express = require('express');
const pool = require('../pool.js');
const redis = require('../redis.js')
const zhenzismsClient = require('../public/zhenzisms.js')
    // const token = require('../public/token.js')
var router = express.Router();
var client = new zhenzismsClient('sms_developer.zhenzikj.com', '106857', '7704aef8-ca67-4ca7-ada0-edb3e36fcdc1');


router.post('/regsend', (req, res) => {
    let phone = req.body.phone;
    var params = {};
    params.templateId = '1836';
    params.number = phone;
    let sms = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
    redis.set(phone, sms);
    redis.expire(phone, 300)
    params.templateParams = [sms, "5分钟"];
    client.send(params);
    res.send({ code: 200 })
})
router.post('/register', (req, res) => {
    var phone = req.body.phone;
    var password = req.body.password;
    var sms = req.body.sms;
    console.log(sms);
    redis.get(phone, (err, data) => {
        if (data == sms) {
            let sql = "SELECT * FROM yy_user WHERE phone=?";
            pool.query(sql, [phone], (err, result) => {
                if (err) throw err;
                if (result != '') {
                    res.send({ code: 601 }) //601 手机号已存在
                } else {
                    let sql = "INSERT INTO yy_user(phone,password) values (?,?)";
                    pool.query(sql, [phone, password], (err, result) => {
                        if (err) throw err;
                        if (result.affectedRows > 0) {
                            let sql = "SELECT username,phone,id FROM yy_user WHERE phone=? AND password=?";
                            pool.query(sql, [phone, password], (err, result) => {
                                if (err) throw err;
                                if (result.length > 0) {
                                    res.send({ code: 200, result: result });
                                } else {
                                    res.send({ code: 500 });
                                }
                            })
                        } else {
                            res.send({ code: 500 });
                        }
                    })
                }
            })
        } else {
            res.send({ code: 400, msg: '验证码错误' });
        }
    })
})

router.get('/login', (req, res) => {
    let phone = req.query.phone;
    //   //生成token并保存至redis中,过期时间为7天
    //   let sessiontoken = token.createToken(phone);
    //   redis.set(phone,sessiontoken);
    //   redis.expire(phone,7*24*3600)

    let password = req.query.password;
    let sql = "SELECT username,phone,id FROM yy_user WHERE phone=? AND password=?";
    pool.query(sql, [phone, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send({ code: 200, result: result });
        } else {
            res.send({ code: 500 });
        }
        console.log(result)
    })
})
router.post('/forward', (req, res) => {
    let doctorid = req.body.doctorid;
    let fname = req.body.fname;
    let fage = req.body.fage;
    let fsex = req.body.fsex;
    let idCard = req.body.idCard;
    let phone = req.body.phone;
    let state = 2;
    let userid = req.body.userid;
    let time = req.body.time;
    let time2 = new Date().getTime();
    let sql = `insert into yy_forward(doctorid,fname,fage,fsex,idCard,phone,state,userid,createtime,time) values (?,?,?,?,?,?,?,?,?,?)`;
    pool.query(sql, [doctorid, fname, fage, fsex, idCard, phone, state, userid, time2, time], (err, result) => {
        if (err) throw err;
        let sql = 'insert into yy_time(doctorid,time) values (?,?)'
        pool.query(sql, [doctorid, time], (err, results) => {
            if (err) throw err;
            res.send({ code: 200 })
        })

    })
})
router.get('/doingforward', (req, res) => {
    var uid = req.query.uid;
    let sql = "select id,createtime,fname,time,state,doctorid from yy_forward where userid=? and state=2";
    pool.query(sql, [uid], (err, result) => {
        if (err) throw err;
        res.send({ code: 200, result });
    })
})

router.get('/overforward', (req, res) => {
    var uid = req.query.uid;
    let sql = "select id,createtime,fname,time,state,doctorid from yy_forward where userid=? and state!=2";
    pool.query(sql, [uid], (err, result) => {
        if (err) throw err;
        res.send({ code: 200, result });
    })
})

router.delete('/cancelforward', (req, res) => {
    var forwardid = req.query.forwardid;
    var doctorid = req.query.doctorid;
    var time = req.query.time;
    var sql = 'delete from yy_time where doctorid = ? and time = ?'
    pool.query(sql, [doctorid, time], (err, result) => {
        if (err) throw err;
        sql = 'update yy_forward set state=0 where id = ?'
        pool.query(sql, [forwardid], (err, result) => {
            if (err) throw err;
            res.send({ code: 200 })
        })
    })
})

router.get('/forwardmsg', (req, res) => {
    var forwardid = req.query.forwardid;
    var sql = 'select id,fname,fage,fsex,idCard,phone,doctorid,time,createtime,state from yy_forward where id = ?'
    pool.query(sql, [forwardid], (err, result) => {
        if (err) throw err;
        res.send({ code: 200, result: result })
    })
})
router.patch('/username', (req, res) => {
    let username = req.body.username;
    let id = req.body.id;
    let sql = 'update yy_user set username = ? where id =?'
    pool.query(sql, [username, id], (err, result) => {
        if (err) throw err;
        res.send({ code: 200 })
    })
})

router.patch('/phone', (req, res) => {
    let phone = req.body.phone;
    let id = req.body.id;
    let sql = "SELECT * FROM yy_user WHERE phone=?";
    pool.query(sql, [phone, id], (err, result) => {
        if (result == '') {
            let sql = 'update yy_user set phone = ? where id =?'
            pool.query(sql, [phone, id], (err, result) => {
                if (err) throw err;
                res.send({ code: 200 })
            })
        } else {
            res.send({ code: 601 }); //601 手机号已存在
        }
    })
})

router.patch('/password', (req, res) => {
    let sms = req.body.sms;
    let password = req.body.password;
    let phone = req.body.phone;
    redis.get(phone, (err, data) => {
        if (data == sms) {
            let sql = 'select id from yy_user where phone = ?'
            pool.query(sql, [phone], (err, result) => {
                if (err) throw err;
                if (result.length != 1) {
                    res.send({ code: 601, msg: '手机号未注册' })
                } else {
                    let sql = 'update yy_user set password = ? where phone =?'
                    pool.query(sql, [password, phone], (err, result) => {
                        if (err) throw err;
                        res.send({ code: 200 })
                    })
                }
            })
        } else {
            res.send({ code: 400, result: result })
        }
    })


})
module.exports = router;