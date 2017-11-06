"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var TelegramBot = require("node-telegram-bot-api");
var log_1 = require("./utils/log");
var prepareFilters_1 = require("./utils/prepareFilters");
var getAvatarUrl_1 = require("./utils/getAvatarUrl");
var processPhoto_1 = require("./utils/processPhoto");
var getAvailableFilters_1 = require("./utils/getAvailableFilters");
var bot = new TelegramBot(process.env.TOKEN, { polling: true });
var MAX_FILTERS = 5;
bot.onText(/^\/start|^\/help/, function (msg) {
    var message = "\nHello! I'm Awesome FaceApp Bot.\n\nType `/face <filter> <@username>` to apply a filter to the user's avatar. Example:\n/face smile @AwesomeFaceAppBot\n\nType `/face <filter> <url>` to apply a filter to photo by url. Example:\n/face smile https://example.com/photo.jpg\n\nYou can combine up to " + MAX_FILTERS + " filters. E.g.:\n/face smile female hot @AwesomeFaceAppBot\n\nType `/filters` or `/list` to get a list of all available filters";
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
});
bot.onText(/^\/filters|^\/list/, function (msg) { return __awaiter(_this, void 0, void 0, function () {
    var filtersList;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, getAvailableFilters_1.default()];
            case 1:
                filtersList = _a.sent();
                bot.sendMessage(msg.chat.id, filtersList.join('\n'));
                return [2];
        }
    });
}); });
bot.onText(/^\/face.*$/, function (msg) { return __awaiter(_this, void 0, void 0, function () {
    var chatId, waitMessage, matchUser, matchUrl, match, filters, target, photoUrl, _a, processedPhoto, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                chatId = msg.chat.id;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 8, 9, 10]);
                matchUser = msg.text.match(/^\/face ([A-z0-9_-\s]*) @([A-z0-9_]{5,})\s*$/);
                matchUrl = msg.text.match(/^\/face ([A-z0-9_-\s]*) (https?:\/\/.*)/);
                match = matchUser || matchUrl;
                if (!match || !match[1]) {
                    throw new Error('Usage: /face <filters> <@username>');
                }
                return [4, prepareFilters_1.default(match[1], MAX_FILTERS)];
            case 2:
                filters = _b.sent();
                if (filters.length === 0) {
                    throw new Error('No filters inputted');
                }
                log_1.logRequest(msg);
                return [4, bot.sendMessage(chatId, 'Please wait, the photo is being processed...', {
                        disable_notification: true
                    })];
            case 3:
                waitMessage = _b.sent();
                if (waitMessage instanceof Error) {
                    throw waitMessage;
                }
                target = match[match.length - 1];
                if (!matchUser) return [3, 5];
                return [4, getAvatarUrl_1.default(target)];
            case 4:
                _a = _b.sent();
                return [3, 6];
            case 5:
                _a = target;
                _b.label = 6;
            case 6:
                photoUrl = _a;
                return [4, processPhoto_1.default(filters, photoUrl)];
            case 7:
                processedPhoto = _b.sent();
                bot.sendPhoto(chatId, processedPhoto);
                return [3, 10];
            case 8:
                err_1 = _b.sent();
                bot.sendMessage(chatId, err_1.message);
                return [3, 10];
            case 9:
                bot.deleteMessage(chatId, waitMessage.message_id.toString());
                return [7];
            case 10: return [2];
        }
    });
}); });
