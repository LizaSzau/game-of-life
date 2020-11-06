//-----------------------------------------------------------------------------
// Init
//-----------------------------------------------------------------------------

var game_size_x = 201
var game_size_y = 201
var game_center_x = Math.ceil(game_size_x / 2)
var game_center_y = Math.ceil(game_size_y / 2)
var game_main = []
var game_temp = []
var game_save = []
var is_life = true
var count = 1
var auto = false

//-----------------------------------------------------------------------------
// Check file API support
//-----------------------------------------------------------------------------

if (!(window.File && window.FileReader)) {
	message(ERROR_FILE_API, 'error')
}

//-----------------------------------------------------------------------------
// Messages
//-----------------------------------------------------------------------------

const ERROR_FILE_API = 'The File APIs are not fully supported in this browser.'
const ERROR_FILE_TYPE = 'Not supperted file format! Supported fileformat is #Life 1.05'
const ERROR_FILE_READ ='Something went wrong while reading file.'
const ERROR_TABLE_SIZE = 'The game table is too small for this game.'
const WARNING_END = 'The game is over.'

function message(message, style) {
	document.querySelector('#message').style.display = 'block'
	document.querySelector('#message').innerHTML = message
	document.querySelector('#message').className = 'rounded message ' + style
}

function message_delete() { 
	document.querySelector('#message').style.display = 'none'
	document.querySelector('#message').innerHTML = ''
}

//-----------------------------------------------------------------------------
// Disable buttons while loading
//-----------------------------------------------------------------------------

function disable_buttons(disabled_status) {
	var btn, i
	btn = document.querySelectorAll('button')
	for (i = 0; i < btn.length; i++) {
		btn[i].disabled = disabled_status
	}
}

//-----------------------------------------------------------------------------
// Fill main game array with 0
//-----------------------------------------------------------------------------

function fill_game_array() {
	game_main = []
	//game_temp = []
	
	for (var i = 0; i < game_size_y; i++) {
		game_main.push([0])
		//game_temp.push([0])
		for (var j = 0; j < game_size_x; j++) {
			game_main[i][j] = 0
			//game_temp[i][j] = 0
		}
	}
}

//-----------------------------------------------------------------------------
// Draw game table - make cells
//-----------------------------------------------------------------------------

function draw_game_table() {
	for (var i = 0; i < game_size_x; i++) {
		let node = document.createElement('div')
		node.classList.add('table-row')
		document.getElementById('game').appendChild(node)
		
		for (var j = 0; j < game_size_y; j++) {
			let node_sub = document.createElement('div')	
			node_sub.classList.add('table-cell')
			//node.setAttribute('id', 'cell_' + i + '_' + j)
			node_sub.id = 'cell_' + i + '_' + j
			
			if (game_main[i][j] == 1)  {
				node_sub.classList.add('life')
			}
			node.appendChild(node_sub);  		
		}
	}
}

//-----------------------------------------------------------------------------
// Draw next generation
//-----------------------------------------------------------------------------

function draw_generation() {
	for (var i = 0; i < game_size_x; i++) {
		for (var j = 0; j < game_size_y; j++) {
			if (game_main[i][j] == 0) {
				document.getElementById('cell_' + i + '_' + j).classList.remove('life')
			}
			else {
				document.getElementById('cell_' + i + '_' + j).classList.add('life')
			}	
		}
	}
}

//-----------------------------------------------------------------------------
// Reset new game
//-----------------------------------------------------------------------------
function reset_new_game() {
	disable_buttons(true)
	message_delete()
	game_save = []
	count = 1
	document.querySelector('#file_input').value = null
	document.querySelector('#btn_auto_stop').disabled = false
	document.querySelector('#btn_auto').style.display = 'block'
	document.querySelector('#btn_auto_stop').style.display = 'none'
	document.querySelector('#count').style.display = 'block'
	document.querySelector('#count div:last-child').innerHTML = count
}
	
