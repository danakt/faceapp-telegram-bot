"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var faceapp = require("faceapp");
function getAvailableFilters() {
    return faceapp.listFilters(true);
}
exports.default = getAvailableFilters;
