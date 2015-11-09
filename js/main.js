"use strict";

var editor = ace.edit("editor");
editor.setTheme("ace/theme/crimson_editor");
editor.session.setMode("ace/mode/javascript");


var domValues = {
    "whiteList": [],
    "blackList": [],
    "structureList": [],
    "ifToFor": 0,
    "forToIf": 0,
    "errorMessage": "",
    "successMessage": "",
    "structureMessage": ""
};

var domFunctions = {};

//IE 8 doesn't support indexOf
domFunctions.deleteElement = function (element, list) {
    for (var i = 0; i < list.length; i++) {
        if (element === list[i]) {
            list.splice(i, 1);
            return 1;
        }
    }
    return 0;
};

domFunctions.inList = function (element, list) {
    for (var i = 0; i < list.length; i++) {
        if (element === list[i]) {
            return true;
        }
    }
    return false;
};

domFunctions.insert = function (str, num) {

    if (num === 0) {
        if (!domFunctions.deleteElement(str, domValues.whiteList)) {
            domValues.whiteList.push(str);
        }
    } else if (num === 1) {
        if (!domFunctions.deleteElement(str, domValues.blackList)) {
            domValues.blackList.push(str);
        }
    } else {
        if (!domFunctions.deleteElement(str, domValues.structureList)) {
            domValues.structureList.push(str);
        }
    }
};

domFunctions.erf = function (str, id) {
    document.getElementById(id).innerHTML = str;
    setTimeout(function () {
        document.getElementById(id).innerHTML = "";
    }, 3000);
};

var syntaxTree = {};

syntaxTree.createSyntaxObject = function () {
    return {
        "VariableDeclaration": 0,
        "ForStatement": 0,
        "IfStatement": 0,
        "WhileStatement": 0
    };
};

syntaxTree.errorCheckTree = function (str) {

    if (str === "") {
        document.getElementById("error").innerHTML = "";
        document.getElementById("success").innerHTML = "";
        document.getElementById("structure").innerHTML = "";
        console.log("FUCK");
        domFunctions.erf("Dear User, it seems that the input is empty", "error");
        return 1;
    }
    try {
        esprima.parse(str);
    }
    catch (err) {
        document.getElementById("error").innerHTML = "";
        document.getElementById("success").innerHTML = "";
        document.getElementById("structure").innerHTML = "";
        domFunctions.erf("Dear User, it seems that your code is unable to be run", "error");
        return 1;
    }
};

syntaxTree.traverseSyntaxTree = function (node, obj) {
    var that = this;
    if (!node)
        return;

    if (obj) {
        if (node.type in obj) {
            obj[node.type]++;
        }
    }
    for (var category in node) {

        if (category in node) {

            var leafNode = node[category];

            if (typeof leafNode === 'object' && leafNode) {

                if (leafNode.constructor === Array) {
                    leafNode.forEach(function (node) {
                        that.traverseSyntaxTree(node, obj);
                    });
                } else {
                    that.traverseSyntaxTree(leafNode, obj);
                }
            }
        }
    }
};

syntaxTree.convertTreeObjToList = function (obj) {
    var returnList = [];

    for (var key in obj) {
        if (obj[key]) {
            returnList.push(key);
        }
    }

    return returnList;
};

syntaxTree.find = function (node, outer, inner) {

    var that = this;

    if (node["type"] == outer) {

        var syntaxObject = syntaxTree.createSyntaxObject();
        syntaxTree.traverseSyntaxTree(node["body"], syntaxObject);

        if (syntaxObject[inner]) {
            if (inner == "IfStatement") {
                domValues.forToIf = 1;
            } else {
                domValues.ifToFor = 1;
            }
        }
    }

    if (node["type"] == outer && "consequent" in node) {

        var syntaxObject = syntaxTree.createSyntaxObject();
        syntaxTree.traverseSyntaxTree(node["consequent"], syntaxObject);

        if (syntaxObject[inner]) {
            if (inner == "IfStatement") {
                domValues.forToIf = 1;
            } else {
                domValues.ifToFor = 1;
            }
        }
    }

    for (var category in node) {
        if (category in node) {
            var leafNode = node[category];
            if (typeof leafNode === 'object' && leafNode) {
                if (leafNode.constructor === Array) {
                    leafNode.forEach(function (node) {
                        that.find(node, outer, inner);
                    });
                } else {
                    that.find(leafNode, outer, inner);
                }
            }
        }
    }
};

