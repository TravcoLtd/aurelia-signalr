System.register(['aurelia-framework', './HubOptions', 'wwwroot:/lib/signalr/jquery.signalR'], function (_export) {
	'use strict';

	var inject, HubOptions, Hub;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	return {
		setters: [function (_aureliaFramework) {
			inject = _aureliaFramework.inject;
		}, function (_HubOptions) {
			HubOptions = _HubOptions.HubOptions;
		}, function (_wwwrootLibSignalrJquerySignalR) {}],
		execute: function () {
			Hub = (function () {
				function Hub(options) {
					_classCallCheck(this, _Hub);

					this.connection = {};
					this.proxy = null;
					this.globalConnections = [];
					this.options = [];
					this.promise = null;

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

				Hub.prototype.addListener = function addListener(listener) {
					this.on(listener.name, listener);
				};

				Hub.prototype.on = function on(event, fn) {
					this.proxy.on(event, fn);
				};

				Hub.prototype.invoke = function invoke(method, args) {
					return this.proxy.invoke.apply(this.proxy, arguments);
				};

				Hub.prototype.disconnect = function disconnect() {
					this.connection.stop();
				};

				Hub.prototype.connect = function connect() {
					return this.connection.start(this.options.transport ? { transport: this.options.transport } : null);
				};

				Hub.prototype.initNewConnection = function initNewConnection(options) {
					var connection = null;
					if (options && options.rootPath) {
						connection = $.hubConnection(options.rootPath, { useDefaultPath: false });
					} else {
						connection = $.hubConnection();
					}

					connection.logging = options && options.logging ? true : false;
					return connection;
				};

				Hub.prototype.getConnection = function getConnection(options) {
					var useSharedConnection = !(options && options.useSharedConnection === false);
					if (useSharedConnection) {
						return typeof globalConnections[options.rootPath] === 'undefined' ? globalConnections[options.rootPath] = this.initNewConnection(options) : globalConnections[options.rootPath];
					} else {
						return this.initNewConnection(options);
					}
				};

				var _Hub = Hub;
				Hub = inject(HubOptions)(Hub) || Hub;
				return Hub;
			})();

			_export('Hub', Hub);
		}
	};
});