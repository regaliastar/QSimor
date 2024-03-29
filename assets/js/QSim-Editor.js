
///////////////////
//               //
//  绘制整个线路  //
//               //
///////////////////

QSim.Editor = function (circuit, targetEl) {
  this.name = 'playground'
  const createDiv = function () {
    return document.createElement('div')
  }
  const circuitEl = targetEl instanceof HTMLElement ? targetEl : createDiv()
  circuitEl.classList.add('Q-circuit')
  if (typeof circuitEl.getAttribute('id') === 'string') {
    this.domId = circuitEl.getAttribute('id')
  } else {

    let domIdBase = this.name
        .replace(/^[^a-z]+|[^\w:.-]+/gi, '-'),
      domId = domIdBase,
      domIdAttempt = 1

    while (document.getElementById(domId) !== null) {

      domIdAttempt++
      domId = domIdBase + '-' + domIdAttempt
    }
    this.domId = domId
    circuitEl.setAttribute('id', this.domId)
  }
  circuitEl.circuit = circuit
  this.domElement = circuitEl

  const toolbarEl = createDiv()
  circuitEl.appendChild(toolbarEl)
  toolbarEl.classList.add('Q-circuit-toolbar')

  const lockToggle = createDiv()
  toolbarEl.appendChild(lockToggle)
  lockToggle.classList.add('Q-circuit-button', 'Q-circuit-toggle', 'Q-circuit-toggle-lock')
  lockToggle.setAttribute('title', 'Lock / unlock')
  lockToggle.innerText = '🔓'

  const controlButton = createDiv()
  toolbarEl.appendChild(controlButton)
  controlButton.classList.add('Q-circuit-button', 'Q-circuit-toggle', 'Q-circuit-toggle-control')
  controlButton.setAttribute('title', 'Create controlled operation')
  controlButton.setAttribute('Q-disabled', 'Q-disabled')
  controlButton.innerText = 'C'

  // const swapButton = createDiv()
  // toolbarEl.appendChild(swapButton)
  // swapButton.classList.add('Q-circuit-button', 'Q-circuit-toggle-swap')
  // swapButton.setAttribute('title', 'Create swap operation')
  // swapButton.setAttribute('Q-disabled', 'Q-disabled')
  // swapButton.innerText = 'Swap'

  const saveButton = createDiv()
  toolbarEl.appendChild(saveButton)
  saveButton.classList.add('Q-circuit-button', 'Q-circuit-toggle-save')
  saveButton.setAttribute('title', 'Save operation')
  saveButton.setAttribute('id', 'save-button')
  // saveButton.setAttribute( 'Q-disabled', 'Q-disabled' )
  saveButton.innerText = 'Save'


  //  Create a circuit board container
  //  so we can house a scrollable circuit board.

  const boardContainerEl = createDiv()
  circuitEl.appendChild(boardContainerEl)
  boardContainerEl.classList.add('Q-circuit-board-container')
  //boardContainerEl.addEventListener( 'touchstart', QSim.Editor.onPointerPress )
  boardContainerEl.addEventListener('mouseleave', function () {

    QSim.Editor.unhighlightAll(circuitEl)
  })

  const boardEl = createDiv()
  boardContainerEl.appendChild(boardEl)
  boardEl.classList.add('Q-circuit-board')

  const backgroundEl = createDiv()
  boardEl.appendChild(backgroundEl)
  backgroundEl.classList.add('Q-circuit-board-background')

  //  Create background highlight bars 
  //  for each row.

  for (let i = 0; i < circuit.bandwidth; i++) {
    const rowEl = createDiv()
    backgroundEl.appendChild(rowEl)
    rowEl.style.position = 'relative'
    rowEl.style.gridRowStart = i + 2
    rowEl.style.gridColumnStart = 1
    rowEl.style.gridColumnEnd = QSim.Editor.momentIndexToGridColumn(circuit.timewidth) + 1
    rowEl.setAttribute('register-index', i + 1)

    const wireEl = createDiv()
    rowEl.appendChild(wireEl)
    wireEl.classList.add('Q-circuit-register-wire')
  }

  //  Create background highlight bars 
  //  for each column.

  for (let i = 0; i < circuit.timewidth; i++) {
    const columnEl = createDiv()
    backgroundEl.appendChild(columnEl)
    columnEl.style.gridRowStart = 2
    columnEl.style.gridRowEnd = QSim.Editor.registerIndexToGridRow(circuit.bandwidth) + 1
    columnEl.style.gridColumnStart = i + 3
    columnEl.setAttribute('moment-index', i + 1)
  }


  //  Create the circuit board foreground
  //  for all interactive elements.

  const foregroundEl = createDiv()
  boardEl.appendChild(foregroundEl)
  foregroundEl.classList.add('Q-circuit-board-foreground')

  //  Add “Select All” toggle button to upper-left corner.

  const selectallEl = createDiv()
  foregroundEl.appendChild(selectallEl)
  selectallEl.classList.add('Q-circuit-header', 'Q-circuit-selectall')
  selectallEl.setAttribute('title', 'Select all')
  selectallEl.setAttribute('moment-index', '0')
  selectallEl.setAttribute('register-index', '0')
  selectallEl.innerHTML = '&searr;'


  //  Add register index symbols to left-hand column.

  for (let i = 0; i < circuit.bandwidth; i++) {
    const
      registerIndex = i + 1,
      registersymbolEl = createDiv()

    foregroundEl.appendChild(registersymbolEl)
    registersymbolEl.classList.add('Q-circuit-header', 'Q-circuit-register-label')
    registersymbolEl.setAttribute('title', 'Register ' + registerIndex + ' of ' + circuit.bandwidth)
    registersymbolEl.setAttribute('register-index', registerIndex)
    registersymbolEl.style.gridRowStart = QSim.Editor.registerIndexToGridRow(registerIndex)
    registersymbolEl.innerText = registerIndex
  }


  //  Add “Add register” button.

  const addRegisterEl = createDiv()
  foregroundEl.appendChild(addRegisterEl)
  addRegisterEl.classList.add('Q-circuit-header', 'Q-circuit-register-add')
  addRegisterEl.setAttribute('title', 'Add register')
  addRegisterEl.style.gridRowStart = QSim.Editor.registerIndexToGridRow(circuit.bandwidth + 1)
  addRegisterEl.innerText = '+'


  //  Add moment index symbols to top row.

  for (let i = 0; i < circuit.timewidth; i++) {
    const
      momentIndex = i + 1,
      momentsymbolEl = createDiv()

    foregroundEl.appendChild(momentsymbolEl)
    momentsymbolEl.classList.add('Q-circuit-header', 'Q-circuit-moment-label')
    momentsymbolEl.setAttribute('title', 'Moment ' + momentIndex + ' of ' + circuit.timewidth)
    momentsymbolEl.setAttribute('moment-index', momentIndex)
    momentsymbolEl.style.gridColumnStart = QSim.Editor.momentIndexToGridColumn(momentIndex)
    momentsymbolEl.innerText = momentIndex
  }


  //  Add “Add moment” button.

  const addMomentEl = createDiv()
  foregroundEl.appendChild(addMomentEl)
  addMomentEl.classList.add('Q-circuit-header', 'Q-circuit-moment-add')
  addMomentEl.setAttribute('title', 'Add moment')
  addMomentEl.style.gridColumnStart = QSim.Editor.momentIndexToGridColumn(circuit.timewidth + 1)
  addMomentEl.innerText = '+'

  //  Add input values.

  circuit.qubits.forEach(function (qubit, i) {
    const
      rowIndex = i + 1,
      inputEl = createDiv()

    inputEl.classList.add('Q-circuit-header', 'Q-circuit-input')
    inputEl.setAttribute('title', `Qubit #${rowIndex} starting value`)
    inputEl.setAttribute('register-index', rowIndex)
    inputEl.style.gridRowStart = QSim.Editor.registerIndexToGridRow(rowIndex)
    // inputEl.innerText = qubit.beta.toText()
    inputEl.innerText = 'q' + i
    foregroundEl.appendChild(inputEl)
  })

  // 对量子门进行绘制
  // 测试 定义量子门
  // {
  // 	gate: {
  // 		symbol: 'H',
  // 		nameCss: 'hadamard',
  // 		name: 'Hadamard'
  // 	},
  // 	isControlled: false,
  // 	momentIndex: 1,
  // 	registerIndices: [1],
  // }
  //
  ///////////////////
  //               //
  //   绘制量子门   //
  //               //
  ///////////////////
  //	QSim.Editor.set( this.domElement, event.detail.operation )

  circuit.gates.forEach(gate => {
    QSim.Editor.set(circuitEl, gate)
  })

  //  Add event listeners.

  circuitEl.addEventListener('mousedown', QSim.Editor.onPointerPress)
  circuitEl.addEventListener('touchstart', QSim.Editor.onPointerPress)
  window.addEventListener(

    'QSim.Circuit.set$',
    QSim.Editor.prototype.onExternalSet.bind(this)
  )
  window.addEventListener(

    'QSim.Circuit.clear$',
    QSim.Editor.prototype.onExternalClear.bind(this)
  )


}


