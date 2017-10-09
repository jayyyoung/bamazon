var mysql = require("mysql");
var inquirer = require("inquirer");
var fs = require('fs');
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

console.log('\n');
console.log("=====================================WELCOME TO BAMAZON=======================================");
console.log("=========================The world's first command line merchant site=========================");
console.log("==============================================================================================");

// lets the user select which mode they would like the use
function runBamazon(){
	inquirer.prompt({
		type: "list",
		name: "userMode",
		message: "Please Select Your Account Type",
		choices: ['Buyer', 'Manager', 'Supervisor']
	}).then(function(input){
		console.log('Welcome ' + input.userMode);
		if (input.userMode === 'Buyer'){
			displayItems();
			buyer();
		} if (input.userMode === 'Manager'){
			manager();
		} if (input.userMode === 'Supervisor'){
			supervisor();
		};
	})	
};

// asks the usertwo input the item they want and the amount they would like
function buyer(){
	inquirer.prompt([
	{
        name: "id",
        type: "input",
        message: "Please type in the ID number of your item."
    }, {
        name: 'quantity',
        type: 'input',
        message: "Please type in the amount of the item you would like to purchase."
	}
	]).then(function(input){
		var idSubmitted = input.id;
		var amountSubmitted = input.quantity;
		selectFromDatabase(idSubmitted,amountSubmitted);
	})	
};

//runs the manager application 
function manager(){
	var managerFile = require("./bamazonManager.js");
};

// runs when called from the buyer function - uses the two inputed values.
function selectFromDatabase(id, quantitySelected){
	connection.query('SELECT * FROM products WHERE itemId = ' + id, function(err, response) {
        if (err) {throw err;}

        if (quantitySelected <= response[0].stockQuantity){
        	var totalCost = response[0].price * quantitySelected;

        	console.log('\n');
        	console.log("======================================YOUR COMPLETE ORDER=====================================");
        	console.log("We are processing your order now...");
        	console.log("We are in stock of item you have selected.");
        	console.log("Your total cost for " + quantitySelected + " " + response[0].productName + "s" + " is $" + totalCost + ".");
        	console.log("Please shop with Bamazon again!");
        	console.log("==============================================================================================");

        	connection.query('UPDATE products SET stockQuantity = stockQuantity - ' + quantitySelected + ' WHERE itemId = ' + id);
        	
        	runBamazon();
        } else {
        	console.log('\n');
        	console.log("=======================================ERROR WITH ORDER=======================================");
        	console.log("We are processing your order now...");
        	console.log("There seems to be a problem...");
            console.log("Your order amount of " + quantitySelected + " " + response[0].productName + "s" + " was more than the available stock.");
            console.log("Please repeat the order process with a lower quantity.");
            console.log("==============================================================================================");

            buyer();
        };
            
	})
};

//when called, the function displays an "illustrated" list  of the 
// inventory for the user to choose what items they would like to purchase
function displayItems(){
	connection.query('SELECT * FROM products', function(err, response){
		console.log("\n");
		console.log("==============================================================================================");
		console.log("======================================OUR PRODUCT LIST========================================");
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
		console.log("====================Please type in the product's ID number and your amount====================");
		console.log('\n');
	})	
};	 

function supervisor(){
	console.log("=====================================================");
	console.log("!!!!This section of the app is under construction!!!!");
	console.log("=====================================================");
	runBamazon();
};

runBamazon();
