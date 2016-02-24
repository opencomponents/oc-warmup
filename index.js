'use strict';

var packageInfo = require('./package.json');
var request = require('minimal-request');
var url = require('url');
var _ = require('./helpers');

module.exports = function(options, callback){

  options.headers = options.headers || {};
  options.headers['user-agent'] = options.headers['user-agent'] || ('oc-warmup/' + packageInfo.version);
  options.headers['accept'] = 'application/json';
  options.timeout = options.timeout || 20000;

  request({
    url: options.url,
    headers: options.headers,
    json: true,
    timeout: options.timeout
  }, function(err, res){
    if(!!err || !res || !res.components){ return callback(err || 'not a valid registry'); }

    var components = res.components,
        toWarmup = [],
        shouldWarmup = _.isFunction(options.components) ? options.components : function(){ return true; };

    _.eachAsync(components, function(component, next){
      var infoRoute = url.resolve(options.url, '/' + component.replace(res.href, '') + '/~info');
      request({
        url: component + '/~info',
        headers: options.headers,
        json: true,
        timeout: options.timeout
      }, function(err, componentInfo){
        if(!err && shouldWarmup(componentInfo)){
          var componentToWarmup = { name: componentInfo.name, parameters: {}},
              parameters = componentInfo.oc.parameters;

          if(!!parameters){
            _.each(parameters, function(value, parameter){
              if(!!value.mandatory){
                componentToWarmup.parameters[parameter] = value.example;
              }
            });
          }

          toWarmup.push(componentToWarmup);
        }
        next();
      });
    }, function(){
      request({
        url: options.url,
        headers: options.headers,
        method: 'post',
        json: true,
        body: { components: toWarmup },
        timeout: options.timeout
      }, function(err, res){

        if(err){ return callback(err); }

        var result = { errors: [], successful: []};

        _.each(res, function(response, i){
          if(response.status !== 200){
            result.errors.push('* ' + toWarmup[i].name + ': ' + response.response.error + ' (' + response.status + ')');
          } else {
            result.successful.push(toWarmup[i].name);
          }
        });

        callback(null, result);
      });
    });
  });
};