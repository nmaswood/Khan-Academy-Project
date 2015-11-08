"use strict";

var editor = ace.edit("editor");
editor.setTheme("ace/theme/crimson_editor");
editor.session.setMode("ace/mode/javascript");

var syntaxTree = {};

var domValues = {};

var domFunctions = {};

syntaxTree.errorMessage = "";

syntaxTree.createSyntaxObject = function() {

    var obj = {
        "VariableDeclaration": 0,
        "ForStatement": 0,
        "IfStatement": 0,
        "WhileStatement": 0
    };
    return obj;
};

syntaxTree.mySyntaxObject = syntaxTree.createSyntaxObject();



syntaxTree.createSyntaxTree = function(str){

    if (str === "") {
        syntaxTree.errorMessage = "Dear User, it seems that the input is empty";
        return;
    }
    try {
        return esprima.parse(str);
    }
    catch(err) {
        syntaxTree.errorMessage = "Dear User, it seems that your code is unable to be run";
        console.log(err);
    }
};

var A = [];
/*
syntaxTree.traverseSyntaxTree = function (node, node_child) {
    var that = this;
    var theType = node.type;
    if (theType in syntaxTree.mySyntaxObject){
        syntaxTree.mySyntaxObject[theType]++;
    }
    for (var category in node) {
        if (category in node) {

            var leafNode = node[category];
            if (typeof leafNode === 'object' && leafNode) {

                if (leafNode.constructor === Array ) {
                    leafNode.forEach(function(node) {
                        that.traverseSyntaxTree(node);
                    });
                } else {
                    that.traverseSyntaxTree(leafNode);
                }
            }
        }
    }
};
*/
var IF = "IfStatement";
var FOR = "ForStatement";

var BOOL = [];

syntaxTree.test = function(){
    alert("hellow!");
};

syntaxTree.traverseSyntaxTree = function (node,obj) {
    var that = this;
    if(!node){
        return;
    }
    var theType = node.type;
    if(obj) {
        if (theType in obj) {
            obj[theType]++;
        }
    }
    for (var category in node) {

        if (category in node) {

            var leafNode = node[category];
            if (typeof leafNode === 'object' && leafNode) {

                if (leafNode.constructor === Array ) {
                    leafNode.forEach(function(node) {
                        that.traverseSyntaxTree(node,obj);
                    });
                } else {
                    that.traverseSyntaxTree(leafNode,obj);
                }
            }
        }
    }
};


var works = 0;
syntaxTree.find = function(node, outer, inner){

    var that = this;

    if(node["type"] == outer){
        console.log(node);
        var one = syntaxTree.createSyntaxObject();
        syntaxTree.traverseSyntaxTree(node["body"], one);

        if(one[inner]){
            works++;
            console.log(works);
            return true;
        }
    }

    if(node["type"] == outer && "consequent" in node){
        console.log(node);
        var one = syntaxTree.createSyntaxObject();
        syntaxTree.traverseSyntaxTree(node["consequent"], one);

        if(one[inner]){
            works++;
            console.log(works);
            return true;
        }
    }


    for (var category in node) {

        if (category in node) {

            var leafNode = node[category];
            if (typeof leafNode === 'object' && leafNode) {

                if (leafNode.constructor === Array ) {
                    leafNode.forEach(function(node) {
                        that.find(node, outer, inner);
                    });
                } else {
                    that.find(leafNode, outer, inner);
                }
            }
        }
    }
};

domFunctions.insert = function(str, num) {

    if (num === 0) {
        if (!domFunctions.deleteElement(str, domValues.whiteList)){
            domValues.whiteList.push(str);
        }
        console.log(domValues.whiteList);
    } else if (num === 1) {
        if (!domFunctions.deleteElement(str, domValues.blackList)) {
            domValues.blackList.push(str);
        }
        console.log(domValues.blackList);
    } else {
        if (!domFunctions.deleteElement(str, domValues.structureList)) {
            domValues.structureList.push(str);
            console.log(domValues.structureList);
        }
    }
};

domFunctions.run = function(){

    var editorString = editor.getValue();

    var parsedString = syntaxTree.createSyntaxTree(editorString);

    var emptyTreeObject = syntaxTree.createSyntaxObject();

    syntaxTree.traverseSyntaxTree(parsedString, emptyTreeObject);

    var listTreeObject = syntaxTree.convertTreeObjToList(emptyTreeObject);

    console.log(listTreeObject);
    console.log(domValues.whiteList);

    for(var i = 0 ; i < domValues.whiteList.length; i++) {

        if (!domFunctions.inList(domValues.whiteList[i], listTreeObject)) {
            alert("white list violation");
        }
    }
    for(var i = 0 ; i < domValues.blackList.length; i++) {

        if (domFunctions.inList(domValues.blackList[i], listTreeObject)) {
            alert("black list violation");
        }
    }

};


syntaxTree.convertTreeObjToList = function(obj) {
    var returnList = [];
    for (var key in obj) {
        if (obj[key]){
            returnList.push(key);
        }
    }

    return returnList;
};

domValues.whiteList = [];
domValues.blackList = [];
domValues.structureList = [];


//IE 8 doesn't support indexOf
domFunctions.deleteElement = function(element, list){
    for(var i = 0; i < list.length; i++){
        if(element === list[i]){
            list.splice(i,1);
            return 1;
        }
    }
    return 0;
};

domFunctions.inList = function(element, list){
    for(var i = 0; i < list.length; i++){
        if(element === list[i]){
            return true;
        }
    }
    return false;
};