//-----------------------------------------------------------------------------
// Read file
//-----------------------------------------------------------------------------

function readFile(input) {
	let file = input.files[0]
	let reader = new FileReader()
	let life_x 
	let life_y
	let new_row
	
	reset_new_game()
	document.querySelector('#game').innerHTML = ''
	document.querySelector('.loader').style.display = 'block'
	
	fill_game_array()
	reader.readAsText(file)

	reader.onload = function() {
		var lines = this.result.split('\n')

		if (lines[0] != '#Life 1.05') {
			message(ERROR_FILE_TYPE, 'error')
			return false
		}
		
		for(var line = 0; line < lines.length; line++) {
			if (lines[line].charAt(0) == '#' && lines[line].charAt(1) == 'P') {
				let line_arr = lines[line].split(' ')
				life_x = parseInt(game_center_x) + parseInt(line_arr[2] - 1)
				life_y = parseInt(game_center_y) + parseInt(line_arr[1] - 1)
				new_row = 0

				if (life_x < 0 || life_x > game_size_x || life_y < 0 || life_y > game_size_y) {
					message(ERROR_TABLE_SIZE, 'error')   
					return false
				}
			}
			
			if (lines[line].charAt(0) != '#') {
				let line_arr = lines[line].split('')
				let i = 0
				
				while (line_arr[i]) {
					if (line_arr[i] == '*') {
						let x = life_x + new_row
						let y = life_y + i
						
						if (x >= game_size_x || y >= game_size_y) {
							message(ERROR_TABLE_SIZE, 'error')
							return false
						}
						
						game_main[x][y] = 1
					}
					i++
				}
				new_row++
			}
		}
		
		document.querySelector('.loader').style.display = 'none'
		disable_buttons(false)
		document.querySelector('#btn_prev').disabled = true	
		draw_game_table()
		game_temp_init()
	}
	reader.onerror = function() { message(ERROR_FILE_TYPE, 'error') }
}

function game_temp_init() {
	
	game_temp = []
	
	for (var i = 0; i < game_size_x; i++){
		game_temp.push([0])
		for (var j= 0; j < game_size_y; j++) {
			game_temp[i][j] = game_main[i][j]
		}
	}
}
//-----------------------------------------------------------------------------
// Next generation
//-----------------------------------------------------------------------------

