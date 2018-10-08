/**
 * fifteen-puzzle.js
 * https://ofcode.com.br/projects/fifteen-puzzle-game
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2018, Gabriel Manussakis
 * https://ofcode.com.br
 */

// Helper - Allow for looping on nodes by chaining
NodeList.prototype.forEach = Array.prototype.forEach;

var Model = {

	init: function() {
		this.baseNumber = 4;
		this.gutterSize = 1, // In percentage
		this.finalPositionsArr = [];
		this.currentPositionsArr = [];
		this.shuffledPiecesIndexes = [];
		this.isBoardBlocked = false;
		this.userMovements = 0;
		this.minTimes = 1;
		this.maxTimes = 80;
		this.shuffleTimes = this.maxTimes;
		this.direction = {
			right: 1,
			left: -1,
			down: this.baseNumber,
			up: this.baseNumber * -1
		};
		this.isModalOpen = false;
		this.modalHeaderMsg = '';
		this.modalBodyMsg = '';
		this.isBoardShuffling = false;

		this.createFinalPositionsArr();
	},

	/**
	 * Create the array that represents the board when it is organized,
	 * where the index represents the position and the element the piece number.
	 *
	 * @example
	 * [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
	 */
	createFinalPositionsArr: function() {
		for ( var i = 0; i < this.getPiecesLength(); i++ ) {
			this.finalPositionsArr[ i ] = i;
		}
	},

	/**
	 * Return the number of pieces in the board.
	 *
	 * @return {number}
	 */
	getPiecesLength: function() {
		return this.baseNumber * this.baseNumber;
	},

	/**
	 * Return the piece size in percentage.
	 *
	 * @return {number}
	 */
	getPieceSize: function() {
		return ( 100 - ( ( this.baseNumber - 1 ) * this.gutterSize ) ) / this.baseNumber;
	},

	/**
	 * Toggle board state.
	 */
	toggleBoardState: function() {
		this.isBoardBlocked = !this.isBoardBlocked;
	},

	toggleBoardShuffling: function() {
		this.isBoardShuffling = !this.isBoardShuffling;
	},

	/**
	 * Create the message that the user will see after finish organizing the board.
	 */
	updateModalMsg: function () {
		var className = 'color-success';
		var movementTxt = this.userMovements <= 1 ? 'movement' : 'movements';
		var dif = Math.abs( this.shuffleTimes - this.userMovements );

		if ( this.userMovements < this.shuffleTimes ) {
			this.modalHeaderMsg = '<h2 class="' + className + '">Amazing!<br> You did ' + this.userMovements + ' ' + movementTxt + '.</h2>';
			this.modalBodyMsg = '<span class="bold">' + dif + ' movements</span> less than the board was shuffled.';

		} else if ( this.userMovements === this.shuffleTimes ) {
			this.modalHeaderMsg = '<h2 class="' + className + '">Congrats!<br> You did ' + this.userMovements + ' ' + movementTxt + '.</h2>';
			this.modalBodyMsg = 'The same number of movements that the board was shuffled.';

		} else {
			className = 'color-fail';
			this.modalHeaderMsg = '<h2 class="' + className + '">Ops!<br> You did ' + this.userMovements + ' ' + movementTxt + '.</h2>';
			this.modalBodyMsg = '<span class="bold">' + dif + ' movements</span> more than the board was shuffled.';
		}
	},

	/**
	 * Store in an array all possibilities of moviments of each position.
	 *
	 * @example
	 * The piece that are in position 1 can move just to right(1), left(-1) and down(4),
	 * assuming 4 the number of pieces per row.
	 * [
	 *		{ currentPiece: 0, possibleMoviments: [ 1, 4 ] },
	 *		{ currentPiece: 1, possibleMoviments: [ 1, -1, 4 ] },
	 *		{ ... },
	 * ]
	 */
	populateListOfPossibleChanges: function() {
		var right = this.direction.right;
		var left = this.direction.left;
		var down = this.direction.down;
		var up = this.direction.up;
		var num = this.baseNumber;
		var len = this.getPiecesLength();

		this.indexesPossibleMovimentsList = [];

		for ( var i = 0; i < len; i++ ) {

			var currentList = [];

			// Can move to right
			if( ( i + right ) % num > 0 ) currentList.push( right );

			// Can move to left
			if( ( i + left ) % num >= 0  && (i + left ) % num < ( num - 1 ) ) currentList.push( left );

			// Can move to up
			if( i + up >= 0 ) currentList.push( up );

			// Can move to down
			if( i + down < len ) currentList.push( down );

			this.indexesPossibleMovimentsList.push( {
				number: i,
				possibleMoviments: currentList
			} );
		}
	},

	/**
	 * Store in Model.shuffledPiecesIndexes array
	 * only the position of each piece shuffled. This array will be used
	 * to render the shuffled board.
	 *
	 * @example
	 * [ 0,13,1,5,4,6,7,15,8,14,2,10,9,12,3,11 ]
	 *
	 * @param {array} arr - The Model.indexesPossibleMovimentsList shuffled
	 */
	shuffledBoardArr: function( arr ) {
		this.shuffledPiecesIndexes = [];
		for( var i = 0; i < arr.length; i++ ) {
			this.shuffledPiecesIndexes.push( arr[ i ].number );
		}

		// Clone Model.shuffledPiecesIndexes array in order to keep it
		// immutable. The clone will change after each piece movement.
		this.currentPositionsArr = this.shuffledPiecesIndexes.slice( 0 );
	},

	/**
	 * Update Model.currentPositionsArr each time some piece change the position.
	 * this array will be used to be compared to the Model.finalPositionsArr
	 * to verify if the board is organized.
	 *
	 * @param {number} piecePosition
	 */
	updateCurrentPosition: function( piecePosition ) {
		var indexOfPiecePos = this.currentPositionsArr.indexOf( piecePosition );
		var indexBlank = this.currentPositionsArr.indexOf( this.getPiecesLength() - 1 );

		this.currentPositionsArr[ indexBlank ] = piecePosition;
		this.currentPositionsArr[ indexOfPiecePos ] = this.getPiecesLength() - 1;
	},

	/**
	 * Just increment.
	 */
	incrementUserMovements: function() {
		this.userMovements++;
	},

	/**
	 * Back it to the number to zero.
	 */
	resetUserMovements: function() {
		this.userMovements = 0;
	},

	/**
	 * Just toggle the modal state.
	 */
	toggleModalState: function() {
		this.isModalOpen = !this.isModalOpen;
	}
};


