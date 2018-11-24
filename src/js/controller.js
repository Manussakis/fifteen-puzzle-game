import { $writeInnerHTML } from './helpers';

export default class Controller {
	constructor( model, view ) {
		this.model = model;
		this.view = view;

		view.bindSetShuffleTimes( this.setShuffleTimes.bind( this ) );
		view.bindShuffleInput( this.confirmShuffleOnInput.bind( this ) );
		view.bindStartGame( this.startGame.bind( this ) );
		view.bindToggleModal( this.toggleModal.bind( this ) );
		view.bindCloseModalOutsideClick( this.closeModalOutsideClick.bind( this ) );
		view.bindCloseModalPressingEsc( this.closeModalPressingEsc.bind( this ) );
		view.bindRenderBoard( this.renderBoard.bind( this ) );

		view.setInputVal( this.getShuffleTimes() );

		this.render();
	}

	/**
	* The state of the page at the first time it is loaded.
	*/
	render () {
		this.renderBoard();
		this.renderPieces();
		$writeInnerHTML( this.view.$maxVal, this.model.maxTimes );
		$writeInnerHTML( this.view.$minVal, this.model.minTimes );
		this.view.alocatePieces( this.model.finalPositionsArr, this.model.baseNumber, this.model.getPieceSize(), this.model.gutterSize );
		this.toggleBoardLock();
	}

	closeModalPressingEsc ( ev ) {
		if ( ev.keyCode === 27 && this.getModalState() ) {
			this.toggleModal();
		}
	}

	closeModalOutsideClick ( ev ) {
		if ( ev.target === ev.currentTarget ) {
			this.toggleModal();
		}
	}

	/**
	 * Run the game by pressing enter when the input is focused.
	 */
	confirmShuffleOnInput ( ev ) {
		if ( ev.keyCode === 13 ) {
			ev.preventDefault();
			this.setShuffleTimes();
			this.startGame();
			ev.target.blur();
		}
	}

	/**
	* Make sure the board are square
	*/
	renderBoard () {
		this.view.adjustBoardHeight( this.getBoardSize() );
	}

	/**
	* Get the board width and return it.
	* @return {number}
	*/
	getBoardSize () {
		return this.view.$board.offsetWidth;
	}

	/**
	* Render all pieces in the DOM based on pieces length.
	*/
	renderPieces () {
		for ( let i = 0; i < this.model.getPiecesLength(); i++ ) {
			this.view.renderPiece( i, this.model.baseNumber, this.model.getPieceSize() );
		}

		// The pieces are in the DOM, it is time to add event to them.
		this.view.bindSelectPieceToMove( this.selectPieceToMove.bind( this ) );
	}

	/**
	 * All behavior when same piece is clicked to move.
	 */
	selectPieceToMove ( ev ) {

		if ( this.isBoardBlocked() || this.isBoardShuffling() ) {
			return;
		}

		const el = ev.currentTarget;
		const blankEl = this.view.$board.lastChild;

		const elCurrentX = Number( el.getAttribute( 'data-current-x' ) );
		const elCurrentY = Number( el.getAttribute( 'data-current-y' ) );

		const blankElCurrentX = Number( blankEl.getAttribute( 'data-current-x' ) );
		const blankElCurrentY = Number( blankEl.getAttribute( 'data-current-y' ) );

		// Check if the piece has space to move
		if ( ( elCurrentX - blankElCurrentX === 0 && Math.abs( elCurrentY - blankElCurrentY ) === 1 ) ||
				 ( elCurrentY - blankElCurrentY === 0 && Math.abs( elCurrentX - blankElCurrentX ) === 1 ) ) {

			const elIndex = Number( el.getAttribute( 'data-index' ) );

			this.view.movePiece( elIndex );

			this.updateCounter();

			this.checkBoardState( elIndex )

		} else {
			// Some alert to the user if clicked on a blocked piece
		}
	}

	/**
	* Toggle the Model and View board state.
	*/
	toggleBoardLock () {
		this.model.toggleBoardState();
		this.view.toggleBoardClassName( this.model.isBoardBlocked );
	}

	/**
	* Maxe sure the number choosed by the user is between the maximum
	* and minimum available.
	* Update the this.model.shuffleTimes and pass its value to the input.
	*/
	setShuffleTimes () {

		let times = Number( this.view.getImputVal() );

		if ( times > this.model.maxTimes ) {
			times = this.model.maxTimes;
		}

		if ( times <= this.model.minTimes ) {
			times = this.model.minTimes;
		}

		this.model.shuffleTimes = times;

		this.view.setInputVal( this.model.shuffleTimes );
	}