function next_generation() {
	var is_life_g = false
	count++
	counter_count()
	
	if (!auto) document.querySelector('#btn_prev').disabled = false	
	
	var tmp = []
	for (var i = 0; i < game_size_x; i++){
		tmp.push([0])
		for (var j= 0; j < game_size_y; j++) {
			tmp[i][j] = game_temp[i][j]
		}
	}
	game_save.push(tmp)

	for (var i = 0; i < game_size_x; i++) {
		for (var j = 0; j < game_size_y; j++) {
			let life = 0
			let next_life = 0
			
			// I made an online speed test and this way the code is longer but gives a better performance
			if (i == 0) { 						// --- first row --------
				if (j == 0) { 						// left side cell
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i + 1][j] == 1) life++
					if (game_main[i + 1][j + 1] == 1) life++
				} else if (j == game_size_x - 1) {  // right side cell
					if (game_main[i][j - 1] == 1) life++
					if (game_main[i + 1][j] == 1) life++
					if (game_main[i + 1][j - 1] == 1) life++					
				} else {							// center cells
					if (game_main[i][j - 1] == 1) life++
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i + 1][j] == 1) life++
					if (game_main[i + 1][j - 1] == 1) life++					
					if (game_main[i + 1][j + 1] == 1) life++					
				}
			} else if (i == game_size_y - 1) {	// --- last row ---------
				if (j == 0) {						// left side cell
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i - 1][j] == 1) life++
					if (game_main[i - 1][j + 1] == 1) life++				
				} else if (j == game_size_x - 1) {	// right side cell
					if (game_main[i][j - 1] == 1) life++
					if (game_main[i - 1][j] == 1) life++
					if (game_main[i - 1][j - 1] == 1) life++					
				} else {							// center cells
					if (game_main[i][j - 1] == 1) life++
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i - 1][j] == 1) life++
					if (game_main[i - 1][j - 1] == 1) life++					
					if (game_main[i - 1][j + 1] == 1) life++					
				}			
			} else {							// --- center rows -------
				if (j == 0) {						// left side cells
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i - 1][j] == 1) life++
					if (game_main[i - 1][j + 1] == 1) life++
					if (game_main[i + 1][j] == 1) life++
					if (game_main[i + 1][j + 1] == 1) life++				
				} else if (j == game_size_x - 1) {	// right side cells
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i - 1][j] == 1) life++
					if (game_main[i - 1][j - 1] == 1) life++
					if (game_main[i + 1][j] == 1) life++
					if (game_main[i + 1][j - 1] == 1) life++					
				} else {							// center cells
					if (game_main[i][j - 1] == 1) life++
					if (game_main[i][j + 1] == 1) life++
					if (game_main[i + 1][j] == 1) life++
					if (game_main[i + 1][j - 1] == 1) life++					
					if (game_main[i + 1][j + 1] == 1) life++
					if (game_main[i - 1][j] == 1) life++
					if (game_main[i - 1][j - 1] == 1) life++					
					if (game_main[i - 1][j + 1] == 1) life++					
				}			
			}
			
			if (game_main[i][j] == 0) {
				if (life == 3) {
					next_life = 1
					is_life_g = true
				}
			} else {
				if (life == 2 || life == 3) {
					next_life = 1
					is_life_g = true
				} 
			}
			game_temp[i][j] = next_life
		}
	}

	if (!is_life_g) life_over() 
	game_main = game_temp.slice()
	draw_generation()
}

//-----------------------------------------------------------------------------
// Previous generation
//-----------------------------------------------------------------------------

function prev_generation() {
	count--	
	counter_count()

	if (count <= 1) {
		document.querySelector('#btn_prev').disabled = true	
	} else {
		game_main = game_save.pop()
		draw_generation()	
	}
}

//-----------------------------------------------------------------------------
// New generation - auto
//-----------------------------------------------------------------------------

function next_generation_auto() {
	clock = setInterval(next_generation_timer, 500)
	auto = true
	document.querySelector('#btn_auto').style.display = 'none'
	document.querySelector('#btn_auto_stop').style.display = 'block'
	document.querySelector('#btn_next').disabled = true	
	document.querySelector('#btn_prev').disabled = true	
}
	
function next_generation_auto_stop() {
	clearTimeout(clock)
	auto = false
	document.querySelector('#btn_auto').style.display = 'block'
	document.querySelector('#btn_auto_stop').style.display = 'none'
	document.querySelector('#btn_next').disabled = false	
	document.querySelector('#btn_prev').disabled = false	
}

function next_generation_timer() {
	if (is_life) {
		next_generation()
	}
	else {	
		clearTimeout(clock)
		document.querySelector('#btn_auto_stop').disabled = true
	}
}

//-----------------------------------------------------------------------------
// Counter count
//-----------------------------------------------------------------------------

function counter_count() { 
	document.querySelector('#count div:last-child').innerHTML = count
}

//-----------------------------------------------------------------------------
// Life is over
//-----------------------------------------------------------------------------

function life_over() {
	is_life = false
	document.querySelector('#btn_auto').disabled = true	
	document.querySelector('#btn_next').disabled = true		
	message(WARNING_END, 'warning')
}

//-----------------------------------------------------------------------------
// Life is on
//-----------------------------------------------------------------------------

function life_on() {
	is_life = true
	document.querySelector('#btn_auto').disabled = false	
	document.querySelector('#btn_next').disabled = false	
}