(function($, undefined) {
	"use strict";

	var KeyCodes = {
		ArrowDown: 40,
		ArrowUp: 38,
		Shift: 16,
		Control: 17,
		Alt: 18,
		Tab: 9,
		Enter: 13,
		Escape: 27
	}


	$.widget("bitwise.suggestions", $.bitwise.base, {
	
		options: {
			source: [],
			minlength: 1,
			predicate: undefined,
			itembuilder: undefined,
			value: undefined,
			onchange: undefined
		},

		currentSuggestions: [],
	
		_init: function() {
			if (this.options.predicate == undefined) {
				this.options.predicate = $.bitwise.suggestions.predicates.startswith;
			}

			if (this.options.itembuilder == undefined) {
				this.options.itembuilder = this._makeItemFromOption;
			}

			var $select = this.$element.find("select").first();
			
			if ($select.length == 1) {
				this._parseSelect($select);
				$select.remove();
			}
	
			this.$input = this.$element.find("input").first();
			
			this._makeUi();
		},
		
		_makeUi: function() {
			var pos = $.extend({}, this.$input.position(), {
				height: this.$input[0].offsetHeight
			});
			
			this.$suggestions = $("<div></div>")
									.addClass("bw-suggestions-suggestions")
									.addClass("hidden")
									.insertAfter(this.$input)
									.css({
										top: pos.top + pos.height,
										left: pos.left
									})
									.on("click", ".bw-suggestions-item", $.proxy(this._onItemClick, this))
									.on("mouseenter", ".bw-suggestions-item", $.proxy(this._onItemHover, this));
			
			this.$input
					.on("keypress", $.proxy(this._onInputKeypress, this))
					.on("keyup", $.proxy(this._onInputKeyUp, this))
					.on("keydown", $.proxy(this._onInputKeyDown, this))
					.on("blur", $.proxy(this._onBlur, this));
		},
		
		_updateUi: function() {
		},
		
		_parseSelect: function($select) {
			var source = [];
			
			$select.find("option").each(function(i, elm) {
				var $opt = $(elm);
				var text = $opt.text();
				
				source.push({
					label: text,
					value: $opt.attr("value") || text
				});
			});
			
			this.options.source = source;
		},
		
		_onBlur: function() {
			this.blurtimeout = setTimeout($.proxy(this._hideSuggestions, this), 150);
		},

		_onItemClick: function(e) {
			var $target = $(e.target);
			this.$suggestions.children().removeClass("active");
			$target.addClass("active");

			this._selectActive();
		},

		_onItemHover: function(e) {
			var $target = $(e.target);
			this.$suggestions.children().removeClass("active");
			$target.addClass("active");
		},

		_onInputKeypress: function(e) {
			this._onKeyboardMove(e);
		},

		_onInputKeyDown: function(e) {
			this._onKeyboardMove(e);
		},
		
		_onInputKeyUp: function(e) {
			switch(e.keyCode) {
				//
				// "dead" keys
				//
				case KeyCodes.ArrowDown:
				case KeyCodes.ArrowUp:
				case KeyCodes.Shift:
				case KeyCodes.Control:
				case KeyCodes.Alt: {
					break;
				}

				//
				// select suggestion
				//
				case KeyCodes.Tab:
				case KeyCodes.Enter: {
					if (!this._areSuggestionsVisible()) {
						return;
					}

					this._selectActive();
					break;
				}

				//
				// hide suggestions
				//
				case KeyCodes.Escape: {
					if (!this._areSuggestionsVisible()) {
						return;
					}

					this._hideSuggestions();
					break;
				}

				//
				// everything else
				//
				default: {
					this._search();
				}
			}

			e.stopPropagation();
			e.preventDefault();
		},

		_onKeyboardMove: function(e) {
			if (!this._areSuggestionsVisible()) {
				return;
			}

			switch(e.keyCode) {
				case KeyCodes.Tab:
				case KeyCodes.Enter:
				case KeyCodes.Escape: {
					e.preventDefault();
					break
				}

				case KeyCodes.ArrowUp: {
					e.preventDefault();
					this._prev();
					break;
				}
				
				case KeyCodes.ArrowDown: {
					e.preventDefault();
					this._next();
					break;
				}
			}

			e.stopPropagation()
		},
		
		_showSuggestions: function() {
			if (this.currentSuggestions.length == 0) {
				this._hideSuggestions();
				return;
			}
			this.$suggestions.removeClass("hidden");
		},
		
		_hideSuggestions: function() {
			this.$suggestions.addClass("hidden");
		},

		_search: function() {
			var query = this.$input.val();

			if (query.length < this.options.minlength) {
				return;
			}

			if ($.isFunction(this.options.source)) {
				this.options.source(query, $.proxy(this._makeItems, this));
			}

			else {
				this._makeItems(this._localFilter(query, this.options.source));
			}
		},

		_localFilter: function(query, options) {
			var res = [];

			for (var i in options) {
				if (this.options.predicate(query, options[i])) {
					res.push(options[i]);
				}
			}
 
			return res;
		},

		_makeItems: function(options) {
			this.currentSuggestions = options;

			var $tmp = $("<div></div>");
			var $opt;

			for (var i in options) {
				$opt = this.options.itembuilder(options[i]);
				$opt.prop("suggestion-index", i);
				$tmp.append($opt);
			}

			$tmp.children().first().addClass("active");

			this.$suggestions.empty().append($tmp.children());
			this._showSuggestions();
		},

		_makeItemFromOption: function(option) {
			return $("<div></div>")
						.addClass("bw-suggestions-item")
						.prop("value", option.value)
						.text(option.label);
		},

		_next: function() {
			var $active = this.$suggestions.find(".active");
			var $next = $active.next();

			if ($next.length == 0) {
				// the last suggestion is already
				// active... do nothing
				return;
			}

			$active.removeClass("active");
			$next.addClass("active");
		},

		_prev: function() {
			var $active = this.$suggestions.find(".active");
			var $prev = $active.prev();

			if ($prev.length == 0) {
				// the first suggestion is already
				// active... do nothing
				return;
			}

			$active.removeClass("active");
			$prev.addClass("active");
		},

		_areSuggestionsVisible: function() {
			return !this.$suggestions.hasClass("hidden");
		},

		_selectActive: function() {
			var $active = this.$suggestions.find(".active").first();
			var index = $active.prop("suggestion-index");
			var option = this.currentSuggestions[index];

			this.options.value = option.value;
			this.$input.val(option.label);
			
			this._hideSuggestions();

			if ($.isFunction(this.options.onchange)) {
				this.options.onchange(option);
			}
		}
	});






	$.bitwise.suggestions.predicates = {
		startswith: function(query, option) {
			var len = query.length;
			var lower = query.toLowerCase();

			// the label is most likely to match, so test that first
			if (option.label.toLowerCase().slice(0, len) == lower) {
				return true;
			}

			// and then the value
			return option.value.toLowerCase().slice(0, len) == lower;
		},

		contains: function(query, option) {
			var lower = query.toLowerCase();

			// the label is most likely to match, so test that first
			if (option.label.toLowerCase().indexOf(lower) > -1) {
				return true;
			}

			// and then the value
			return option.value.toLowerCase().indexOf(lower) > -1;
		}
	}

})(jQuery);