Object.assign(QSim.Editor, {
  index: 0,
  dragEl: null,
  gridColumnToMomentIndex: function (gridColumn) { return +gridColumn - 2 },
  momentIndexToGridColumn: function (momentIndex) { return momentIndex + 2 },
  gridRowToRegisterIndex: function (gridRow) { return +gridRow - 1 },
  registerIndexToGridRow: function (registerIndex) { return registerIndex + 1 },
  gridSize: 4,//  CSS: grid-auto-columns = grid-auto-rows = 4rem.
  pointToGrid: function (p) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return 1 + Math.floor(p / (rem * QSim.Editor.gridSize))
  },
  gridToPoint: function (g) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return rem * QSim.Editor.gridSize * (g - 1)
  },
  getInteractionCoordinates: function (event, pageOrClient) {
    if (typeof pageOrClient !== 'string') pageOrClient = 'client'//page
    if (event.changedTouches &&
			event.changedTouches.length) return {

      x: event.changedTouches[0][pageOrClient + 'X'],
      y: event.changedTouches[0][pageOrClient + 'Y']
    }
    return {
      x: event[pageOrClient + 'X'],
      y: event[pageOrClient + 'Y']
    }
  },
  createPalette: function (targetEl) {
    if (typeof targetEl === 'string') targetEl = document.getElementById(targetEl)

    const
      paletteEl = targetEl instanceof HTMLElement ? targetEl : document.createElement('div'),
      randomRangeAndSign = function (min, max) {
        const r = min + Math.random() * (max - min)
        return Math.floor(Math.random() * 2) ? r : -r
      }

    paletteEl.classList.add('Q-circuit-palette')

    '*,H,X,Y,Z,P,T,S,V,V_H,SWAP,R'
      .split(',')
      .forEach(function (symbol) {
        const gate = QSim.Gate.findBySymbol(symbol)

        const operationEl = document.createElement('div')
        paletteEl.appendChild(operationEl)
        operationEl.classList.add('Q-circuit-operation')
        operationEl.classList.add('Q-circuit-operation-' + gate.nameCss)
        operationEl.setAttribute('gate-symbol', symbol)
        operationEl.setAttribute('title', gate.name)

        const tileEl = document.createElement('div')
        operationEl.appendChild(tileEl)
        tileEl.classList.add('Q-circuit-operation-tile')
        if (symbol !== '*') tileEl.innerText = symbol

        ;['before', 'after'].forEach(function (layer) {

          tileEl.style.setProperty('--Q-' + layer + '-rotation', randomRangeAndSign(0.5, 4) + 'deg')
          tileEl.style.setProperty('--Q-' + layer + '-x', randomRangeAndSign(1, 4) + 'px')
          tileEl.style.setProperty('--Q-' + layer + '-y', randomRangeAndSign(1, 3) + 'px')
        })
        if (symbol === 'V_H') tileEl.innerText = 'V+'
        if (symbol === 'SWAP') tileEl.innerText = 'SP'
      })

    paletteEl.addEventListener('mousedown', QSim.Editor.onPointerPress)
    paletteEl.addEventListener('touchstart', QSim.Editor.onPointerPress)
    return paletteEl
  },

})


/////////////////////////
//                     //
//   Operation Set     //
//                     //
/////////////////////////


QSim.Editor.prototype.onExternalSet = function (event) {
  QSim.Editor.set(this.domElement, event.detail.operation)
}
// 尽量压缩门的展示
QSim.Editor.set = function (circuitEl, operation) {

  // QSim.log('set', operation)
  const
    backgroundEl = circuitEl.querySelector('.Q-circuit-board-background'),
    foregroundEl = circuitEl.querySelector('.Q-circuit-board-foreground');

  operation.registerIndices.forEach(function (registerIndex, i) {
    const operationEl = document.createElement('div')
    foregroundEl.appendChild(operationEl)
    if (!operation.gate) return
    operationEl.classList.add('Q-circuit-operation', 'Q-circuit-operation-' + operation.gate.nameCss)
    // operationEl.setAttribute( 'operation-index', operationIndex )		
    operationEl.setAttribute('gate-symbol', operation.gate.symbol)
    operationEl.setAttribute('gate-index', operation.gate.index)//  Used as an application-wide unique ID!
    operationEl.setAttribute('moment-index', operation.momentIndex)
    operationEl.setAttribute('register-index', registerIndex)
    operationEl.setAttribute('register-array-index', i)//  Where within the registerIndices array is this operations fragment located?
    operationEl.setAttribute('is-controlled', operation.isControlled)
    operationEl.setAttribute('title', operation.gate.name)
    operationEl.style.gridColumnStart = QSim.Editor.momentIndexToGridColumn(operation.momentIndex)
    operationEl.style.gridRowStart = QSim.Editor.registerIndexToGridRow(registerIndex)

    const tileEl = document.createElement('div')
    operationEl.appendChild(tileEl)
    tileEl.classList.add('Q-circuit-operation-tile')
    if (operation.gate.symbol !== '*') tileEl.innerText = operation.gate.symbol
    if (operation.gate.symbol === 'V_H') tileEl.innerText = 'V+'
		

    //  Add operation link wires
    //  for multi-qubit operations.

    if (operation.registerIndices.length > 1) {
      operationEl.setAttribute('register-indices', operation.registerIndices)
      operationEl.setAttribute('register-indices-index', i)
      operationEl.setAttribute(

        'sibling-indices',
        operation.registerIndices
          .filter(function (siblingRegisterIndex) {

            return registerIndex !== siblingRegisterIndex
          })
      )
      operation.registerIndices.forEach(function (registerIndex, i) {

        if (i < operation.registerIndices.length - 1) {
          const
            siblingRegisterIndex = operation.registerIndices[i + 1],
            registerDelta = Math.abs(siblingRegisterIndex - registerIndex),
            start = Math.min(registerIndex, siblingRegisterIndex),
            end = Math.max(registerIndex, siblingRegisterIndex),
            containerEl = document.createElement('div'),
            linkEl = document.createElement('div')

          backgroundEl.appendChild(containerEl)
          containerEl.setAttribute('moment-index', operation.momentIndex)
          containerEl.setAttribute('register-index', registerIndex)
          containerEl.classList.add('Q-circuit-operation-link-container')
          containerEl.style.gridRowStart = QSim.Editor.registerIndexToGridRow(start)
          containerEl.style.gridRowEnd = QSim.Editor.registerIndexToGridRow(end + 1)
          containerEl.style.gridColumn = QSim.Editor.momentIndexToGridColumn(operation.momentIndex)

          containerEl.appendChild(linkEl)
          linkEl.classList.add('Q-circuit-operation-link')
          if (registerDelta > 1) linkEl.classList.add('Q-circuit-operation-link-curved')
        }
      })
      if (operation.isControlled && i === 0) {
        operationEl.classList.add('Q-circuit-operation-control')
        operationEl.setAttribute('title', 'Control')
        tileEl.innerText = ''
      }
      else operationEl.classList.add('Q-circuit-operation-target')
    }
  })
}