var View = {
	init: function() {
		this.$board = document.getElementById( 'board' );
		this.$shuffleInput = document.getElementById( 'shuffle-input' );
		this.$playBtns = document.querySelectorAll( '.play-game' );
		this.$counter = document.getElementById( 'counter' );
		this.$maxVal = document.getElementById( 'max-val' );
		this.$minVal = document.getElementById( 'min-val' );
		this.$modal = document.getElementById( 'modal' );
		this.$modalHeader = document.getElementById( 'modal-header' );
		this.$modalBody = document.getElementById( 'modal-body' );
		this.$closeModalEls = document.querySelectorAll( '.close-modal' );

		var self = this;

		this.$shuffleInput.addEventListener( 'blur', function () {
			Controller.setShuffleTimes( Number( self.getImputVal() ) );
		} );

		this.$shuffleInput.addEventListener( 'keydown', function ( ev ) {
			if ( ev.keyCode === 13 ) {
				ev.preventDefault();
				Controller.setShuffleTimes( Number( self.getImputVal() ) );
				Controller.startGame.call( Controller );
				this.blur();
			}
		} );

		this.$playBtns.forEach( function( el ) {
			el.addEventListener( 'click', Controller.startGame.bind( Controller ) );
		} );

		this.$closeModalEls.forEach( function( el ) {
			el.addEventListener( 'click', Controller.toggleModal );
		} );

		this.$modal.addEventListener( 'click', function( ev ) {
			if ( ev.target === ev.currentTarget ) {
				Controller.toggleModal();
			}
		} );

		window.addEventListener( 'keydown', function( ev ) {
			if ( ev.keyCode === 27 && Controller.getModalState() ) {
				Controller.toggleModal();
			}
		} );

		this.render();
	},

	/**
	 * Set input value according to the Model.
	 */
	render: function() {
		this.$shuffleInput.value = Controller.getShuffleTimes();
	},

	/**
	 * Set the height of the board in pixel.
	 *
	 * @param {number} height - The value to set the board height
	 */
	adjustBoardHeight: function( height ) {
		this.$board.style.height = height + 'px';
	},

	/**
	 * Return the value entered by the user.
	 *
	 * @return {string}
	 */
	getImputVal: function() {
		return this.$shuffleInput.value;
	},

	/**
	 * Set the input value.
	 *
	 * @param {number} value - The value that the input will be setted.
	 */
	setInputVal: function( value ) {
		this.$shuffleInput.value = value.toString();
	},

	/**
	 * Render each piece in the DOM
	 *
	 * @param {number} index - Index of the piece
	 * @param {number} baseNumber - Number of Piece per row
	 * @param {number} pieceSize - The width/height os the piece in percentage
	 */
	renderPiece: function( index, baseNumber, pieceSize ) {
		var pieceNumberText = index + 1;
		var coordinateX = index % baseNumber;
		var coordinateY = Math.floor(index / baseNumber );
		var pieceEl = document.createElement( 'div' );

		pieceEl.classList.add( 'piece' );
		pieceEl.style.width = pieceSize + '%';
		pieceEl.style.height = pieceSize + '%';
		pieceEl.setAttribute( 'data-index', index );
		pieceEl.innerHTML = pieceNumberText;

		pieceEl.addEventListener( 'click', this.selectPieceToMove.bind( this ) );

		this.$board.appendChild( pieceEl );
	},

	/**
	 * Position the pieces shuffleds in the board
	 *
	 * @param {array} mix - The array shuffled, e.g. [ 0, 5, 2, ... ]
	 * @param {number} baseNumber - Number of Piece per row
	 * @param {number} pieceSize - The width/height os the piece in percentage
	 * @param {number} gutterSize - The gutter betwwe pieces in percentage
	 */
	alocatePieces: function( mix, baseNumber, pieceSize, gutterSize ) {
		var piecesEls = document.querySelectorAll( '.piece' );

		for ( var i = 0; i < mix.length; i++ ) {
			var coordinateX = mix.indexOf( i ) % baseNumber;
			var coordinateY = Math.floor(mix.indexOf( i ) / baseNumber );

			piecesEls[ i ].style.left = ( coordinateX * ( pieceSize + gutterSize ) ) + "%";
			piecesEls[ i ].style.top = ( coordinateY * ( pieceSize + gutterSize ) ) + "%";

      piecesEls[ i ].setAttribute( 'data-current-x', coordinateX );
      piecesEls[ i ].setAttribute( 'data-current-y', coordinateY );
		}
	},

	/**
	 * Toggle the class that block the board.
	 *
	 * @param {boolean} boardState - Is board Locked?
	 */
	toggleBoardClassName: function( boardState ) {
		this.$board.classList[ boardState ? 'add' : 'remove' ]( 'board-blocked' );
	},

	/**
	 * All behavior when same piece is clicked to move.
	 */
	selectPieceToMove: function( ev ) {

		if ( Controller.isBoardBlocked() || Controller.isBoardShuffling() ) {
			return;
		}

		var el = ev.currentTarget;
		var blankEl = this.$board.lastChild;

		var elCurrentX = Number( el.getAttribute( 'data-current-x' ) );
		var elCurrentY = Number( el.getAttribute( 'data-current-y' ) );

		var blankElCurrentX = Number( blankEl.getAttribute( 'data-current-x' ) );
		var blankElCurrentY = Number( blankEl.getAttribute( 'data-current-y' ) );

		// Check if the piece has space to move
		if ( ( elCurrentX - blankElCurrentX === 0 && Math.abs( elCurrentY - blankElCurrentY ) === 1 ) ||
				 ( elCurrentY - blankElCurrentY === 0 && Math.abs( elCurrentX - blankElCurrentX ) === 1 ) ) {

			var elIndex = Number( el.getAttribute( 'data-index' ) );

			this.movePiece( elIndex );

			Controller.updateCounter();

			Controller.checkBoardState( elIndex )

		} else {
			// Some alert to the user
		}
	},

	/**
	 * Execute the UI piece movement.
	 *
	 * @param {number} index - The index of the piece that will be moved.
	 */
	movePiece: function( index ) {

		var el = document.querySelector( '[data-index="' + index + '"]' );
		var blankEl = this.$board.lastChild;

		var elStyleTop = el.style.top;
		var elStyleLeft = el.style.left;

		var elCurrentX = Number( el.getAttribute( 'data-current-x' ) );
		var elCurrentY = Number( el.getAttribute( 'data-current-y' ) );

		el.style.top = blankEl.style.top;
		el.style.left = blankEl.style.left;
		el.setAttribute( 'data-current-x', Number( blankEl.getAttribute( 'data-current-x' ) ) );
		el.setAttribute( 'data-current-y', Number( blankEl.getAttribute( 'data-current-y' ) ) );

		blankEl.style.top = elStyleTop;
		blankEl.style.left = elStyleLeft;
		blankEl.setAttribute( 'data-current-x', elCurrentX );
		blankEl.setAttribute( 'data-current-y', elCurrentY );
	},

	/**
	 * Show or hide modal depending on its state.
	 *
	 * @param {boolean} state - The modal state.
	 */
	toggleModal: function( state ) {
		this.$modal.classList[ state ? 'add' : 'remove' ]( 'modal-is-open' );
	},
};


