import {inject} from 'aurelia-framework';
import {HubOptions} from './HubOptions';
import 'wwwroot:/lib/signalr/jquery.signalR';

@inject(HubOptions)
export class Hub {

    connection = {};
	proxy = null;
	globalConnections = [];
	options = [];
	promise = null;
		
	constructor(options){
		
	    this.options = options;
	    this.connection = this.getConnection(options);
	    this.proxy = this.connection.createHubProxy(options.hubName);
	    var self = this;
	    
	    if (options && options.listeners) {
			options.listeners.forEach(function (fn) {
			    self.on(fn.name, fn);
			});
		}
		if (options && options.methods) {
			options.methods.forEach(function (method) {
				this[method] = function () {
					var args = $.makeArray(arguments);
					args.unshift(method);
					return this.invoke.apply(this, args);
				};
			});
		}
		if (options && options.queryParams) {
			this.connection.qs = options.queryParams;
		}
		if (options && options.errorHandler) {
			this.connection.error(options.errorHandler);
		}
		
		if (options && options.hubDisconnected) {
		    this.connection.disconnected(options.hubDisconnected);
		}
		if (options && options.stateChanged) {
		    this.connection.stateChanged(options.stateChanged);
		}
	}

	addListener(listener){
	    this.on(listener.name, listener);
	}

	on(event, fn) {
		this.proxy.on(event, fn);
	}
	
	invoke(method, args) {
		return this.proxy.invoke.apply(this.proxy, arguments);
	}
	
	disconnect() {
		this.connection.stop();
	}
	
	connect() {
		return this.connection.start(this.options.transport ? { transport: this.options.transport } : null);
	}
	
	initNewConnection(options) {
		var connection = null;
		if (options && options.rootPath) {
			connection = $.hubConnection(options.rootPath, { useDefaultPath: false });
		} else {
			connection = $.hubConnection();
		}

		connection.logging = (options && options.logging ? true : false);
		return connection;
	}
	
	getConnection(options) {
		var useSharedConnection = !(options && options.useSharedConnection === false);
		if (useSharedConnection) {
			return typeof globalConnections[options.rootPath] === 'undefined' ?
			globalConnections[options.rootPath] = this.initNewConnection(options) :
			globalConnections[options.rootPath];
		}
		else {
			return this.initNewConnection(options);
		}
	}

}