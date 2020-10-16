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
            res.send({code:702})
        }else{
            res.send({code:701,result: result})
        }
    })
})

router.get('/province/city',(req,res)=>{
    let provinceid = req.query.provinceid
    let sql = 'select city from city where provinceid=?'
    pool.query(sql,[provinceid],(err,result)=>{
        if(err) return err;
        if(result == ''){
            res.send({code:702})
        }else{
            res.send({code:701,result: result})
        }
    })
})

router.get('/city/hospital',(req,res)=>{
    let cityid = req.query.cityid;
    let sql = 'select hname,img,level,hsite form (select city from city where cityid=?) c left join hospital h on c.city = h.city ';
    pool.query(sql,[city.id],(err,reuslt)=>{
        if(err) return err;
        if(result == ''){
            res.send({code: 702})
        }else{
            res.send({code:701,result: result})
        }
    }) 
})


router.get('/province/city/hospital/ks',(req,res)=>{
    let hospitalid = req.query.hospitalid;
    let sql = 'select kname from yy_ks where hospitalid = ?';
    pool.query(sql,[hospitalid],(req,res)=>{
        if(err) return err;
        if(result == ''){
            res.send({code: 702})
        }else{
            res.send({code:701,result: result})
        }
    })
})

router.get('/province/city/hospital/ks/doctors',(req,res)=>{
    let ksid = req.query.ksid;
    let sql = 'select id,dname,price,img,dposition,dage from yy_doctor where ksid= ?';
    pool.query(sql,[ksid],(err,result)=>{
        if(err) return err;
        if(result == ''){
            res.send({code: 702})
        }else{
            let doctorid = result.doctorid;
            sql = 'select count(id) num from yy_time where doctorid=?'
            pool.query(sql,[doctorid],(err,num)=>{
                if(num.num <16){
                    res.send({code:701,result: result,hastime: true})
                }else{
                    res.send({code:701,result:result,hastime: false})
                }
            })
            
        }
    })
})

router.get('/province/city/hospital/ks/doctors/doctor',(req,res)=>{
    let doctorid = req.query.doctorid;
    let daystarttime = req.query.daystarttime;
    let dayendtime = req.query.dayendtime;
    let sql = 'select id,dname,img,dposition,dage,price,description,intro from yy_doctor where ksid= ?';
    
    pool.query(sql,[doctorid],(err,result)=>{
        if(err) return err;
        if(result == ''){
            res.send({code: 702})
        }else{
            let sql = 'select time from yy_time where doctorid = ? and time>? and time<?'
            pool.query(sql,[doctorid,daystarttime,dayendtime],(err,notime)=>{
                if(err){ return err}
                res.send({code: 701,result: result,notime: notime})
            })
            res.send({code:701,result: result})
        }
    })
})


module.exports=router;