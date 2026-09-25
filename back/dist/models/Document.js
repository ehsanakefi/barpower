"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const typeorm_1 = require("typeorm");
let Document = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('documents')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _doc_code_decorators;
    let _doc_code_initializers = [];
    let _doc_code_extraInitializers = [];
    let _issue_date_decorators;
    let _issue_date_initializers = [];
    let _issue_date_extraInitializers = [];
    let _file_url_decorators;
    let _file_url_initializers = [];
    let _file_url_extraInitializers = [];
    var Document = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.title = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _title_initializers, void 0));
            this.doc_code = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _doc_code_initializers, void 0));
            this.issue_date = (__runInitializers(this, _doc_code_extraInitializers), __runInitializers(this, _issue_date_initializers, void 0));
            this.file_url = (__runInitializers(this, _issue_date_extraInitializers), __runInitializers(this, _file_url_initializers, void 0));
            __runInitializers(this, _file_url_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "Document");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _title_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _doc_code_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _issue_date_decorators = [(0, typeorm_1.Column)()];
        _file_url_decorators = [(0, typeorm_1.Column)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _doc_code_decorators, { kind: "field", name: "doc_code", static: false, private: false, access: { has: obj => "doc_code" in obj, get: obj => obj.doc_code, set: (obj, value) => { obj.doc_code = value; } }, metadata: _metadata }, _doc_code_initializers, _doc_code_extraInitializers);
        __esDecorate(null, null, _issue_date_decorators, { kind: "field", name: "issue_date", static: false, private: false, access: { has: obj => "issue_date" in obj, get: obj => obj.issue_date, set: (obj, value) => { obj.issue_date = value; } }, metadata: _metadata }, _issue_date_initializers, _issue_date_extraInitializers);
        __esDecorate(null, null, _file_url_decorators, { kind: "field", name: "file_url", static: false, private: false, access: { has: obj => "file_url" in obj, get: obj => obj.file_url, set: (obj, value) => { obj.file_url = value; } }, metadata: _metadata }, _file_url_initializers, _file_url_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Document = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Document = _classThis;
})();
exports.Document = Document;
