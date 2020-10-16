const express=require('express');
const pool=require('../pool.js');
const redis = require('../redis.js')
const zhenzismsClient = require('../public/zhenzisms.js');
const { response } = require('express');
var router=express.Router();
var client = new zhenzismsClient('sms_developer.zhenzikj.com', '106857', '7704aef8-ca67-4ca7-ada0-edb3e36fcdc1');

router.get('/province',(req,res)=>{
    let sql = 'select provinceid,province from province';
    pool.query(sql,(err,result)=>{
        if(err) return err;
        if(result==''){
            res.send({code:500})
        }else{
            res.send({code:200,result: result})
        }
    })
})

router.get('/city',(req,res)=>{
    let provinceid = req.query.provinceid
    let sql = 'select cityid,city from city where fatherid=?'
    pool.query(sql,[provinceid],(err,result)=>{
        if(err) throw err;
        if(result == ''){
            res.send({code:500})
        }else{
            res.send({code:200,result: result})
        }
    })
})

router.get('/hospital',(req,res)=>{
    let cityid = req.query.cityid;
    let sql = 'select hname,img,level,hsite from yy_hospital where cityid = '+cityid;
    pool.query(sql,(err,result)=>{
        if(err) throw err;
        if(result == ''){
            res.send({code: 500})
        }else{
            res.send({code:200,result: result})
        }
    }) 
})


router.get('/ks',(req,res)=>{
    let hospitalid = req.query.hospitalid;
    let sql = 'select kname from yy_ks where hospitalid = ?';
    pool.query(sql,[hospitalid],(err,result)=>{
        if(err) return err;
        if(result == ''){
            res.send({code: 500})
        }else{
            res.send({code:200,result: result})
        }
    })
})

router.get('/doctors',(req,res)=>{
    let ksid = req.query.ksid;
    let sql = 'select id,dname,price,img,dposition,dage from yy_doctor where ksid= ?';
    pool.query(sql,[ksid],(err,result)=>{
        if(err) throw err;
        res.send({code:200,result:result})
    })
})

router.get('/doctor',(req,res)=>{
    let doctorid = req.query.doctorid;
    let sql = 'select id,dname,img,dposition,dage,price,description,intro from yy_doctor where id= ?';
    pool.query(sql,[doctorid],(err,result)=>{
        if(err) throw err;
        if(result == ''){
            res.send({code: 500})
        }else{
            res.send({code: 200,result: result})
        }
    })
})
router.get('/time',(req,res)=>{
    let doctorid = req.query.doctorid;
    let daystarttime = req.query.daystarttime;
    let dayendtime = req.query.dayendtime;

    let sql = 'select time from yy_time where doctorid = ? and time>? and time<?'
    pool.query(sql,[doctorid,daystarttime,dayendtime],(err,notime)=>{
        if(err){ throw err}
        res.send({code: 200,result: notime})
    })
})

router.get('/day',(req,res)=>{
    let doctorid = req.query.doctorid;
    let sql = 'select restday from yy_schedule where doctorid = ?'
    pool.query(sql,[doctorid],(err,result)=>{
        if(err){ throw err}
        res.send({code: 200,result: result})
    })
})


module.exports=router