/////////////////////////
//                     //
//   Operation CLEAR   //
//                     //
/////////////////////////


QSim.Editor.prototype.onExternalClear = function (event) {
  QSim.Editor.clear(this.domElement, {
    momentIndex: event.detail.momentIndex,
    registerIndices: event.detail.registerIndices
  })
}
QSim.Editor.clear = function (circuitEl, operation) {
  const momentIndex = operation.momentIndex
  operation.registerIndices.forEach(function (registerIndex) {

    Array
      .from(circuitEl.querySelectorAll(

        `[moment-index="${momentIndex}"]` +
				`[register-index="${registerIndex}"]`

      ))
      .forEach(function (op) {

        op.parentNode.removeChild(op)
      })
  })
}


QSim.Editor.unhighlightAll = function (circuitEl) {
  Array.from(circuitEl.querySelectorAll(
    '.Q-circuit-board-background > div,' +
		'.Q-circuit-board-foreground > div'
  ))
    .forEach(function (el) {
      el.classList.remove('Q-circuit-cell-highlighted')
    })
}


//////////////////////
//                  //
//   Pointer MOVE   //
//                  //
//////////////////////


QSim.Editor.onPointerMove = function (event) {

  // console.log('onPointerMove')
  //  We need our cursor coordinates straight away.
  //  We’ll use that both for dragging (immediately below)
  //  and for hover highlighting (further below).
  //  Let’s also hold on to a list of all DOM elements
  //  that contain this X, Y point
  //  and also see if one of those is a circuit board container.

  const
    { x, y } = QSim.Editor.getInteractionCoordinates(event),
    foundEls = document.elementsFromPoint(x, y),
    boardContainerEl = foundEls.find(function (el) {

      return el.classList.contains('Q-circuit-board-container')
    })


  //  Are we in the middle of a circuit clipboard drag?
  //  If so we need to move that thing!

  if (QSim.Editor.dragEl !== null) {


    //  ex. Don’t scroll on touch devices!

    event.preventDefault()


    //  This was a very useful resource
    //  for a reality check on DOM coordinates:
    //  https://javascript.info/coordinates

    QSim.Editor.dragEl.style.left = (x + window.pageXOffset + QSim.Editor.dragEl.offsetX) + 'px'
    QSim.Editor.dragEl.style.top = (y + window.pageYOffset + QSim.Editor.dragEl.offsetY) + 'px'

    if (!boardContainerEl && QSim.Editor.dragEl.circuitEl) QSim.Editor.dragEl.classList.add('Q-circuit-clipboard-danger')
    else QSim.Editor.dragEl.classList.remove('Q-circuit-clipboard-danger')
  }


  //  If we’re not over a circuit board container
  //  then there’s no highlighting work to do
  //  so let’s bail now.
  if (!boardContainerEl) return


  //  Now we know we have a circuit board
  //  so we must have a circuit
  //  and if that’s locked then highlighting changes allowed!

  const circuitEl = boardContainerEl.closest('.Q-circuit')
  if (circuitEl.classList.contains('Q-circuit-locked')) return


  //  Ok, we’ve found a circuit board.
  //  First, un-highlight everything.

  Array.from(boardContainerEl.querySelectorAll(`

		.Q-circuit-board-background > div, 
		.Q-circuit-board-foreground > div
	
	`)).forEach(function (el) {

    el.classList.remove('Q-circuit-cell-highlighted')
  })


  //  Let’s prioritize any element that is “sticky”
  //  which means it can appear OVER another grid cell.

  const
    cellEl = foundEls.find(function (el) {

      const style = window.getComputedStyle(el)
      return (

        style.position === 'sticky' && (

          el.getAttribute('moment-index') !== null ||
					el.getAttribute('register-index') !== null
        )
      )
    }),
    highlightByQuery = function (query) {

      Array.from(boardContainerEl.querySelectorAll(query))
        .forEach(function (el) {

          el.classList.add('Q-circuit-cell-highlighted')
        })
    }


  //  If we’ve found one of these “sticky” cells
  //  let’s use its moment and/or register data
  //  to highlight moments or registers (or all).

  if (cellEl) {

    const
      momentIndex = cellEl.getAttribute('moment-index'),
      registerIndex = cellEl.getAttribute('register-index')

    if (momentIndex === null) {

      highlightByQuery(`div[register-index="${registerIndex}"]`)
      return
    }
    if (registerIndex === null) {

      highlightByQuery(`div[moment-index="${momentIndex}"]`)
      return
    }
    highlightByQuery(`

			.Q-circuit-board-background > div[moment-index],
			.Q-circuit-board-foreground > .Q-circuit-operation

		`)
    return
  }


  //  Ok, we know we’re hovering over the circuit board
  //  but we’re not on a “sticky” cell.
  //  We might be over an operation, but we might not.
  //  No matter -- we’ll infer the moment and register indices
  //  from the cursor position.

  const
    boardElBounds = boardContainerEl.getBoundingClientRect(),
    xLocal = x - boardElBounds.left + boardContainerEl.scrollLeft + 1,
    yLocal = y - boardElBounds.top + boardContainerEl.scrollTop + 1,
    columnIndex = QSim.Editor.pointToGrid(xLocal),
    rowIndex = QSim.Editor.pointToGrid(yLocal),
    momentIndex = QSim.Editor.gridColumnToMomentIndex(columnIndex),
    registerIndex = QSim.Editor.gridRowToRegisterIndex(rowIndex)


  //  If this hover is “out of bounds”
  //  ie. on the same row or column as an “Add register” or “Add moment” button
  //  then let’s not highlight anything.

  if (momentIndex > circuitEl.circuit.timewidth ||
		registerIndex > circuitEl.circuit.bandwidth) return


  //  If we’re at 0, 0 or below that either means
  //  we’re over the “Select all” button (already taken care of above)
  //  or over the lock toggle button.
  //  Either way, it’s time to bail.

  if (momentIndex < 1 || registerIndex < 1) return


  //  If we’ve made it this far that means 
  //  we have valid moment and register indices.
  //  Highlight them!

  highlightByQuery(`

		div[moment-index="${momentIndex}"],
		div[register-index="${registerIndex}"]
	`)
  return
}


