"use strict";
var express = require('express');
var request = require('superagent');
var config = require('./config');
var app = express();

app.get('/',function(req,res){
	res.status(404).send('');
});

function gethead(user,repo,branch,res,cb){
    if(branch==='master') return 'HEAD';
	let url = 'https://api.github.com/repos/'+user+'/'+repo+'/branches/'+branch;
	console.log("requesting "+url);
    request
        .get(url)
        .set('User-Agent','request')
        .set('Authorization','token '+config.OAuth)
        .end(function(err,response){
            if(err||!response.ok){
                console.log('error:' +err);
                console.log(response.text);
                cb(user,repo,'',res);
            }
            else {
                console.log('Got ' + response.body.commit.sha);
                cb(user, repo, response.body.commit.sha, res);
            }
        });
};

function getstatus(user,repo,hash,res){
    let url = 'https://api.github.com/repos/'+user+'/'+repo+'/commits/'+hash+'/status';
    console.log('requesting '+url);
    request
        .get(url)
        .set('User-Agent','request')
        .set('Authorization','token '+config.OAuth)
        .end(function(error,response) {
            if (error || !response.ok) {
                console.log('status: ' + response.statusCode);
                console.log('body: ' + response.text);
                request.get('https://img.shields.io/badge/build-status unknown-blue.svg').pipe(res);
            }
            else {
                let s = response.body.state;
                if (s === 'success')
                    request.get('https://img.shields.io/badge/build-passing-green.svg').pipe(res);
                else if (s === 'pending')
                    request.get('https://img.shields.io/badge/build-pending-yellow.svg').pipe(res);
                else if (s === 'failure')
                    request.get('https://img.shields.io/badge/build-failing-red.svg').pipe(res);
                else
                    request.get('https://img.shields.io/badge/build-status unknown-blue.svg').pipe(res);
            }
        });
}

app.get('/api/:user/:repo/:branch/:commit?',function(req,res){
    if(req.params.commit && req.params.commit !=='') {
    	console.log('commit: '+req.params.commit);
	    getstatus(req.params.user,req.params.repo,req.params.commit,res);
    } else {
	    gethead(req.params.user,req.params.repo,req.params.branch,res,getstatus);
    }
});

app.listen(8080,function(){
	console.log('Live on port 8080');
});
