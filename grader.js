#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
	}
};

var cheerioHtmlFile = function(htmlFile) {
	return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function(checksFile) {
	return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtml = function(cheerioObj, checksFile) {
	var checks = loadChecks(checksFile).sort();
	var out = {};
	for(var ii in checks) {
		var present = cheerioObj(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
}

var checkHtmlFile = function(htmlFile, checksFile) {
	$ = cheerioHtmlFile(htmlFile);
	var checkJson = checkHtml($, checksFile);
	print_json(checkJson);
};

var checkHtmlURL = function(htmlURL, checksFile) {
	rest.get(htmlURL).on('complete', function(result){
		$ = cheerio.load(result);
		var checkJson = checkHtml($, checksFile);
		print_json(checkJson);	
	});
};

var clone = function(fn) {
	return fn.bind({});
};

var print_json = function(checkJson) {
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log("outJson: "+outJson);
};

if(require.main == module) {
	program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_to_file>', 'URL to index.html')
        .parse(process.argv);
	program.parse(process.argv);
	
	if(program.url){
		checkHtmlURL(program.url, program.checks);
	}
	else{
		checkHtmlFile(program.file, program.checks);
	}

} else {
	exports.checkHtmlFile = checkHtmlFile;
}