///////////////////////
//                   //
//   Pointer PRESS   //
//                   //
///////////////////////


QSim.Editor.onPointerPress = function (event) {

  // console.log('onPointerPress')
  //  This is just a safety net
  //  in case something terrible has ocurred.
  // (ex. Did the user click and then their mouse ran
  //  outside the window but browser didn’t catch it?)

  if (QSim.Editor.dragEl !== null) {

    QSim.Editor.onPointerRelease(event)
    return
  }


  const
    targetEl = event.target,
    circuitEl = targetEl.closest('.Q-circuit'),
    paletteEl = targetEl.closest('.Q-circuit-palette')

  // console.log(paletteEl)
  //  If we can’t find a circuit that’s a really bad sign
  //  considering this event should be fired when a circuit
  //  is clicked on. So... bail!

  if (!circuitEl && !paletteEl) return


  //  This is a bit of a gamble.
  //  There’s a possibility we’re not going to drag anything,
  //  but we’ll prep these variables here anyway
  //  because both branches of if( circuitEl ) and if( paletteEl )
  //  below will have access to this scope.

  const dragEl = document.createElement('div')
  dragEl.classList.add('Q-circuit-clipboard')
  const { x, y } = QSim.Editor.getInteractionCoordinates(event)


  //  Are we dealing with a circuit interface?
  //  ie. NOT a palette interface.

  if (circuitEl) {


    //  Shall we toggle the circuit lock?

    const
      circuitIsLocked = circuitEl.classList.contains('Q-circuit-locked'),
      lockEl = targetEl.closest('.Q-circuit-toggle-lock')

    if (lockEl) {

      // const toolbarEl = Array.from( circuitEl.querySelectorAll( '.Q-circuit-button' ))
      if (circuitIsLocked) {

        circuitEl.classList.remove('Q-circuit-locked')
        lockEl.innerText = '🔓'
      }
      else {

        circuitEl.classList.add('Q-circuit-locked')
        lockEl.innerText = '🔒'
        QSim.Editor.unhighlightAll(circuitEl)
      }


      //  We’ve toggled the circuit lock button
      //  so we should prevent further propagation
      //  before proceeding further.
      //  That includes running all this code again
      //  if it was originally fired by a mouse event
      //  and about to be fired by a touch event!

      event.preventDefault()
      event.stopPropagation()
      return
    }


    //  If our circuit is already “locked”
    //  then there’s nothing more to do here.

    if (circuitIsLocked) {

      QSim.warn(`User attempted to interact with a circuit editor but it was locked.`)
      return
    }


    const
      cellEl = targetEl.closest(`

			.Q-circuit-board-foreground > div,
			.Q-circuit-palette > div
		`),
      undoEl = targetEl.closest('.Q-circuit-button-undo'),
      redoEl = targetEl.closest('.Q-circuit-button-redo'),
      controlEl = targetEl.closest('.Q-circuit-toggle-control'),
      swapEl = targetEl.closest('.Q-circuit-toggle-swap'),
      addMomentEl = targetEl.closest('.Q-circuit-moment-add'),
      addRegisterEl = targetEl.closest('.Q-circuit-register-add')

    if (!cellEl &&
			!undoEl &&
			!redoEl &&
			!controlEl &&
			!swapEl &&
			!addMomentEl &&
			!addRegisterEl) return

    // console.log('cellEl',cellEl)
    //  By this point we know that the circuit is unlocked
    //  and that we’ll activate a button / drag event / etc.
    //  So we need to hault futher event propagation
    //  including running this exact code again if this was
    //  fired by a touch event and about to again by mouse.
    //  This may SEEM redundant because we did this above
    //  within the lock-toggle button code
    //  but we needed to NOT stop propagation if the circuit
    //  was already locked -- for scrolling and such.

    event.preventDefault()
    event.stopPropagation()


    if (controlEl) QSim.Editor.createControl(circuitEl)
    if (swapEl) QSim.Editor.createSwap(circuitEl)
    if (addMomentEl) console.log('→ Add moment')
    if (addRegisterEl) console.log('→ Add register')


    //  We’re done dealing with external buttons.
    //  So if we can’t find a circuit CELL
    //  then there’s nothing more to do here.

    if (!cellEl) return


    //  Once we know what cell we’ve pressed on
    //  we can get the momentIndex and registerIndex
    //  from its pre-defined attributes.
    //  NOTE that we are getting CSS grid column and row
    //  from our own conversion function and NOT from
    //  asking its styles. Why? Because browsers convert
    //  grid commands to a shorthand less easily parsable
    //  and therefore makes our code and reasoning 
    //  more prone to quirks / errors. Trust me!

    const
      momentIndex = +cellEl.getAttribute('moment-index'),
      registerIndex = +cellEl.getAttribute('register-index'),
      columnIndex = QSim.Editor.momentIndexToGridColumn(momentIndex),
      rowIndex = QSim.Editor.registerIndexToGridRow(registerIndex)


    //  Looks like our circuit is NOT locked
    //  and we have a valid circuit CELL
    //  so let’s find everything else we could need.

    const
      selectallEl = targetEl.closest('.Q-circuit-selectall'),
      registersymbolEl = targetEl.closest('.Q-circuit-register-label'),
      momentsymbolEl = targetEl.closest('.Q-circuit-moment-label'),
      inputEl = targetEl.closest('.Q-circuit-input'),
      operationEl = targetEl.closest('.Q-circuit-operation')


    //  +++++++++++++++
    //  We’ll have to add some input editing capability later...
    //  Of course you can already do this in code!
    //  For now though most quantum code assumes all qubits
    //  begin with a value of zero so this is mostly ok ;)

    if (inputEl) {

      console.log('→ Edit input Qubit value at', registerIndex)
      return
    }


    //  Let’s inspect a group of items via a CSS query.
    //  If any of them are NOT “selected” (highlighted)
    //  then select them all.
    //  But if ALL of them are already selected
    //  then UNSELECT them all.

    function toggleSelection(query) {
      const
        operations = Array.from(circuitEl.querySelectorAll(query)),
        operationsSelectedLength = operations.reduce(function (sum, element) {

          sum += +element.classList.contains('Q-circuit-cell-selected')
          return sum

        }, 0)

      if (operationsSelectedLength === operations.length) {

        operations.forEach(function (el) {

          el.classList.remove('Q-circuit-cell-selected')
        })
      }
      else {

        operations.forEach(function (el) {

          el.classList.add('Q-circuit-cell-selected')
        })
      }
      QSim.Editor.onSelectionChanged(circuitEl)
    }


    //  Clicking on the “selectAll” button
    //  or any of the Moment symbols / Register symbols
    //  causes a selection toggle.
    //  In the future we may want to add
    //  dragging of entire Moment columns / Register rows
    //  to splice them out / insert them elsewhere
    //  when a user clicks and drags them.

    if (selectallEl) {

      toggleSelection('.Q-circuit-operation')
      return
    }
    if (momentsymbolEl) {

      toggleSelection(`.Q-circuit-operation[moment-index="${momentIndex}"]`)
      return
    }
    if (registersymbolEl) {

      toggleSelection(`.Q-circuit-operation[register-index="${registerIndex}"]`)
      return
    }


    //  Right here we can made a big decision:
    //  If you’re not pressing on an operation
    //  then GO HOME.

    if (!operationEl) return


    //  Ok now we know we are dealing with an operation.
    //  This preserved selection state information
    //  will be useful for when onPointerRelease is fired.

    if (operationEl.classList.contains('Q-circuit-cell-selected')) {

      operationEl.wasSelected = true
    }
    else operationEl.wasSelected = false


    //  And now we can proceed knowing that 
    //  we need to select this operation
    //  and possibly drag it
    //  as well as any other selected operations.

    operationEl.classList.add('Q-circuit-cell-selected')
    const selectedOperations = Array.from(circuitEl.querySelectorAll('.Q-circuit-cell-selected'))
    dragEl.circuitEl = circuitEl
    dragEl.originEl = circuitEl.querySelector('.Q-circuit-board-foreground')


    //  These are the default values; 
    //  will be used if we’re only dragging one operation around.
    //  But if dragging more than one operation
    //  and we’re dragging the clipboard by an operation
    //  that is NOT in the upper-left corner of the clipboard
    //  then we need to know what the offset is.
    // (Will be calculated below.)

    dragEl.columnIndexOffset = 1
    dragEl.rowIndexOffset = 1


    //  Now collect all of the selected operations,
    //  rip them from the circuit board’s foreground layer
    //  and place them on the clipboard.

    let
      columnIndexMin = Infinity,
      rowIndexMin = Infinity

    selectedOperations.forEach(function (el) {


      //  WORTH REPEATING:
      //  Once we know what cell we’ve pressed on
      //  we can get the momentIndex and registerIndex
      //  from its pre-defined attributes.
      //  NOTE that we are getting CSS grid column and row
      //  from our own conversion function and NOT from
      //  asking its styles. Why? Because browsers convert
      //  grid commands to a shorthand less easily parsable
      //  and therefore makes our code and reasoning 
      //  more prone to quirks / errors. Trust me!

      const
        momentIndex = +el.getAttribute('moment-index'),
        registerIndex = +el.getAttribute('register-index'),
        columnIndex = QSim.Editor.momentIndexToGridColumn(momentIndex),
        rowIndex = QSim.Editor.registerIndexToGridRow(registerIndex)

      columnIndexMin = Math.min(columnIndexMin, columnIndex)
      rowIndexMin = Math.min(rowIndexMin, rowIndex)
      el.classList.remove('Q-circuit-cell-selected')
      el.origin = { momentIndex, registerIndex, columnIndex, rowIndex }
      dragEl.appendChild(el)
    })
    selectedOperations.forEach(function (el) {

      const
        columnIndexForClipboard = 1 + el.origin.columnIndex - columnIndexMin,
        rowIndexForClipboard = 1 + el.origin.rowIndex - rowIndexMin

      el.style.gridColumn = columnIndexForClipboard
      el.style.gridRow = rowIndexForClipboard


      //  If this operation element is the one we grabbed
      // (mostly relevant if we’re moving multiple operations at once)
      //  we need to know what the “offset” so everything can be
      //  placed correctly relative to this drag-and-dropped item.

      if (el.origin.columnIndex === columnIndex &&
				el.origin.rowIndex === rowIndex) {

        dragEl.columnIndexOffset = columnIndexForClipboard
        dragEl.rowIndexOffset = rowIndexForClipboard
      }
    })


    //  We need an XY offset that describes the difference
    //  between the mouse / finger press position
    //  and the clipboard’s intended upper-left position.
    //  To do that we need to know the press position (obviously!),
    //  the upper-left bounds of the circuit board’s foreground,
    //  and the intended upper-left bound of clipboard.

    const
      boardEl = circuitEl.querySelector('.Q-circuit-board-foreground'),
      bounds = boardEl.getBoundingClientRect(),
      minX = QSim.Editor.gridToPoint(columnIndexMin),
      minY = QSim.Editor.gridToPoint(rowIndexMin)

    dragEl.offsetX = bounds.left + minX - x
    dragEl.offsetY = bounds.top + minY - y
    dragEl.momentIndex = momentIndex
    dragEl.registerIndex = registerIndex
  }
  else if (paletteEl) {

    const operationEl = targetEl.closest('.Q-circuit-operation')

    if (!operationEl) return

    const
      bounds = operationEl.getBoundingClientRect(),
      { x, y } = QSim.Editor.getInteractionCoordinates(event)

    dragEl.appendChild(operationEl.cloneNode(true))
    dragEl.originEl = paletteEl
    dragEl.offsetX = bounds.left - x
    dragEl.offsetY = bounds.top - y
  }
  dragEl.timestamp = Date.now()

  //  Append the clipboard to the document,
  //  establish a global reference to it,
  //  and trigger a draw of it in the correct spot.

  document.body.appendChild(dragEl)
  QSim.Editor.dragEl = dragEl
  QSim.Editor.onPointerMove(event)
}


