"use strict";

var syntaxTree = {};

syntaxTree.errorMessage = "";


syntaxTree.createSyntaxTree = function(str){

    if (!str)
        this.errorMessage = "Dear User, it seems that the input is empty";
        return;
    try {
        return esprima.parse(str);
    }
    catch(err) {
        this.errorMessage = "Dear User, it seems that your code is unable to be run";
        console.log(err);
    }
};

syntaxTree.traverseSyntaxTree = function (node) {
    var that = this;
    for (var category in node) {
        if (category in node) {
            var leafNode = node[category] ;
            if (typeof leafNode === 'object' && leafNode) {

                if (leafNode.constructor === Array) {
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

var MY = syntaxTree.createSyntaxTree();

syntaxTree.traverseSyntaxTree(MY);

var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");



console.log("HI WORLD");


//A whitelist of specific functionality. For example, the ability to say "This program MUST use a 'for loop' and a 'variable declaration'."
//A blacklist of specific functionality. For example, the ability to say "This program MUST NOT use a 'while loop' or an 'if statement'."
//Determine the rough structure of the program. For example, "There should be a 'for loop' and inside of it there should be an 'if statement'."