domFunctions.run = function () {

    if (domValues.errorMessage || domValues.successMessage || domValues.structureMessage) {
        return;
    }
    ;

    domValues.ifToFor = 0;
    domValues.forToIf = 0;

    var editorString = editor.getValue();

    if(syntaxTree.errorCheckTree(editorString)){
        console.log("ABORT");
        return;
    }

    var parsedString = esprima.parse(editorString);

    var emptyTreeObject = syntaxTree.createSyntaxObject();

    syntaxTree.traverseSyntaxTree(parsedString, emptyTreeObject);

    var listTreeObject = syntaxTree.convertTreeObjToList(emptyTreeObject);

    var errorObject = {
        "W": 0,
        "B": 0
    };
    if (domValues.whiteList.length) {
        for (var i = 0; i < domValues.whiteList.length; i++) {

            if (!domFunctions.inList(domValues.whiteList[i], listTreeObject)) {
                errorObject["W"]++;
            }
        }

        if (domValues.whiteList.length && errorObject["W"] === 0) {
            domValues.successMessage = "White List Success";
        } else {
            domValues.errorMessage = "White List Violation";
        }
    }
    if (domValues.blackList.length) {
        for (var i = 0; i < domValues.blackList.length; i++) {

            if (domFunctions.inList(domValues.blackList[i], listTreeObject)) {
                errorObject["B"]++;
            }

        }

        if (domValues.blackList.length && !errorObject["B"]) {
            domValues.successMessage += "  Black List Success";
        } else {
            domValues.errorMessage += " Black List Violation";
        }
    }

    var IF = "IfStatement";
    var FOR = "ForStatement";

    syntaxTree.find(parsedString, FOR, IF);
    syntaxTree.find(parsedString, IF, FOR);

    var x = domValues.ifToFor;
    var y = domValues.forToIf;
    var z = domValues.structureList.length;

    if (z) {

        if (z == 2 && x && y) {
            domValues.structureMessage = "FOR then IF and If then FOR Present";
        } else if (z == 2 && x) {
            domValues.structureMessage = "IF then FOR Present and FOR then IF not present";
        }
        else if (z == 2 && y) {
            domValues.structureMessage = "FOR then IF present and FOR then IF not present";
        } else if (y && domValues.structureList[0] == 'for-to-if') {
            domValues.structureMessage = "FOR then IF Present";
        } else if (x && domValues.structureList[0] == 'if-to-for') {
            domValues.structureMessage = "IF then For Present";
        } else {
            domValues.structureMessage = "Structure Not Present";
        }
    }

    if (domValues.errorMessage) {
        document.getElementById("error").innerHTML = domValues.errorMessage;
    }
    if (domValues.successMessage) {
        document.getElementById("success").innerHTML = domValues.successMessage;
    }
    if (domValues.structureMessage) {
        document.getElementById("structure").innerHTML = domValues.structureMessage;
    }

    setTimeout(function () {
        document.getElementById("error").innerHTML = "";
        document.getElementById("success").innerHTML = "";
        document.getElementById("structure").innerHTML = "";
        domValues.errorMessage = "";
        domValues.successMessage = "";
        domValues.structureMessage = "";
    }, 3000);
};

domValues.toggleManualBoolean = 1;

domFunctions.toggleManual = function () {
    if (domValues.toggleManualBoolean) {
        domValues.toggleManualBoolean = 0;
    } else {
        domValues.toggleManualBoolean = 1;
        domFunctions.start();

    }
};

domFunctions.start = function () {
    var id = setInterval(function () {
        if (domValues.toggleManualBoolean) {
            domFunctions.run()
        } else {
            clearInterval(id);
            return;
        }
    }, 7500);
};

domFunctions.start();