/////////////////////////
//                     //
//   Pointer RELEASE   //
//                     //
/////////////////////////


QSim.Editor.onPointerRelease = function (event) {

  // console.log('onPointerRelease')
  //  If there’s no dragEl then bail immediately.

  if (QSim.Editor.dragEl === null) return


  //  Looks like we’re moving forward with this plan,
  //  so we’ll take control of the input now.

  event.preventDefault()
  event.stopPropagation()


  //  We can’t get the drop target from the event.
  //  Think about it: What was under the mouse / finger
  //  when this drop event was fired? THE CLIPBOARD !
  //  So instead we need to peek at what elements are
  //  under the mouse / finger, skipping element [0]
  //  because that will be the clipboard.

  const
    { x, y } = QSim.Editor.getInteractionCoordinates(event),
    boardContainerEl = document.elementsFromPoint(x, y)
      .find(function (el) {

        return el.classList.contains('Q-circuit-board-container')
      }),
    returnToOrigin = function () {


      //  We can only do a “true” return to origin
      //  if we were dragging from a circuit.
      //  If we were dragging from a palette
      //  we can just stop dragging.

      if (QSim.Editor.dragEl.circuitEl) {

        Array.from(QSim.Editor.dragEl.children).forEach(function (el) {

          QSim.Editor.dragEl.originEl.appendChild(el)
          el.style.gridColumn = el.origin.columnIndex
          el.style.gridRow = el.origin.rowIndex
          if (el.wasSelected === true) el.classList.remove('Q-circuit-cell-selected')
          else el.classList.add('Q-circuit-cell-selected')
        })
        QSim.Editor.onSelectionChanged(QSim.Editor.dragEl.circuitEl)
      }
      document.body.removeChild(QSim.Editor.dragEl)
      QSim.Editor.dragEl = null
    }


  //  If we have not dragged on to a circuit board
  //  then we’re throwing away this operation.


  if (!boardContainerEl) {

    if (QSim.Editor.dragEl.circuitEl) {

      const originCircuitEl = QSim.Editor.dragEl.circuitEl
      const originCircuit = originCircuitEl.circuit
      Array
        .from(QSim.Editor.dragEl.children)
        .forEach(function (child) {

          originCircuit.clear$(

            child.origin.momentIndex,
            child.origin.registerIndex
          )

          // QSim.log(originCircuit.gates)
          // originCircuit.gates.forEach(operation => {
          // 	QSim.Editor.set( circuitEl, operation )
          // })

        })
      QSim.Editor.onSelectionChanged(originCircuitEl)
      QSim.Editor.onCircuitChanged(originCircuitEl)
    }


    //  TIME TO DIE.
    //  Let’s keep a private reference to 
    //  the current clipboard.

    let clipboardToDestroy = QSim.Editor.dragEl

    //  Now we can remove our dragging reference.

    QSim.Editor.dragEl = null

    //  Add our CSS animation routine
    //  which will run for 1 second.
    //  If we were SUPER AWESOME
    //  we would have also calculated drag momentum
    //  and we’d let this glide away!

    clipboardToDestroy.classList.add('Q-circuit-clipboard-destroy')


    //  And around the time that animation is completing
    //  we can go ahead and remove our clipboard from the DOM
    //  and kill the reference.

    setTimeout(function () {

      document.body.removeChild(clipboardToDestroy)
      clipboardToDestroy = null

    }, 500)

    return
  }


  //  If we couldn’t determine a circuitEl
  //  from the drop target,
  //  or if there is a target circuit but it’s locked,
  //  then we need to return these dragged items
  //  to their original circuit.

  const circuitEl = boardContainerEl.closest('.Q-circuit')
  if (circuitEl.classList.contains('Q-circuit-locked')) {

    returnToOrigin()
    return
  }


  //  Time to get serious.
  //  Where exactly are we dropping on to this circuit??

  const
    circuit = circuitEl.circuit,
    bounds = boardContainerEl.getBoundingClientRect(),
    droppedAtX = x - bounds.left + boardContainerEl.scrollLeft,
    droppedAtY = y - bounds.top + boardContainerEl.scrollTop,
    droppedAtMomentIndex = QSim.Editor.gridColumnToMomentIndex(

      QSim.Editor.pointToGrid(droppedAtX)
    ),
    droppedAtRegisterIndex = QSim.Editor.gridRowToRegisterIndex(

      QSim.Editor.pointToGrid(droppedAtY)
    );


  //  If this is a self-drop
  //  we can also just return to origin and bail.

  if (QSim.Editor.dragEl.circuitEl === circuitEl &&
		QSim.Editor.dragEl.momentIndex === droppedAtMomentIndex &&
		QSim.Editor.dragEl.registerIndex === droppedAtRegisterIndex) {

    returnToOrigin()
    return
  }


  //  Is this a valid drop target within this circuit?

  if (
    droppedAtMomentIndex < 1 ||
		droppedAtMomentIndex > circuit.timewidth ||
		droppedAtRegisterIndex < 1 ||
		droppedAtRegisterIndex > circuit.bandwidth
  ) {

    returnToOrigin()
    return
  }


  //  Finally! Work is about to be done!
  //  All we need to do is tell the circuit itself
  //  where we need to place these dragged items.
  //  It will do all the validation for us
  //  and then fire events that will place new elements
  //  where they need to go!

  const
    draggedOperations = Array.from(QSim.Editor.dragEl.children),
    draggedMomentDelta = droppedAtMomentIndex - QSim.Editor.dragEl.momentIndex,
    draggedRegisterDelta = droppedAtRegisterIndex - QSim.Editor.dragEl.registerIndex,
    setCommands = []


  //  Whatever the next action is that we perform on the circuit,
  //  this was user-initiated via the graphic user interface (GUI).

  // circuit.history.createEntry$()

  //  Now let’s work our way through each of the dragged operations.
  //  If some of these are components of a multi-register operation
  //  the sibling components will get spliced out of the array
  //  to avoid processing any specific operation more than once.

  draggedOperations.forEach(function (childEl, i) {

    let
      momentIndexTarget = droppedAtMomentIndex,
      registerIndexTarget = droppedAtRegisterIndex

    if (QSim.Editor.dragEl.circuitEl) {

      momentIndexTarget += childEl.origin.momentIndex - QSim.Editor.dragEl.momentIndex
      registerIndexTarget += childEl.origin.registerIndex - QSim.Editor.dragEl.registerIndex
    }


    //  Is this a multi-register operation?
    //  If so, this is also a from-circuit drop
    //  rather than a from-palette drop.

    const registerIndicesString = childEl.getAttribute('register-indices')
    if (registerIndicesString) {


      //  What are ALL of the registerIndices
      //  associated with this multi-register operation?
      // (We may use them later as a checklist.)

      const
        registerIndices = registerIndicesString
          .split(',')
          .map(function (str) { return +str }),


        //  Lets look for ALL of the sibling components of this operation.
        //  Later we’ll check and see if the length of this array
        //  is equal to the total number of components for this operation.
        //  If they’re equal then we know we’re dragging the WHOLE thing.
        //  Otherwise we need to determine if it needs to break apart
        //  and if so, what that nature of that break might be.

        foundComponents = Array.from(

          QSim.Editor.dragEl.querySelectorAll(

            `[moment-index="${childEl.origin.momentIndex}"]` +
						`[register-indices="${registerIndicesString}"]`
          )
        )
          .sort(function (a, b) {

            const
              aRegisterIndicesIndex = +a.getAttribute('register-indices-index'),
              bRegisterIndicesIndex = +b.getAttribute('register-indices-index')

            return aRegisterIndicesIndex - bRegisterIndicesIndex
          }),
        allComponents = Array.from(QSim.Editor.dragEl.circuitEl.querySelectorAll(

          `[moment-index="${childEl.origin.momentIndex}"]` +
					`[register-indices="${registerIndicesString}"]`
        )),
        remainingComponents = allComponents.filter(function (componentEl) {

          return !foundComponents.includes(componentEl)
        }),


        //  We can’t pick the gate symbol 
        //  off the 0th gate in the register indices array
        //  because that will be an identity / control / null gate.
        //  We need to look at slot 1.

        component1 = QSim.Editor.dragEl.querySelector(

          `[moment-index="${childEl.origin.momentIndex}"]` +
					`[register-index="${registerIndices[1]}"]`
        ),
        gatesymbol = component1 ?
          component1.getAttribute('gate-symbol') :
          childEl.getAttribute('gate-symbol')


      //  We needed to grab the above gatesymbol information
      //  before we sent any clear$ commands
      //  which would in turn delete those componentEls.
      //  We’ve just completed that, 
      //  so now’s the time to send a clear$ command
      //  before we do any set$ commands.

      draggedOperations.forEach(function (childEl) {

        QSim.Editor.dragEl.circuitEl.circuit.clear$(

          childEl.origin.momentIndex,
          childEl.origin.registerIndex
        )
      })


      //  FULL MULTI-REGISTER DRAG (TO ANY POSITION ON ANY CIRCUIT).
      //  If we are dragging all of the components
      //  of a multi-register operation
      //  then we are good to go.

      if (registerIndices.length === foundComponents.length) {

        //circuit.set$( 
        setCommands.push([

          gatesymbol,
          momentIndexTarget,


          //  We need to remap EACH register index here
          //  according to the drop position.
          //  Let’s let set$ do all the validation on this.

          registerIndices.map(function (registerIndex) {

            const siblingDelta = registerIndex - childEl.origin.registerIndex
            registerIndexTarget = droppedAtRegisterIndex
            if (QSim.Editor.dragEl.circuitEl) {

              registerIndexTarget += childEl.origin.registerIndex - QSim.Editor.dragEl.registerIndex + siblingDelta
            }
            return registerIndexTarget
          })
          // )
        ])
      }


      //  IN-MOMENT (IN-CIRCUIT) PARTIAL MULTI-REGISTER DRAG.
      //  It appears we are NOT dragging all components
      //  of a multi-register operation.
      //  But if we’re dragging within the same circuit
      //  and we’re staying within the same moment index
      //  that might be ok!

      else if (QSim.Editor.dragEl.circuitEl === circuitEl &&
				momentIndexTarget === childEl.origin.momentIndex) {


        //  We must ensure that only one component
        //  can sit at each register index.
        //  This copies registerIndices, 
        //  but inverts the key : property relationship.

        const registerMap = registerIndices
          .reduce(function (registerMap, registerIndex, r) {

            registerMap[registerIndex] = r
            return registerMap

          }, {})


        //  First, we must remove each dragged component
        //  from the register it was sitting at.

        foundComponents.forEach(function (component) {

          const componentRegisterIndex = +component.getAttribute('register-index')


          //  Remove this component from 
          //  where this component used to be.

          delete registerMap[componentRegisterIndex]
        })


        //  Now we can seat it at its new position.
        //  Note: This may OVERWRITE one of its siblings!
        //  And that’s ok.

        foundComponents.forEach(function (component) {

          const componentRegisterIndex = +component.getAttribute('register-index')

          //  Now put it where it wants to go,
          //  possibly overwriting a sibling component!

          registerMap[

            componentRegisterIndex + draggedRegisterDelta

          ] = +component.getAttribute('register-indices-index')
        })


        //  Now let’s flip that registerMap
        //  back into an array of register indices.

        const fixedRegistersIndices = Object.entries(registerMap)
          .reduce(function (registers, entry) {

            registers[+entry[1]] = +entry[0]
            return registers

          }, [])


        //  This will remove any blank entries in the array
        //  ie. if a dragged sibling overwrote a seated one.

          .filter(function (entry) {

            return QSim.isUsefulInteger(entry)
          })


        //  Finally, we’re ready to set.

        // circuit.set$( 
        setCommands.push([

          childEl.getAttribute('gate-symbol'),
          momentIndexTarget,
          fixedRegistersIndices
          // )
        ])
      }
      else {

        remainingComponents.forEach(function (componentEl) {

          //circuit.set$( 
          setCommands.push([

            +componentEl.getAttribute('register-indices-index') ?
              gatesymbol :
              QSim.Gate.NOOP,
            +componentEl.getAttribute('moment-index'),
            +componentEl.getAttribute('register-index')
            // )
          ])
        })


        //  Finally, let’s separate and update
        //  all the components that were part of the drag.

        foundComponents.forEach(function (componentEl) {

          // circuit.set$( 
          setCommands.push([

            +componentEl.getAttribute('register-indices-index') ?
              gatesymbol :
              QSim.Gate.NOOP,
            +componentEl.getAttribute('moment-index') + draggedMomentDelta,
            +componentEl.getAttribute('register-index') + draggedRegisterDelta,
            // )
          ])
        })
      }


      //  We’ve just completed the movement 
      //  of a multi-register operation.
      //  But all of the sibling components 
      //  will also trigger this process
      //  unless we remove them 
      //  from the draggd operations array.

      let j = i + 1
      while (j < draggedOperations.length) {

        const possibleSibling = draggedOperations[j]
        if (possibleSibling.getAttribute('gate-symbol') === gatesymbol &&
					possibleSibling.getAttribute('register-indices') === registerIndicesString) {

          draggedOperations.splice(j, 1)
        }
        else j++
      }
    }


    //  This is just a single-register operation.
    //  How simple this looks 
    //  compared to all the gibberish above.

    else {


      //  First, if this operation comes from a circuit
      // (and not a circuit palette)
      //  make sure the old positions are cleared away.

      if (QSim.Editor.dragEl.circuitEl) {

        draggedOperations.forEach(function (childEl) {

          QSim.Editor.dragEl.circuitEl.circuit.clear$(

            childEl.origin.momentIndex,
            childEl.origin.registerIndex
          )
        })
      }


      //  And now set$ the operation 
      //  in its new home.

      // circuit.set$( 
      setCommands.push([

        childEl.getAttribute('gate-symbol'),
        momentIndexTarget,
        [registerIndexTarget]
        // )
      ])
    }
  })


  //  DO IT DO IT DO IT
  // console.log('setCommands',setCommands)
  // 拖拽之后生成整个电路
  setCommands.forEach(function (setCommand) {
    circuit.set$.apply(circuit, setCommand)
  })
  // QSim.log(circuit.gates, setCommands)

  // update code
  // QSim.Editor.updateCode(setCommands)

  //  Are we capable of making controls? Swaps?

  QSim.Editor.onSelectionChanged(circuitEl)
  QSim.Editor.onCircuitChanged(circuitEl)


  //  If the original circuit and destination circuit
  //  are not the same thing
  //  then we need to also eval the original circuit.

  if (QSim.Editor.dragEl.circuitEl &&
		QSim.Editor.dragEl.circuitEl !== circuitEl) {

    const originCircuitEl = QSim.Editor.dragEl.circuitEl
    QSim.Editor.onSelectionChanged(originCircuitEl)
    QSim.Editor.onCircuitChanged(originCircuitEl)
  }


  //  We’re finally done here.
  //  Clean up and go home.

  document.body.removeChild(QSim.Editor.dragEl)
  QSim.Editor.dragEl = null
}

