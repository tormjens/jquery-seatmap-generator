// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	'use strict';

		/**
		* These are the main plugin variables.
		*/
		var pluginName = 'seatmap',
			defaults = {
				rows 		: 30, // number of rows to add by default when no data exists
				cols 		: 30, // columns to add per row when no data exists
				data 		: [], // the data already in place for the seatmap
				classes 	: { // these classes correspond with the classes in our stylesheet
					container	: 'seatmap-container',
					row 		: 'seatmap-row',
					column 		: 'seatmap-col',
					controls 	: 'seatmap-controls',
					states 		: {
						'0'		: 'default',
						'1'		: 'seat',
						'2'		: 'locked',
						'3'		: 'taken'
					}
				},
				containers	: {
					controls 		: '', // by default controls will be placed inside the element, but it could also be placed outside by passing a selector
				},
				multiple: 1, // enables multiple selection for building seatmaps
				onUpdate: null, // run whenever something is updated in the seatmap
				language: { // translations for strings
					delete_row		: 'Delete Row',
					delete_col 		: 'Delete Column',
					new_row 		: 'New Row',
					new_col 		: 'New Column',
					clear_all 		: 'Clear All',
					states 			: {
						'0'			: 'Standard',
						'1'			: 'Seat',
						'2'			: 'Locked',
						'3'			: 'Taken'
					}
				}
			};

		/**
		* The actual plugin constructor
		*
		* @class 	SeatmapPlugin
		* @constructor
		*/
		function SeatmapPlugin ( element, options ) {
				this.element 	= element;
				this.settings 	= $.extend( {}, defaults, options );
				$(this).data('state', '0');
				this._defaults 	= defaults;
				this._name 		= pluginName;
				this.init();
		}

		// Avoid SeatmapPlugin.prototype conflicts
		$.extend(SeatmapPlugin.prototype, {

			/**
			* Initializes the plugin
			*
			* @method 	init
			* @return 	{Void}
			*/
			init: function () {

				// add a wrapper class
				$(this.element).addClass('seatmap-wrapper');

				// set up the control interface
				this.setupControls();

				// build the seatmap interface
				this.setupSeatmap();
			},

			/**
			* Starts setting up the initial seatmap
			*
			* @method 	setupSeatmap
			* @return 	{Void}
			*/
			setupSeatmap: function() {

				// lets store the current instance for ourselves so we can fetch it in other scopes
				var self = this;

				// create the container for the seatmap
				var container = $('<div class="'+ this.settings.classes.container + '" />').appendTo(self.element);

				// add a delete column button on top of each column
				var top_row = $('<div class="seatmap-top-row"></div>').appendTo(container);

				// figure out how many rows there are to create
				var rows = this.settings.rows;
				if( this.settings.data.length !== 0 ) {
					rows = this.settings.data.length;
				}

				// create said number of rows
				for (var i = 0; i < rows; i++) {
					this.addRow(i, container);
				}

				// bind events on the seatmap
				this.bindSeatmap();
			},

			/**
			* Adds a row to the seatmap
			*
			* @method 	addRow
			* @param 	{Integer} 		i			The row ID
			* @param 	{Object} 		container 	The element where the row should be placed
			* @return 	{Object} 					The newly created DOM element
			*/
			addRow: function(i, container) {
				// append the row element
				var row = $('<div class="'+ this.settings.classes.row + '"></div>').appendTo(container);

				// change the data attribute for the row
				row.attr('data-row', i);

				// find the total number of columns
				var cols = this.settings.cols;
				if( this.settings.data.length !== 0 ) {
					cols = this.settings.data[i].cols.length;
				}

				// add each column
				for (var c = 0; c < cols; c++) {
					this.addCol(c, row);
				}

				// at the end of each row, add a delete button
				$('<button class="seatmap-delete-row" data-row="'+ i +'" title="'+this.settings.language.delete_row+'">&times;</button>').appendTo(row);

				return row;
			},

			/**
			* Adds a column to the seatmap
			*
			* @method 	addCol
			* @param 	{Integer} 		c			The column ID
			* @param 	{Object} 		row 		The row where the column should be placed
			* @return 	{Object} 					The newly created DOM element
			*/
			addCol: function(c, row) {
				var col = $('<div class="'+ this.settings.classes.column + '"></div>').appendTo(row);
				col.attr('data-col', c);
				col.attr('data-state', '0');

				if(row.data('row') === 0) {
					var top_row = $(this.element).find('.seatmap-top-row');
					var button = $('<button class="seatmap-delete-col" data-col="'+ c +'" title="'+this.settings.language.delete_col+'">&times;</button>').appendTo(top_row);
					button.attr('data-col', c);
				}

				return col;
			},

			/**
			* Sets up the controls
			*
			* @method 	setupControls
			* @return 	{Void}
			*/
			setupControls: function() {

				var controls;

				// create the controls
				// if a container has not been set, use the instance
				if( this.settings.containers.controls === '' ) {
					controls = this.element;
				}
				// if it has, use it baby
				else {
					controls = this.settings.containers.controls;
				}

				// append the container
				controls = $('<div class="'+ this.settings.classes.controls + '" />').appendTo(controls);

				// add the "new row"-interface
				controls.append('<button class="seatmap-controls-new-row">'+ this.settings.language.new_row +'</button>');

				// add the "new row"-interface
				controls.append('<button class="seatmap-controls-new-col">'+ this.settings.language.new_col +'</button>');

				// add the "new row"-interface
				controls.append('<button class="seatmap-controls-clear">'+ this.settings.language.clear_all +'</button>');

				// set up the state changer
				var states = $('<div class="seatmap-states" />').appendTo(controls);
				states.append('<button class="seatmap-state-change" data-state="0">'+ this.settings.language.states['0'] +'</button>');
				states.append('<button class="seatmap-state-change" data-state="1">'+ this.settings.language.states['1'] +'</button>');
				states.append('<button class="seatmap-state-change" data-state="2">'+ this.settings.language.states['2'] +'</button>');
				states.append('<button class="seatmap-state-change" data-state="3">'+ this.settings.language.states['3'] +'</button>');

				this.bindControls(controls);

			},

			/**
			* Binds clicks and other events to the seatmap
			*
			* @method 	bindSeatmap
			* @return 	{Void}
			*/
			bindSeatmap: function() {

				var self = this;

				// find where the container is
				var container = $(this.element).find('.'+this.settings.classes.container);

				// only add the dragselect interface
				if( this.settings.multiple ) {

					// by default the mouse is not down
					var isMouseDown = false;

					// check for both mousedown and mousemove
					container
						.on( 'mousedown', '.'+ this.settings.classes.column, function () {
							isMouseDown = true;
							self.toggleSeat($(this));
							return false; // prevent text selection
						})
						.on( 'mouseover', '.'+ this.settings.classes.column, function () {
							if (isMouseDown) {
								self.toggleSeat($(this));
							}
						});

					// when the mouse is released, the mouse is not down
					container
						.on('mouseup', function () {
							isMouseDown = false;
							if (typeof self.settings.onUpdate === 'function') { // make sure the callback is a function
								var obj = self.buildObject();
						        self.settings.onUpdate.call(this, obj); // brings the scope to the callback
						    }
						});

				}

				//
			},

			/**
			* Toggles a seat with the current state
			*
			* @method 	toggleSeat
			* @param 	{String} 		seat		The seat to be toggled
			* @return 	{Void}
			*/
			toggleSeat: function(seat) {
				var state 		= $(seat).data('state');

				state 		= $(this).data('state');

				var stateClass 	= this.settings.classes.states[state];

				$(seat).toggleClass(stateClass);

			},

			/**
			* Builds an object of the entire seatmap.
			* To be used in save processes etc
			*
			* @method 	buildObject
			* @return 	{Object}					An object
			*/
			buildObject: function() {

				var self 	= this,
					obj 	= [],
					rows 	= $(self.element).find('.'+ self.settings.classes.row);

				rows.each(function() {
					var row_id 	= $(this).data('row'),
						row 	= {row_id: row_id, cols: []};

					$(this).find('.'+ self.settings.classes.column).each(function() {
						var col_id 	= $(this).data('col'),
							state 	= $(this).data('state');

						row.cols.push({ col_id: col_id, state: state });
					});
					obj[row_id] = row;
				});

				return obj;

			},

			/**
			* Gets the current control state
			*
			* @method 	getCurrentState
			* @return 	{String}					The current state
			*/
			getCurrentState: function() {
				return $(this).data('state');
			},

			/**
			* Changes the current control state
			*
			* @method 	changeState
			* @param 	{String} 		state		The new state
			* @return 	{Void}
			*/
			changeState: function(state) {
				$(this).data('state', state);
			},

			/**
			* Gets the next availiable row number
			*
			* @method 	getNextRowNumber
			* @return 	{Integer}					A number representing the next row number
			*/
			getNextRowNumber: function() {
				var rows 	= $(this.element).find('.'+ this.settings.classes.row);

				var ids 	= [];

				rows.each(function() {
					ids.push($(this).data('row'));
				});

				return (Math.max.apply(Math, ids) + 1);
			},

			/**
			* Gets the next availiable column number
			*
			* @method 	getNextColNumber
			* @return 	{Integer}					A number representing the next column number
			*/
			getNextColNumber: function() {
				var row 	= $(this.element).find('.'+ this.settings.classes.row).last(),
					cols 	= row.find('.'+ this.settings.classes.column);

				console.log(row);

				var ids 	= [];

				cols.each(function() {
					ids.push($(this).data('col'));
				});

				return (Math.max.apply(Math, ids) + 1);
			},

			/**
			* Updates the row ids to their are "symetric"
			*
			* @method 	updateRowIds
			* @return 	{Void}
			*/
			updateRowIds: function() {
				var rows 	= $(this.element).find('.'+ this.settings.classes.row),
					row_id 		= 0;

				rows.each(function() {
					var row = $(this);

					row.find('.seatmap-delete-row').attr('data-row', row_id);

					row.attr('data-row', row_id);

					row_id++;
				});
			},

			/**
			* Updates the column ids to their are "symetric"
			*
			* @method 	updateColIds
			* @return 	{Void}
			*/
			updateColIds: function() {

				var self = this;

				var rows 	= $(this.element).find('.'+ this.settings.classes.row);

				rows.each(function() {
					var row = $(this);
					var cols 	= row.find('.'+ self.settings.classes.column);
					var col_id 	= 0;
					cols.each(function() {
						$(this).attr('data-col', col_id);
						col_id++;
					});
				});

				var top_row = $(this.element).find('.seatmap-top-row');

				var col_id 	= 0;
				top_row.find('.seatmap-delete-col').each(function() {
					$(this).attr('data-col', col_id);
					col_id++;
				});

			},

			/**
			* Binds clicks and other events to the controls
			*
			* @method 	bindControls
			* @param 	{Object} 		controls	The DOM element for the controls
			* @return 	{Void}
			*/
			bindControls: function(controls) {

				var self = this;

				controls.on('click', '.seatmap-state-change', function() {

					$('.seatmap-state-change').not(this).removeClass('active');

					$(this).toggleClass('active');

					if( self.getCurrentState() === $(this).data('state')) {
						self.changeState('0');
					}
					self.changeState($(this).data('state'));

				});

				$(controls).find('.seatmap-state-change' +'[data-state="1"]').trigger('click');

				controls.on('click', '.seatmap-controls-new-row', function() {

					var container = $(self.element).find('.' + self.settings.classes.container);

					var row = $(self.element).find('.' + self.settings.classes.row).last().clone().appendTo(container);

					row.find('.'+self.settings.classes.column).each(function() {
						$(this).removeClass();
						$(this).addClass(self.settings.classes.column);
					});

					var row_id = self.getNextRowNumber();

					row.find('.seatmap-delete-row').attr('data-row', row_id);

					row.attr('data-row', row_id);

					self.bindSeatmap();

				});

				controls.on('click', '.seatmap-controls-new-col', function() {

					var rows 	= $(self.element).find('.'+ self.settings.classes.row);

					rows.each(function() {

						var c = self.getNextColNumber();

						var row = $(this);

						var last_col = row.find('.'+self.settings.classes.column).last();
						var col = $('<div class="'+ self.settings.classes.column + '"></div>').insertAfter(last_col);

						col.attr('data-col', c);
						col.attr('data-state', '0');

						if(row.data('row') === 0) {
							var top_row = $(self.element).find('.seatmap-top-row');
							var button = $('<button class="seatmap-delete-col" data-col="'+ c +'" title="'+self.settings.language.delete_col+'">&times;</button>').appendTo(top_row);
							button.attr('data-col', c);
						}

					});

				});

				$(self.element).on('click', '.seatmap-delete-row', function() {
					$(this).parent().remove();
					self.updateRowIds();
				});

				$(self.element).on('click', '.seatmap-delete-col', function() {
					$(self.element).find('.'+ self.settings.classes.column +'[data-col="'+ $(this).data('col') +'"]').remove();
					$(this).remove();
					self.updateColIds();
				});

			},

		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options, callback ) {
			return this.each(function() {

				if ( !$.data( this, 'plugin_' + pluginName ) ) {
					$.data( this, 'plugin_' + pluginName, new SeatmapPlugin( this, options ) );
				}

				if( typeof options === 'string' && $.data( this, 'plugin_' + pluginName ) ) {
					var plugin = $.data( this, 'plugin_' + pluginName );
					console.log(plugin)
				}


			});
		};

})( jQuery, window, document );
