#! /usr/bin/env node
var rimraf = require('rimraf');
var shell = require('shelljs');
var fs = require('fs');
const path = require('path');
var directory = process.cwd();

if(!shell.which('git')){
	console.log("Sorry, edgemodules requires git.");
	shell.exit(1);
}

var modulesExists = fs.existsSync("node_modules/");
if (modulesExists) {
	var modules = fs.readdirSync("node_modules/").filter(file => fs.statSync(path.join("node_modules/", file)).isDirectory());
	modules.forEach(function (value, index){
		var packagePath = path.join("node_modules/", value, "package.json");
		var packageExists = fs.existsSync(packagePath);
		if (packageExists){
			var packageConfig = JSON.parse(fs.readFileSync(packagePath).toString());
			console.log("Updating " + packageConfig.name + "...");
			var modulePath = path.join("node_modules/", value);
			if (typeof packageConfig.repository == "undefined"){
				console.log("Couldn't update " + packageConfig.name + ", because it doesn't have a repository.");
			} else if (packageConfig.repository.type != "git"){
				console.log("Couldn't update " + packageConfig.name + ", because repository type \"" + packageConfig.repository.type + "\" is not supported.");
			} else {
				rimraf(modulePath, function(){ //fuck async
					if (packageConfig.repository.url.startsWith("git+")){
						packageConfig.repository.url = packageConfig.repository.url.substr("git+".length);
					}
					if(shell.exec("git clone " + packageConfig.repository.url + " " + modulePath).code !== 0){
						console.log("Git clone failed. Aborting.");
					} else {
						rimraf(path.join(modulePath, ".git/"), function(){
							console.log("Successfully updated " + packageConfig.name + "!");
						});
					}
				});
			}
		} else {
			console.log("Couldn't upgrade a package because it's package.json doesn't exist.");
		}
	});
} else {
	console.log("node_modules/ doesn't exists, aborting.");
}