QSim.Editor.onSelectionChanged = function (circuitEl) {

  const controlButtonEl = circuitEl.querySelector('.Q-circuit-toggle-control')
  if (QSim.Editor.isValidControlCandidate(circuitEl)) {

    controlButtonEl.removeAttribute('Q-disabled')
  }
  else controlButtonEl.setAttribute('Q-disabled', true)

  // const swapButtonEl = circuitEl.querySelector('.Q-circuit-toggle-swap')
  // if (QSim.Editor.isValidSwapCandidate(circuitEl)) {

  //   swapButtonEl.removeAttribute('Q-disabled')
  // }
  // else swapButtonEl.setAttribute('Q-disabled', true)
}
QSim.Editor.onCircuitChanged = function (circuitEl) {

  const circuit = circuitEl.circuit
  window.dispatchEvent(new CustomEvent(

    'Q gui altered circuit',
    { detail: { circuit: circuit } }
  ))

  //  Should we trigger a circuit.evaluate$() here?
  //  Particularly when we move all that to a new thread??
  //  console.log( originCircuit.report$() ) ??
}




QSim.Editor.isValidControlCandidate = function (circuitEl) {

  const
    selectedOperations = Array
      .from(circuitEl.querySelectorAll('.Q-circuit-cell-selected'))


  //  We must have at least two operations selected,
  //  hopefully a control and something else,
  //  in order to attempt a join.

  if (selectedOperations.length < 2) return false


  //  Note the different moment indices present
  //  among the selected operations.

  const moments = selectedOperations.reduce(function (moments, operationEl) {

    moments[operationEl.getAttribute('moment-index')] = true
    return moments

  }, {})


  //  All selected operations must be in the same moment.

  if (Object.keys(moments).length > 1) return false


  //  If there are multi-register operations present,
  //  regardless of whether those are controls or swaps,
  //  all siblings must be present 
  //  in order to join a new gate to this selection.

  //  I’m sure we can make this whole routine much more efficient
  //  but its results are correct and boy am I tired ;)

  const allSiblingsPresent = selectedOperations
    .reduce(function (status, operationEl) {

      const registerIndicesString = operationEl.getAttribute('register-indices')


      //  If it’s a single-register operation
      //  there’s no need to search further.

      if (!registerIndicesString) return status


      //  How many registers are in use
      //  by this operation?

      const
        registerIndicesLength = registerIndicesString
          .split(',')
          .map(function (registerIndex) {

            return +registerIndex
          })
          .length,


        //  How many of this operation’s siblings
        // (including itself) can we find?

        allSiblingsLength = selectedOperations
          .reduce(function (siblings, operationEl) {

            if (operationEl.getAttribute('register-indices') === registerIndicesString) {

              siblings.push(operationEl)
            }
            return siblings

          }, [])
          .length


      //  Did we find all of the siblings for this operation?
      //  Square that with previous searches.

      return status && allSiblingsLength === registerIndicesLength

    }, true)


  //  If we’re missing some siblings
  //  then we cannot modify whatever we have selected here.

  if (allSiblingsPresent !== true) return false


  //  Note the different gate types present
  //  among the selected operations.

  const gates = selectedOperations.reduce(function (gates, operationEl) {

    const gateSymbol = operationEl.getAttribute('gate-symbol')
    if (!QSim.isUsefulInteger(gates[gateSymbol])) gates[gateSymbol] = 1
    else gates[gateSymbol]++
    return gates

  }, {})


  //  Note if each operation is already controlled or not.

  const {

    totalControlled,
    totalNotControlled

  } = selectedOperations
    .reduce(function (stats, operationEl) {

      if (operationEl.getAttribute('is-controlled') === 'true')
        stats.totalControlled++
      else stats.totalNotControlled++
      return stats

    }, {

      totalControlled: 0,
      totalNotControlled: 0
    })


  //  This could be ONE “identity cursor” 
  //  and one or more of a regular single gate
  //  that is NOT already controlled.

  if (gates['*'] === 1 &&
		Object.keys(gates).length === 2 &&
		totalNotControlled === selectedOperations.length) {

    return true
  }


  //  There’s NO “identity cursor”
  //  but there is one or more of specific gate type
  //  and at least one of those is already controlled.

  if (gates['*'] === undefined &&
		Object.keys(gates).length === 1 &&
		totalControlled > 0 &&
		totalNotControlled > 0) {

    return true
  }


  //  Any other combination allowed? Nope!

  return false
}
QSim.Editor.createControl = function (circuitEl) {

  if (QSim.Editor.isValidControlCandidate(circuitEl) !== true) return this


  const
    circuit = circuitEl.circuit,
    selectedOperations = Array
      .from(circuitEl.querySelectorAll('.Q-circuit-cell-selected')),


    //  Are any of these controlled operations??
    //  If so, we need to find its control component
    //  and re-use it.

    existingControlEl = selectedOperations.find(function (operationEl) {

      return (

        operationEl.getAttribute('is-controlled') === 'true' &&
				operationEl.getAttribute('register-array-index') === '0'
      )
    }),


    //  One control. One or more targets.

    control = existingControlEl || selectedOperations
      .find(function (el) {

        return el.getAttribute('gate-symbol') === '*'
      }),
    targets = selectedOperations
      .reduce(function (targets, el) {

        //if( el.getAttribute( 'gate-symbol' ) !== '!' ) targets.push( el )
        if (el !== control) targets.push(el)
        return targets

      }, [])


  //  Ready to roll.

  // circuit.history.createEntry$()
  selectedOperations.forEach(function (operationEl) {

    circuit.clear$(

      +operationEl.getAttribute('moment-index'),
      +operationEl.getAttribute('register-index')
    )
  })
  circuit.set$(

    targets[0].getAttribute('gate-symbol'),
    +control.getAttribute('moment-index'),
    [+control.getAttribute('register-index')].concat(

      targets.reduce(function (registers, operationEl) {

        registers.push(+operationEl.getAttribute('register-index'))
        return registers

      }, [])
    )
  )


  //  Update our toolbar button states.

  QSim.Editor.onSelectionChanged(circuitEl)
  QSim.Editor.onCircuitChanged(circuitEl)

  return this
}


