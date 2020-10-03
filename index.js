"use strict";
var express = require('express');
var request = require('superagent');
var config = require('./config');
var app = express();

app.get('/',(req,res)=>{
	res.status(404).send('');
});

const gethead = async (user,repo,branch)=>{
  if(branch==='master') return 'HEAD';
	let url = 'https://api.github.com/repos/'+user+'/'+repo+'/branches/'+branch;
	console.log("requesting "+url);
  try {
	  const res = await request
	    .get(url)
      .set('User-Agent','request')
      .set('Authorization','token '+config.OAuth)
    if(!res.ok)
      throw;
    console.log('Got ' + res.body.commit.sha);
    return res.body.commit.sha;
  } catch(err) {
    console.log(`error: ${err}`);
    return '';
  }
};

const getstatus = async (user,repo,hash)=>{
  const url = `https://api.github.com/repos/${user}/${repo}/commits/${hash}/status`;
  console.log('requesting '+url);
  try {
    const res = await request
      .get(url)
      .set('User-Agent','request')
      .set('Authorization','token '+config.OAuth)
    if (!res.ok) {
      throw;
    }
    switch(response.body.state){
      case 'success':
        return request.get('https://img.shields.io/badge/build-passing-green.svg');
      case 'pending':
        return request.get('https://img.shields.io/badge/build-pending-yellow.svg');
      case 'failure':
        return request.get('https://img.shields.io/badge/build-failing-red.svg');
      default:
        return request.get('https://img.shields.io/badge/build-status unknown-blue.svg');
    }
  } catch (err){
    console.log(`err: ${err}`);
    return request.get('https://img.shields.io/badge/build-status unknown-blue.svg');
  };
}

app.get('/api/:user/:repo/:branch/:commit?',async (req,res)=>{
    if(req.params.commit && req.params.commit !=='') {
    	console.log('commit: '+req.params.commit);
	    const rtn = await getstatus(req.params.user,req.params.repo,req.params.commit);
      res.send(rtn);
    } else {
	    const sha = await gethead(req.params.user,req.params.repo,req.params.branch);
      const rtn = await getstatus(req.params.user,req.params.repo,sha);
      res.send(rtn);
    }
});

app.listen(8080,()=>{
	console.log('Live on port 8080');
});
