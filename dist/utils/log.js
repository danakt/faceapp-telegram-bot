"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function logRequest(msg) {
    var formattedMessage = "\n  Request by " + msg.from.first_name + " " + msg.from.last_name + " " + (msg.from.username && '(@' + msg.from.username + ')') + "\n  " + msg.text;
    console.log(formattedMessage);
}
exports.logRequest = logRequest;