QSim.Editor.isValidSwapCandidate = function (circuitEl) {

  const
    selectedOperations = Array
      .from(circuitEl.querySelectorAll('.Q-circuit-cell-selected'))


  //  We can only swap between two registers.
  //  No crazy rotation-swap bullshit. (Yet.)

  if (selectedOperations.length !== 2) return false


  //  Both operations must be “identity cursors.”
  //  If so, we are good to go.

  const areBothCursors = selectedOperations.every(function (operationEl) {

    return operationEl.getAttribute('gate-symbol') === '*'
  })
  if (areBothCursors) return true


  //  Otherwise this is not a valid swap candidate.

  return false
}
QSim.Editor.createSwap = function (circuitEl) {

  if (QSim.Editor.isValidSwapCandidate(circuitEl) !== true) return this

  const
    selectedOperations = Array
      .from(circuitEl.querySelectorAll('.Q-circuit-cell-selected')),
    momentIndex = +selectedOperations[0].getAttribute('moment-index')
  const registerIndices = selectedOperations
      .reduce(function (registerIndices, operationEl) {

        registerIndices.push(+operationEl.getAttribute('register-index'))
        return registerIndices

      }, []),
    circuit = circuitEl.circuit


  //  Create the swap operation.

  // circuit.history.createEntry$()
  selectedOperations.forEach(function (operation) {

    circuit.clear$(

      +operation.getAttribute('moment-index'),
      +operation.getAttribute('register-index')
    )
  })
  const swap_gate = QSim.Gate.findBySymbol('SWAP')
  circuit.set$(

    swap_gate,
    momentIndex,
    registerIndices
  )


  //  Update our toolbar button states.

  QSim.Editor.onSelectionChanged(circuitEl)
  QSim.Editor.onCircuitChanged(circuitEl)

  return this
}


