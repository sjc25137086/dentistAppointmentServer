const express=require('express');
const pool=require('../pool.js');
const redis = require('../redis.js')
const zhenzismsClient = require('../public/zhenzisms.js')
var router=express.Router();
var client = new zhenzismsClient('sms_developer.zhenzikj.com', '106857', '7704aef8-ca67-4ca7-ada0-edb3e36fcdc1');


router.post('/regsend',(req,res)=>{
	let phone = req.body.phone;
    var params = {};
	params.templateId = '1836';
	params.number = phone;
	let sms =('000000' + Math.floor(Math.random() * 999999)).slice(-6);
	redis.set(phone,sms);
	redis.expire(phone,300)
	params.templateParams = [sms, "5分钟"];
    client.send(params);
    res.send({code:1})
})
router.post('/register',async (req,res)=>{
  var phone=req.body.phone;
  var password = req.body.password;
  var sms = req.body.sms;
  redis.get(phone,(err,data)=>{
	  if(data == sms){
		let sql="SELECT * FROM yy_user WHERE phone=?";
		pool.query(sql,[phone,password],(err,result)=>{
			if(result != ''){
				res.send({code:602})
			}else{
				let sql="INSERT INTO yy_user(phone,password) values (?,?)";
				pool.query(sql,[phone,password],(err,result)=>{
					if(err) throw err;
					if(result.affectedRows>0){
						res.send({code:1});
					}else{
						res.send({code:603});
					}
				})
			}
		})
	  }else{
		res.send({code:603});
	  }
  })
})

router.get('/regsend',(req,res)=>{
    var params = {};
	params.templateId = '1836';
	params.number = '13298531156';
	params.templateParams = ["1862", "5分钟"];
    var result = client.send(params);
    res.send(result.data)
    console.log(111);
})
router.get('/login',(req,res)=>{
  let phone=req.query.phone;
  let password=req.query.password;
  let sql="SELECT * FROM yy_user WHERE phone=? AND password=?";
  pool.query(sql,[phone,password],(err,result)=>{
	if(err) throw err;
	if(result.length>0){
		let id=result[0].id;
		res.send({code:601,id:id});
	}else{
		res.send({code:701});
	}
	console.log(result)
  })
})
router.post('/forward',(req,res)=>{
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
	let sql = `insert into yy_forward(doctorid,fname,fage,fsex,idCard,phone,state,userid,time) values (?,?,?,?,?,?,?,?,?)`;
	console.log(time2);
	pool.query(sql,[doctorid,fname,fage,fsex,idCard,phone,state,userid,time],(err,result)=>{
		if(err) throw err;
		let sql = 'insert into yy_time(doctorid,time) values (?,?)'
		pool.query(sql,[doctorid,time2],()=>{
			if(err) throw err;
			res.send({code:702})
		})
		
	})
})
router.get('/doingforward',(req,res)=>{
	var uid=req.query.uid;
	pool.query("select fname,time,state,doctorid from yy_forward where userid=? and state!=1",[uid],(err,result)=>{
		if(err) throw err;
		res.send(result);
	})
})

router.get('/overforward',(req,res)=>{
	var uid=req.query.uid;
	pool.query("select fname,time,state,doctorid from yy_forward where userid=? and state=1",[uid],(err,result)=>{
		if(err) throw err;
		res.send(result);
	})
})



module.exports=router;