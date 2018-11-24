
export default class Model {

	constructor () {
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
	}

	/**
	 * Create the array that represents the board when it is organized,
	 * where the index represents the position and the element the piece number.
	 *
	 * @example
	 * [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
	 */
	createFinalPositionsArr () {
		for ( let i = 0; i < this.getPiecesLength(); i++ ) {
			this.finalPositionsArr[ i ] = i;
		}
	}

	/**
	 * Return the number of pieces in the board.
	 *
	 * @return {number}
	 */
	getPiecesLength () {
		return this.baseNumber * this.baseNumber;
	}

	/**
	 * Return the piece size in percentage.
	 *
	 * @return {number}
	 */
	getPieceSize () {
		return ( 100 - ( ( this.baseNumber - 1 ) * this.gutterSize ) ) / this.baseNumber;
	}

	/**
	 * Toggle board state.
	 */
	toggleBoardState () {
		this.isBoardBlocked = !this.isBoardBlocked;
	}

	toggleBoardShuffling () {
		this.isBoardShuffling = !this.isBoardShuffling;
	}

	/**
	 * Create the message that the user will see after finish organizing the board.
	 */
	updateModalMsg  () {
		var className = 'color-success';
		var movementTxt = this.userMovements <= 1 ? 'movement' : 'movements';
		var dif = Math.abs( this.shuffleTimes - this.userMovements );

		if ( this.userMovements < this.shuffleTimes ) {
			this.modalHeaderMsg = `<h2 class="${className}">Amazing!<br> You did ${this.userMovements} ${movementTxt}.</h2>`;
			this.modalBodyMsg = `<span class="bold">${dif} movements</span> less than the board was shuffled.`;
			return;

		}

		if ( this.userMovements === this.shuffleTimes ) {
			this.modalHeaderMsg = `<h2 class="${className}">Congrats!<br> You did ${this.userMovements} ${movementTxt}.</h2>`;
			this.modalBodyMsg = 'The same number of movements that the board was shuffled.';
			return;
		}

		className = 'color-fail';
		this.modalHeaderMsg = `<h2 class="${className}">Ops!<br> You did ${this.userMovements} ${movementTxt}.</h2>`;
		this.modalBodyMsg = `<span class="bold">${dif} movements</span> more than the board was shuffled.`;
	}

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
	populateListOfPossibleChanges () {
		const up = this.direction.up;
		const right = this.direction.right;
		const down = this.direction.down;
		const left = this.direction.left;
		const num = this.baseNumber;
		const len = this.getPiecesLength();

		this.indexesPossibleMovimentsList = [];

		for ( let i = 0; i < len; i++ ) {

			let currentList = [];

			// Can move to up
			if( i + up >= 0 ) currentList.push( up );

			// Can move to right
			if( ( i + right ) % num > 0 ) currentList.push( right );

			// Can move to down
			if( i + down < len ) currentList.push( down );

			// Can move to left
			if( ( i + left ) % num >= 0  && (i + left ) % num < ( num - 1 ) ) currentList.push( left );

			this.indexesPossibleMovimentsList.push( {
				number: i,
				possibleMoviments: currentList
			} );
		}
	}

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
	shuffledBoardArr ( arr ) {
		this.shuffledPiecesIndexes = arr.map( el => {
			return el.number;
		} )

		// Clone Model.shuffledPiecesIndexes array in order to keep it
		// immutable. The clone will change after each piece movement.
		this.currentPositionsArr = this.shuffledPiecesIndexes.slice( 0 );
	}

	/**
	 * Update Model.currentPositionsArr each time some piece change the position.
	 * this array will be used to be compared to the Model.finalPositionsArr
	 * to verify if the board is organized.
	 *
	 * @param {number} piecePosition
	 */
	updateCurrentPosition ( piecePosition ) {
		var indexOfPiecePos = this.currentPositionsArr.indexOf( piecePosition );
		var indexBlank = this.currentPositionsArr.indexOf( this.getPiecesLength() - 1 );

		this.currentPositionsArr[ indexBlank ] = piecePosition;
		this.currentPositionsArr[ indexOfPiecePos ] = this.getPiecesLength() - 1;
	}

	incrementUserMovements () {
		this.userMovements++;
	}

	resetUserMovements () {
		this.userMovements = 0;
	}

	toggleModalState () {
		this.isModalOpen = !this.isModalOpen;
	}
};