// 将量子门转为代码
// update code in html by drag circuitEl
// IMPORTANT!
// must be called follow this.sort()	

QSim.Editor.updateCode = function (circuit) {

  const textarea = document.getElementById('playground-input')
  let source_code = 'quantum(' + circuit.bandwidth + ')\n'
  let codeCont = []

  // genarate codeCont

  circuit.gates.forEach(obj => {
    codeCont.push(obj)
    if (obj.isControlled) {
      for (let i = 0; i < codeCont.length; i++) {
        if (codeCont[i] !== null && codeCont[i].momentIndex == obj.momentIndex && QSim.includes(obj.registerIndices, codeCont[i].registerIndices)) {
          codeCont[i] = null
        }
      }
    }
  })

  // genarate source_code
  codeCont.forEach(obj => {
    if (obj === null) return
    if (!obj.gate) return
    if (obj.gate.symbol == '*') return
    const clone_obj = JSON.parse(JSON.stringify(obj))
    clone_obj.registerIndices[0]--
    if (clone_obj.registerIndices.length == 2) clone_obj.registerIndices[1]--
    source_code += clone_obj.gate.symbol + ' '
    source_code += clone_obj.registerIndices.join(' ') + '\n'
  })

  textarea.value = source_code
  return source_code
}

///////////////////
//               //
//   Listener    //
//               //
///////////////////


window.addEventListener('mousemove', QSim.Editor.onPointerMove)
window.addEventListener('touchmove', QSim.Editor.onPointerMove)
window.addEventListener('mouseup', QSim.Editor.onPointerRelease)
window.addEventListener('touchend', QSim.Editor.onPointerRelease)