	/**
	* Make the game ready to be played.
	*/
	startGame () {
		if ( this.model.isBoardShuffling ) return;
		if ( this.model.isModalOpen ) this.toggleModal();
		if ( this.model.isBoardBlocked ) this.toggleBoardLock( this.model.isBoardBlocked );
		this.model.populateListOfPossibleChanges();
		this.view.alocatePieces( this.model.finalPositionsArr, this.model.baseNumber, this.model.getPieceSize(), this.model.gutterSize );
		this.shufflePieces();
		this.resetConter();
	}

	/**
	* Increment the number of the user movements in the Model and view.
	*/
	updateCounter () {
		this.model.incrementUserMovements();
		$writeInnerHTML( this.view.$counter, this.model.userMovements );
	}

	/**
	* Move the currentPiece number x times between the elemets in the
	* this.model.indexesPossibleMovimentsList array, but keep possibleMoviments
	* untouched because it refers to the index.
	*
	* @example
	* [
	*		{ currentPiece: 4, possibleMoviments: [ 1, 4 ] },
	*		{ currentPiece: 1, possibleMoviments: [ 1, -1, 4 ] },
	*		{ ... },
	* ]
	*/
	shufflePieces () {
		let currentTime = 0;
		let index = this.model.getPiecesLength() - 1;
		let moviment = [ this.model.direction.left, this.model.direction.up ][ Math.floor( Math.random() * 2 ) ];
		let arr = this.model.indexesPossibleMovimentsList;
		const times = this.model.shuffleTimes;

		this.model.toggleBoardShuffling();

		let animeShuffle = setInterval( () => {

			if ( currentTime !== times ) {
				// Fiter possibleMoviments in order to prevent the piece to back to the last position
				let possibleMoviments = arr[ index ].possibleMoviments.filter( function( el ) {
					return el !== moviment * -1;
				} );

				// Take randomly one movement to apply
				moviment = possibleMoviments[ Math.floor( Math.random() * possibleMoviments.length ) ];

				let newIndex = index + moviment;

				this.view.movePiece( arr[ newIndex ].number );

				let blankNumberCopy = arr[ index ].number;

				let pieceNumberCopy = arr[ newIndex ].number;

				arr[ index ].number = pieceNumberCopy;

				arr[ newIndex ].number = blankNumberCopy;

				index = newIndex;

				currentTime++;

			} else {

				clearInterval( animeShuffle );

				this.model.shuffledBoardArr( arr );

				this.model.toggleBoardShuffling();
			}

		}, 40 );
	}

	/**
	* Move the counter back to zero.
	*/
	resetConter () {
		this.model.resetUserMovements();
		$writeInnerHTML( this.view.$counter, this.model.userMovements );
	}

	/**
	* Update the array that is the reference to known if the board is organized,
	* than check if it is organized.
	*
	* @param {number} index - The index of the piece that was moved.
	*/
	checkBoardState ( index ) {
		this.model.updateCurrentPosition( index );

		if ( this.isBoardOrganized() ) {
			this.toggleBoardLock();
			this.model.updateModalMsg();
			$writeInnerHTML( this.view.$modalHeader, this.model.modalHeaderMsg );
			$writeInnerHTML( this.view.$modalBody, this.model.modalBodyMsg );
			this.toggleModal();
		}
	}

	/**
	* Return the data that represents if the board is locked.
	*
	* @return {boolean}
	*/
	isBoardBlocked () {
		return this.model.isBoardBlocked;
	}

	/**
	* Return the data that represents if the board is sguffling.
	*
	* @return {boolean}
	*/
	isBoardShuffling () {
		return this.model.isBoardShuffling;
	}

	/**
	* If both arrays are equal, so the board is organized.
	* Return the data that represents the game state.
	*
	* @return {boolean}
	*/
	isBoardOrganized () {
		return JSON.stringify( this.model.currentPositionsArr ) === JSON.stringify( this.model.finalPositionsArr );
	}

	/**
	* Toggle Model and View modal state.
	*/
	toggleModal () {
		this.model.toggleModalState();
		this.view.toggleModal( this.model.isModalOpen )
	}

	/**
	* Return the modal state.
	*
	* @return {boolean}
	*/
	getModalState () {
		return this.model.isModalOpen;
	}

	/**
	* Return the number of movements used to shuffle the board.
	*
	* @return {number}
	*/
	getShuffleTimes () {
		return this.model.shuffleTimes;
	}
};
