var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
	socketPath:"/Applications/MAMP/tmp/mysql/mysql.sock", 

	user: 'root',
	password: 'root',
	database: 'bamazon'
});

connection.connect(function(err){
	if(err){throw err;}
});

// console.log('\n');
// console.log("=================================WELCOME TO MANAGER SETTINGS==================================");
// console.log("===============================Manage your Bamazon store here.================================");
// console.log("==============================================================================================");

function runManager(){
	console.log('\n');
	console.log("=================================WELCOME TO MANAGER SETTINGS==================================");
	console.log("===============================Manage your Bamazon store here.================================");
	console.log("==============================================================================================");

	inquirer.prompt({
		type: "list",
		name: "managerList",
		message: "Select Your Manager Option",
		choices: ['View Your Product List', 'View Your Low Inventory', 'Restock Your Inventory', 'Add New Item To Your Inventory']
	}).then(function(input){
		console.log('You have selected ' + input.managerList);
		if (input.managerList === 'View Your Product List'){
			viewItems();
		} if (input.managerList === 'View Your Low Inventory'){
			viewLowInventory();
		} if (input.managerList === 'Restock Your Inventory'){
			restock();
		} if (input.managerList === 'Add New Item To Your Inventory'){
			addItem();
		};
	})	
};

// shows the manager the entire items list
function viewItems(){
	connection.query('SELECT * FROM products', function(err, response){
		console.log("\n");
		console.log("==============================================================================================");
		console.log("=====================================YOUR PRODUCT LIST========================================");
		var table = new Table({
	    	head: ['Item ID', 'Product Name', 'Item Category', 'Price', 'Stock'], 	
	    	colWidths: [10, 40, 18, 10, 10]
		});

		for (i = 0; i < response.length; i++){
			table.push(
	    		[response[i].itemId, response[i].productName, response[i].departmentName, "$" + response[i].price, response[i].stockQuantity]
			);
		};
		console.log(table.toString());
		console.log('\n');
		runManager();
	})	
};

// checks to see if an items stock number is under 5 and alerts the manager. Keeps saying the toString() is not defined when it is ran.
function viewLowInventory(){
	console.log("==========================THIS SECTION IS UNDER CONSTRUCTION! SEE CODE!===========================")
	// console.log('\n');
	// console.log("==================================YOUR LOW INVENTORY LIST=====================================");
	// connection.query('SELECT * FROM products WHERE stockQuantity <= 5',function(err, response){
 //    	if(err) throw err;

 //    	if (response.length === 0) {
 //      	console.log('There are no items with low inventory.');
 //    	} else {
 //      		var tableLow = new Table({
 //        		head: ['Item ID', 'Product Name', 'Item Category', 'Price', 'Stock'],
 //        		colWidths: [10, 40, 18, 10, 10]
 //      		});
      	
 //    		for (var i = 0; i < response.length; i++) {
 //        		tableLow.push(
 //        			[response[i].itemID, response[i].productName, response[i].departmentName, '$' + response[i].price, response[i].stockQuantity]
 //        		);
 //    		};
 //    	};
 //    console.log(tableLow.toString());
 //    console.log("==============================================================================================");
    runManager();	
};
	

// this functions runs when "Restock Your Inventory" is selected
function restock(){
	console.log('\n');
	console.log("============================VIEW INVENTORY FIRST BEFORE ADDING================================");
	inquirer.prompt([
	{
        name: "id",
        type: "input",
        message: "Please type in the ID number of your item you wish to restock."
    }, {
        name: 'quantity',
        type: 'input',
        message: "Please type in the amount of the item you wish to restock."
	}
	]).then(function(input){
		var restockId = input.id;
		var amountRestocked = input.quantity;
		restockDatabase(restockId,amountRestocked);
	})
};
// runs the function that adds units to the inventory
function restockDatabase(id, quantityStocked){
	connection.query('SELECT * FROM products WHERE itemId = ' + id, function(err, response){
		if(err){throw err;}
		connection.query('UPDATE products SET stockQuantity = stockQuantity + ' + quantityStocked + ' WHERE itemId = ' + id);
	})
	console.log("===============================Inventory item has been updated.===============================");
	runManager();
};

// function that runs when "Add New Item To Your Inventory" is selected
function addItem(){
	inquirer.prompt([
		{
			name: "name",
			type: "input",
			message: "Please add the name of the item you are posting."
		}, {
			name: "category",
			type: "input",
			message: "Please add the category of the item you are posting."
		}, {
			name: "price",
			type: "input",
			message: "What is the price of the new item?"
		}, {
			name: "quantity",
			type: "input",
			message: "How many of the new items will be in the inventory?"
		}
	]).then(function(input){
		var newName = input.name;
		var newCategory = input.category;
		var newPrice = input.price;
		var newQuantity = input.quantity;

		newItem(newName, newCategory, newPrice, newQuantity);

		runManager();
	});
};
// uses the input from the addItem function to add a new item to the database
function newItem(name, category, price, quantity){
	connection.query('INSERT INTO products (productName,departmentName,price,stockQuantity) VALUES("' + name + '","' + category + '",' + price + ',' + quantity +  ')');
};

runManager();