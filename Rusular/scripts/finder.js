/*
* ===================================================
* Copyright 2012, Twinfield
* ========================================================== 
*/
/*
* Depends:
*	jquery.ui.core.js
*	jquery.ui.widget.js
*	jquery.ui.position.js
*	jquery.ui.menu.js
*  jquery.ui.autocomplete.js
*  jquery.mousewheel.js
*/
(function ($, autocomplete) {

	var plugin = autocomplete.prototype;

	// store copies of the original plugin functions before overwriting
	var base = {};

	for (var i in plugin) {
		if (typeof (plugin[i]) === "function")
			base[i] = plugin[i];
	}

	// extend existing functionality of the autocomplete plugin
	$.extend(true, plugin, {
		options: {
			autoFocus: true,
			minLength: 0,
			usePaging: true,
			offset: 0,
			limit: 15,
			infoText: "Line _START_ - _END_ of _TOTAL_",
			emptyText: null,
			menuClass: null,
			findProperties: ['label', 'value'],
			findButton: null,
			menuItemIconExisting: null
		},

		_create: function () {

			var self = this;

			if (!this.options.position.of)
				this.options.position.of = this.element;

			if (this.options.findButton) {
				this.addFindButton();
			}

			if (!this.options.select) {
				this.options.select = function (event, ui) {

					if (event.isDefaultPrevented())
						return false;

					if (ui.item)
						self.setValue(ui.item);

					return false;
				};
			}

			if (!this.options.focus) {
				this.options.focus = function (event, ui) {
					return false;
				};
			}

			if (!this.options.change) {
				this.options.change = function (event, ui) {

					if (event.isDefaultPrevented())
						return false;

					self.setValue(ui.item ? ui.item : self._createEmptyItem());
					return false;
				};
			}

			base["_create"].call(this);

			if (this.options.menuClass) {
				this.menu.element.addClass(this.options.menuClass);
			}

			this._on({
				focus: function (event) {
					self.search();
				},
				mousewheel: function (event, delta) {
					var dir = delta > 0 ? "previousPage" : "nextPage";
					self._move(dir, event);
				}
			});

			this._on(this.menu.element, {
				mousewheel: function (event, delta) {
					event.preventDefault();

					var dir = delta > 0 ? "previousPage" : "nextPage";
					self._move(dir, event);
				}
			});

			if (this.button) {
				this._on(this.button, {
					click: function () {
						this.element.focus();
						self.search();
					}
				});
			}
		},

		addFindButton: function () {
			this.button = $(this.options.findButton);
			this.element.before(this.button);
		},

		destroy: function () {

			if (this.pager)
				this.pager.remove();

			base["destroy"].call(this);
		},

		close: function (event) {

			if (this.pager)
				this.pager.hide();

			this.options.offset = 0;

			base["close"].call(this, event);
		},

		_createEmptyItem: function () {
			return {
				value: "",
				label: this.term
			};
		},

		setValue: function (item) {

			this.element.val(item.label);
			this._setChange();
		},

		_change: function (event) {
			if (this._isChanged()) {
				var item = this.selectedItem;
				if (!item && this.term) {
					item = this._findSingleItem();
				}

				this._trigger("change", event, { item: item });
			}
		},

		_findSingleItem: function () {

			if (this.menu.element) {
				var items = $.ui.autocomplete.find(this.menu.element.find("li"), this.term, this.options.findProperties);
				if (items.length == 1)
					return $(items[0]).data("ui-autocomplete-item");
			}

			return null;
		},

		_setChange: function () {

			if (this._isChanged()) {
				this.previous = this.element.val();

				this.element.trigger("change");
			}
		},

		_isChanged: function () {
			var newVal = this.element.val();
			return this.previous !== newVal || newVal.length == 0;
		},

		_move: function (direction, event) {
			//pageUp || pageDown
			if (/^previousPage/.test(direction) || /^nextPage/.test(direction)) {
				event.preventDefault();
				this._changePage(/^next/.test(direction));
			}
			else
				base["_move"].call(this, direction, event);

		},

		__response: function (content) {
			this.__getTotals(content);

			if (content && content.items) {
				content = this._normalize(content.items);
			}

			this._trigger("response", null, { content: content });

			if (!this.options.disabled && content && !this.cancelSearch) {
				this._suggest(content);
				this._trigger("open");
			}
			else
				this.close();
		},

		__getTotals: function (content) {
			this.totalItems = (content && content.filteredTotal) ? content.filteredTotal : 0;
		},

		_search: function (value) {

			this.pending++;
			this.element.addClass("ui-autocomplete-loading");
			this.cancelSearch = false;

			this.source({ term: value, offset: 0, limit: this.options.limit }, this._response());
		},

		_suggest: function (items) {
			if (items.length > 0)
				base["_suggest"].call(this, items);
			else
				this.menu.element.empty();

			if (this.options.usePaging)
				this._showPager();
		},

		_renderItem: function (ul, item) {
			var icon = item.icon ? item.icon : this.options.menuItemIconExisting;

			var ahr = $("<a></a>").append((icon) ? "<i class=\"" + icon + "\"></i>" : "");
			ahr.append(item.label);
			if (item.css)
				ahr.addClass(item.css);

			return $("<li></li>").append(ahr).appendTo(ul);
		},

		_resizeMenu: function () {
			//base._resizeMenu overridden this.element.outerWidth() with this.options.position.of.outerWidth()
			var ul = this.menu.element;

			ul.outerWidth(Math.max(
				// Firefox wraps long text (possibly a rounding bug)
				// so we add 1px to avoid the wrapping (#7513)
				ul.width("").outerWidth() + 1,
				$(this.options.position.of).outerWidth()
			));
		},

		_changePage: function (next) {
			if (next) {

				if (this._displayEnd(this.totalItems) < this.totalItems) {
					this.options.offset += this.options.limit;
					this.source({ pageChange: true, term: this.term, offset: this.options.offset, limit: this.options.limit }, this._response());
				}
				else return;
			}
			else {
				if (this.options.offset > 0) {
					this.options.offset -= this.options.limit;
					this.source({ pageChange: true, term: this.term, offset: this.options.offset, limit: this.options.limit }, this._response());
				}
				else return;
			}
		},

		_showPager: function () {

			if (!this.pager) {
				this.pager = $("<ul class=\"ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-autocomplete ui-menu\"><li class=\"finder-pager-info\"></li></ul>");
				this.menu.element.after(this.pager);
				if (this.options.menuClass)
					this.pager.addClass(this.options.menuClass);
			}

			$(".finder-pager-info", this.pager).text(this._getPagerText());

			this.pager.show();
			var positionParams = this._getPagerPositionParams();
			this.pager.outerWidth(positionParams.width).zIndex(positionParams.zIndex);

			this.pager.position($.extend({
				of: positionParams.element
			}, { my: "left top", at: "left bottom", collision: "none", offset: positionParams.offset }));
		},

		_getPagerPositionParams: function () {
			//if this.totalItems == 0 we will show only pager, so we cant use menu element to calculate position/size

			var menuVisible = this.totalItems > 0;
			var positionElement = menuVisible ? this.menu.element : $(this.options.position.of);
			return {
				element: positionElement,
				width: menuVisible ? this.menu.element.outerWidth() : $(this.options.position.of).outerWidth() + 1,
				offset: menuVisible ? "0 -2" : "0 0",
				zIndex: this.element.zIndex() + 1
			};
		},

		_getPagerText: function () {
			if (this.totalItems == 0) {

				if (!this.options.emptyText)
					this.options.emptyText = this.options.infoText.replace("_START_", 0).replace("_END_", 0).replace("_TOTAL_", 0);

				return this.options.emptyText;
			}

			return this.options.infoText.replace("_START_", this.options.offset + 1)
			.replace("_END_", this._displayEnd(this.totalItems))
			.replace("_TOTAL_", this.totalItems);
		},

		_displayEnd: function (total) {
			return Math.min(this.options.offset + this.options.limit, total);
		},

		_initSource: function () {

			if (!this.options.usePaging) {
				base["_initSource"].call(this);
				return;
			}

			this.itemsCache = { cacheLower: -1 };

			if ($.isArray(this.options.source))
				this._initSourceFromArray();
			else if (typeof this.options.source === "string")
				this._initRemouteSource();
			else
				this.source = this.options.source;
		},

		_initSourceFromArray: function () {

			var self = this;
			var array = this.options.source;

			this.source = function (request, response) {
				if (!request.pageChange) {
					self._setCache($.ui.autocomplete.filter(array, request.term, self.options.findProperties), 0);
					self.options.offset = 0;
					self.totalItems = self.itemsCache.cacheUpper;
				}

				response({ items: self._getPage(), total: self.totalItems });
			};
		},

		_initRemouteSource: function () {
			var url = this.options.source;
			var self = this;
			//how much pages will be cached
			var pipe = 5;
			this.source = function (request, response) {
				if (!request.pageChange)
					self.options.offset = 0;
				var needServer = self._needServerRequest(request);

				if (needServer) {
					if (self.xhr)
						self.xhr.abort();
					self.xhr = $.ajax({
						url: url,
						type: "POST",
						data: JSON.stringify({ criteria: { searchPattern: request.term, offset: self.options.offset, limit: self.options.limit * pipe } }),
						dataType: "json",
						contentType: "application/json; charset=utf-8",
						success: function (result) {
							var data = result.data;
							self.totalItems = data.total;
							self._setCache(data.items, self.options.offset);
							response({ items: self._getPage(), total: self.totalItems });
						}
					});
				}
				else
					response({ items: self._getPage(), total: self.totalItems });
			};
		},

		_needServerRequest: function (request) {
			var needServer = !request.pageChange;
			if (request.pageChange) {
				/* outside pipeline? */
				if (this.itemsCache.cacheLower < 0 || this.options.offset < this.itemsCache.cacheLower || this._displayEnd(this.totalItems) > this.itemsCache.cacheUpper) {
					needServer = true;
					this.itemsCache.cacheLower = -1;
				}
			}

			return needServer;
		},

		_getPage: function () {
			var pageItems = $.extend(true, [], this.itemsCache.data);
			pageItems.splice(0, this.options.offset - this.itemsCache.cacheLower);
			pageItems.splice(this.options.limit, pageItems.length);

			return pageItems;
		},

		_setCache: function (data, cacheLower) {
			this.itemsCache.data = data;
			this.itemsCache.cacheLower = cacheLower;
			this.itemsCache.cacheUpper = cacheLower + data.length;
		}
	});

	$.extend(autocomplete, {
		filter: function (array, term, findProperties) {

			var matcher = new RegExp(autocomplete.escapeRegex(term), "i");

			return $.grep(array, function (value) {

				if (!findProperties || !findProperties.length)
					return matcher.test(value.label || value.value || value);

				for (var i = 0; i < findProperties.length; i++) {
					if (matcher.test(value[findProperties[i]]))
						return true;
				}

				return false;
			});
		},
		find: function (liarray, term, findProperties) {
			var lcTerm = term.toLowerCase();
			return $.grep(liarray, function (li) {
				var item = $(li).data("ui-autocomplete-item");
				if (item.toLowerCase || !findProperties)
					return lcTerm == item.toLowerCase();

				for (var j = 0; j < findProperties.length; j++) {
					if (lcTerm == item[findProperties[j]].toLowerCase())
						return true;
				}
				return false;
			});
		}
	});

})(jQuery, jQuery.ui.autocomplete);