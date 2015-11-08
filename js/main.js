"use strict";

// Editor Specifications, given current Khan Academy style theme, just sticking to Crimson Editor

var editor = ace.edit("editor");
editor.setTheme("ace/theme/crimson_editor");
editor.session.setMode("ace/mode/javascript");

var syntaxTree = {};

syntaxTree.errorMessage = "";

syntaxTree.createSyntaxObject = function() {

    var obj = {
        "FunctionDeclaration": 0,
        "Identifier": 0,
        "VariableDeclaration": 0,
        "ForStatement": 0,
        "AssignmentExpression": 0,
        "UpdateExpression": 0,
        "IfStatement": 0,
        "ExpressionStatement": 0,
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







var inputString= editor.getValue();


var TEST = esprima.parse(inputString);

var TESTING = syntaxTree.createSyntaxTree(inputString);

console.log(syntaxTree.find(TESTING, FOR, IF));



console.log(works);







//A whitelist of specific functionality. For example, the ability to say "This program MUST use a 'for loop' and a 'variable declaration'."
//A blacklist of specific functionality. For example, the ability to say "This program MUST NOT use a 'while loop' or an 'if statement'."
//Determine the rough structure of the program. For example, "There should be a 'for loop' and inside of it there should be an 'if statement'."

