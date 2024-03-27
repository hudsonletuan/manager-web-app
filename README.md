# Human Resources Manager
=====================

The Human Resources Manager is a web-based application designed to manage employee information for a company. The application allows users to create, read, update, and delete employee records, as well as import and export employee data to and from Excel files.

## Features
--------

* User authentication and authorization
* Employee record management (create, read, update, delete)
* Employee data import and export to and from Excel files
* Employee data search and filtering
* Column selection for employee data display
* Responsive design for desktop and mobile devices

## Technologies Used
-----------------

* ASP.NET Core MVC
* C#
* ADO.NET
* JavaScript
* Bootstrap
* jQuery
* Ajax
* HTML
* CSS

## Getting Started
---------------

To get started with the Human Resources Manager, follow these steps:

1. Clone the repository to your local machine.
```bash
git clone https://github.com/hudsonletuan/human-resources-manager.git
```
2. Open the solution file (ManagerWebApplication.sln) in Visual Studio.
3. Restore the NuGet packages for the solution.
4. Build the solution.
5. Run the application.

## Usage
-----

### User Authentication and Authorization

* To access the application, you must first sign in with a valid user account. If you do not have an account, you can sign up for one by clicking the "Sign Up" link on the login page.

* Once you are signed in, you will have access to the employee record management features of the application, based on your user role.

### Employee Record Management

* To create a new employee record, click the "Add Employee" button on the main page. Fill out the form with the employee's information and click "Save" to create the record.

* To view an employee's details, click the "View" button next to the employee's name in the employee list. To edit an employee's information, click the "Edit" button next to the employee's name in the employee list. Make your changes and click "Save" to update the record.

* To delete an employee record, click the "Delete" button next to the employee's name in the employee list. Confirm the deletion by clicking "Delete" in the confirmation dialog.

### Employee Data Import and Export

* To import employee data from an Excel file, click the "Import" button on the main page and select the file to import. The application will validate the data and display any errors or warnings. If the data is valid, click "Import" to import the data into the application.

* To export employee data to an Excel file, click the "Export" button on the main page and select the file format (XLS or XLSX). The application will generate the file and prompt you to save it to your local machine.

### Employee Data Search and Filtering

* To search for employee records, enter a search term in the search box at the top of the employee list and press Enter. The application will filter the employee list based on the search term.

* To filter the employee list by column, click the column header to sort the list by that column. Click the column header again to reverse the sort order.

### Column Selection for Employee Data Display

* To select which columns to display in the employee list, click the "Column Select" button on the main page. Check or uncheck the boxes next to the column names to show or hide the columns.

## Contributing
------------

If you would like to contribute to the Human Resources Manager, please follow these steps:

1. Fork the repository to your own GitHub account.
2. Create a new branch for your changes.
3. Make your changes and commit them to your branch.
4. Open a pull request to merge your changes into the main branch.

## License
-------

The Human Resources Manager is licensed under the [MIT License](LICENSE).
