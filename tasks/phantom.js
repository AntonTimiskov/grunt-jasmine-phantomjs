module.exports = function(grunt) {

  grunt.registerMultiTask('jasmine-phantom', 'Start PhantomJS for specified URL', function() {
    var options, port, stopped, done, phantom, binPath, which;

    try {
      which = require('which');
      binPath = which.sync('phantomjs');
    } catch(e) {
      binPath = require('phantomjs').path;
    }

    options = this.options({
        runner: require('path').resolve(__dirname, '..', 'jasmine-runner.js'),
        url: 'http://localhost:3000'
    });

    stopped = false;
    done = this.async();

    // Spawn PhantomJS.
    console.log(binPath, options.runner, options.url)
    phantom = grunt.util.spawn({
      cmd: binPath,
      args: [options.runner, options.url]
    }, function (err) {
      if (err) {
          stopped = true;
          grunt.fatal('PhantomJS killed unexpectedly');
      }
    });

    // Log PhantomJS error.
    phantom.stderr.setEncoding('utf-8');
    phantom.stderr.on('data', function (chunk) {
      grunt.log.error('PhantomJS: ' + chunk);
    });

    // Log PhantomJS output.
    phantom.stdout.setEncoding('utf-8');
    phantom.stdout.on('data', function (chunk) {
      grunt.log.debug('PhantomJS: ' + chunk);
    });

    phantom.on('exit',function(code){
        grunt.log.ok('PhantomJS stopped');
        stopped = true;
        done();
    });

    // Kill PhantomJS on exit.
    process.on('exit', function () {
      if (!stopped) {
        phantom.kill();
        grunt.log.ok('PhantomJS stopped on Grunt termination');
        done();
      }
    });

  });
};


