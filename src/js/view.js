import { $on } from './helpers';

export default class View {

  constructor () {
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
	}

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindCloseModalPressingEsc ( handler ) {
    $on( window, 'keydown', handler );
  }

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindCloseModalOutsideClick ( handler ) {
    $on( this.$modal, 'click', handler );
  }

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindToggleModal( handler ) {
    this.$closeModalEls.forEach( el  => {
      $on( el, 'click', handler );
		} );
  }

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindStartGame( handler ) {
    this.$playBtns.forEach( el  => {
      $on( el, 'click', handler );
    } );
  }

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindSetShuffleTimes ( handler ) {
    $on( this.$shuffleInput, 'blur', handler );
  }

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindShuffleInput ( handler ) {
    $on( this.$shuffleInput, 'keydown', handler );
  }

  /**
	 * @param {Function} handler - Callback event function.
	 */
  bindSelectPieceToMove ( handler ) {
    const $pieces = document.querySelectorAll( '.piece' );
    $pieces.forEach( el => {
      $on( el, 'click', handler );
    } );
  }

	/**
	 * Set the height of the board in pixel.
	 *
	 * @param {number} height - The value to set the board height
	 */
	adjustBoardHeight ( height ) {
		this.$board.style.height = `${height}px`;
	}

	/**
	 * Return the value entered by the user.
	 *
	 * @return {string}
	 */
	getImputVal () {
		return this.$shuffleInput.value;
	}

	/**
	 * Set the input value.
	 *
	 * @param {number} value - The value that the input will be setted.
	 */
	setInputVal ( value ) {
		this.$shuffleInput.value = value.toString();
	}

	/**
	 * Render each piece in the DOM
	 *
	 * @param {number} index - Index of the piece
	 * @param {number} baseNumber - Number of Piece per row
	 * @param {number} pieceSize - The width/height os the piece in percentage
	 */
	renderPiece ( index, baseNumber, pieceSize ) {
		const pieceNumberText = index + 1;
		const coordinateX = index % baseNumber;
		const coordinateY = Math.floor(index / baseNumber );
		const pieceEl = document.createElement( 'div' );

		pieceEl.classList.add( 'piece' );
		pieceEl.style.width = `${pieceSize}%`;
		pieceEl.style.height = `${pieceSize}%`;
		pieceEl.setAttribute( 'data-index', index );
		pieceEl.innerHTML = pieceNumberText;

		this.$board.appendChild( pieceEl );
	}

	/**
	 * Position the pieces shuffleds in the board
	 *
	 * @param {array} mix - The array shuffled, e.g. [ 0, 5, 2, ... ]
	 * @param {number} baseNumber - Number of Piece per row
	 * @param {number} pieceSize - The width/height os the piece in percentage
	 * @param {number} gutterSize - The gutter betwwe pieces in percentage
	 */
	alocatePieces ( mix, baseNumber, pieceSize, gutterSize ) {
		const piecesEls = document.querySelectorAll( '.piece' );

		for ( let i = 0; i < mix.length; i++ ) {
			const coordinateX = mix.indexOf( i ) % baseNumber;
			const coordinateY = Math.floor(mix.indexOf( i ) / baseNumber );

			piecesEls[ i ].style.left = `${coordinateX * ( pieceSize + gutterSize )}%`;
			piecesEls[ i ].style.top = `${coordinateY * ( pieceSize + gutterSize )}%`;

      piecesEls[ i ].setAttribute( 'data-current-x', coordinateX );
      piecesEls[ i ].setAttribute( 'data-current-y', coordinateY );
		}
	}

	/**
	 * Toggle the class that block the board.
	 *
	 * @param {boolean} boardState - Is board Locked?
	 */
	toggleBoardClassName ( boardState ) {
		this.$board.classList[ boardState ? 'add' : 'remove' ]( 'board-blocked' );
	}

	/**
	 * Execute the UI piece movement.
	 *
	 * @param {number} index - The index of the piece that will be moved.
	 */
	movePiece ( index ) {
    const el = document.querySelector( `[data-index="${index}"]` );
		const blankEl = this.$board.lastChild;

		const elStyleTop = el.style.top;
		const elStyleLeft = el.style.left;

		const elCurrentX = Number( el.getAttribute( 'data-current-x' ) );
		const elCurrentY = Number( el.getAttribute( 'data-current-y' ) );

		el.style.top = blankEl.style.top;
		el.style.left = blankEl.style.left;
		el.setAttribute( 'data-current-x', Number( blankEl.getAttribute( 'data-current-x' ) ) );
		el.setAttribute( 'data-current-y', Number( blankEl.getAttribute( 'data-current-y' ) ) );

		blankEl.style.top = elStyleTop;
		blankEl.style.left = elStyleLeft;
		blankEl.setAttribute( 'data-current-x', elCurrentX );
		blankEl.setAttribute( 'data-current-y', elCurrentY );
	}

	/**
	 * Show or hide modal depending on its state.
	 *
	 * @param {boolean} state - The modal state.
	 */
	toggleModal ( state ) {
		this.$modal.classList[ state ? 'add' : 'remove' ]( 'modal-is-open' );
	}
};