var Controller = {
	init: function() {
		Model.init();
		View.init();

		this.render()
	},

	/**
	 * The state of the page at the first time it is loaded.
	 */
	render: function() {
		this.renderBoard();
		this.renderPieces();
		this.writeInnerHTML( View.$maxVal, Model.maxTimes );
		this.writeInnerHTML( View.$minVal, Model.minTimes );
		View.alocatePieces( Model.finalPositionsArr, Model.baseNumber, Model.getPieceSize(), Model.gutterSize );
		this.toggleBoardLock();

		var self = this;

		[ 'resize', 'orientationchange' ].forEach( function( eventName ) {
			window.addEventListener( eventName, self.renderBoard.bind( self ) );
		} );

	},

	/**
	 * Pass the board width as a paramenter to adjust
	 * its height.
	 */
	renderBoard: function() {
		View.adjustBoardHeight( this.getBoardSize() );
	},

	/**
	 * Get the board width and return it.
	 * @return {number}
	 */
	getBoardSize: function() {
		return View.$board.offsetWidth;
	},

	/**
	 * Render all pieces in the DOM based on pieces length.
	 */
	renderPieces: function() {
		for ( var i = 0; i < Model.getPiecesLength(); i++ ) {
			View.renderPiece( i, Model.baseNumber, Model.getPieceSize() );
		}
	},

	/**
	 * Write the inner HTML in the DOM element.
	 *
	 * @param {object} el - DOM element.
	 * @param {string} text - The text to bo inserted in the element.
	 */
	writeInnerHTML: function( el, text ) {
		el.innerHTML = text;
	},

	/**
	 * Toggle the Model and View board state.
	 */
	toggleBoardLock: function() {
		Model.toggleBoardState();
		View.toggleBoardClassName( Model.isBoardBlocked );
	},

	/**
	 * Maxe sure the number choosed by the user is between the maximum
	 * and minimum available.
	 * Update the Model.shuffleTimes and pass its value to the input.
	 *
	 * @param {number} times - The number choosed by the user.
	 */
	setShuffleTimes: function( times ) {

		if ( times > Model.maxTimes ) {
			times = Model.maxTimes;
		}

		if ( times <= Model.minTimes ) {
			times = Model.minTimes;
		}

		Model.shuffleTimes = times;

		View.setInputVal( Model.shuffleTimes );
	},

	/**
	 * Make the game ready to be played.
	 */
	startGame: function() {
		if ( Model.isBoardShuffling ) return;
		if ( Model.isModalOpen ) this.toggleModal();
		if ( Model.isBoardBlocked ) this.toggleBoardLock( Model.isBoardBlocked );
		Model.populateListOfPossibleChanges();
		View.alocatePieces( Model.finalPositionsArr, Model.baseNumber, Model.getPieceSize(), Model.gutterSize );
		this.shufflePieces();
		this.resetConter();
	},

	/**
	 * Increment the number of the user movements in the Model and View.
	 */
	updateCounter: function() {
		Model.incrementUserMovements();
		this.writeInnerHTML( View.$counter, Model.userMovements );
	},

	/**
	 * Move the currentPiece number x times between the elemets in the
	 * Model.indexesPossibleMovimentsList array, but keep possibleMoviments
	 * untouched because it refers to the index.
	 *
	 * @example
	 * [
	 *		{ currentPiece: 4, possibleMoviments: [ 1, 4 ] },
	 *		{ currentPiece: 1, possibleMoviments: [ 1, -1, 4 ] },
	 *		{ ... },
	 * ]
	 */
	shufflePieces: function() {
		var currentTime = 0;
		var index = Model.getPiecesLength() - 1;
		var moviment = [ Model.direction.left, Model.direction.up ][ Math.floor( Math.random() * 2 ) ];
		var arr = Model.indexesPossibleMovimentsList;
		var times = Model.shuffleTimes;

		var self = this;

		Model.toggleBoardShuffling();

		var animeShuffle = setInterval( function() {

			if ( currentTime !== times ) {
				// Fiter possibleMoviments in order to prevent the piece to back to the last position
				var possibleMoviments = arr[ index ].possibleMoviments.filter( function( el ) {
					return el !== moviment * -1;
				} );

				// Take randomly one movimento to apply
				moviment = possibleMoviments[ Math.floor( Math.random() * possibleMoviments.length ) ];

				var newIndex = index + moviment;

				View.movePiece( arr[ newIndex ].number );

				var blankNumberCopy = arr[ index ].number;

				var pieceNumberCopy = arr[ newIndex ].number;

				arr[ index ].number = pieceNumberCopy;

				arr[ newIndex ].number = blankNumberCopy;

				index = newIndex;

				currentTime++;

			} else {

				clearInterval( animeShuffle );

				Model.shuffledBoardArr( arr );

				Model.toggleBoardShuffling();
			}

		}, 40 );
	},

	/**
	 * Move the counter back to zero.
	 */
	resetConter: function() {
		Model.resetUserMovements();
		this.writeInnerHTML( View.$counter, Model.userMovements );
	},

	/**
	 * Update the array that is the reference to known if the board is organized,
	 * than check if it is organized.
	 *
	 * @param {number} index - The index of the piece that was moved.
	 */
	checkBoardState: function( index ) {
		Model.updateCurrentPosition( index );

		if ( this.isBoardOrganized() ) {
			this.toggleBoardLock();
			Model.updateModalMsg();
			this.writeInnerHTML( View.$modalHeader, Model.modalHeaderMsg );
			this.writeInnerHTML( View.$modalBody, Model.modalBodyMsg );
			this.toggleModal();
		}
	},

	/**
	 * Return the data that represents if the board is locked.
	 *
	 * @return {boolean}
	 */
	isBoardBlocked: function() {
		return Model.isBoardBlocked;
	},

	/**
	 * Return the data that represents if the board is sguffling.
	 *
	 * @return {boolean}
	 */
	isBoardShuffling: function() {
		return Model.isBoardShuffling;
	},

	/**
	 * If both arrays are equal, so the board is organized.
	 * Return the data that represents the game state.
	 *
	 * @return {boolean}
	 */
	isBoardOrganized: function() {
		return JSON.stringify( Model.currentPositionsArr ) === JSON.stringify( Model.finalPositionsArr );
	},

	/**
	 * Toggle Model and View modal state.
	 */
	toggleModal: function() {
		Model.toggleModalState();
		View.toggleModal( Model.isModalOpen )
	},

	/**
	 * Return the modal state.
	 *
	 * @return {boolean}
	 */
	getModalState: function() {
		return Model.isModalOpen;
	},

	/**
	 * Return the number of movements used to shuffle the board.
	 *
	 * @return {number}
	 */
	getShuffleTimes: function() {
		return Model.shuffleTimes;
	}
};

Controller.init();
