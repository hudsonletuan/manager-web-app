$(function () {

    /*Show the whole employee list*/
    function refreshEmployeeList() {
        $.ajax({
            url: '/Employee/GetEmployeeList',
            type: 'GET',
            success: function (data) {
                $('#employeeTableBody').html(data);
                resetTableSorting();
                bindSortingEvent();
                searchTableList();
                $("#button-header").load(location.href + " #button-header");
            },
            error: function () {
                alert('Data cannot be shown!');
            }
        });
    }

    function resetTableSorting() {
        const table_headings = document.querySelectorAll('.tablehead th');

        table_headings.forEach((head) => {
            head.classList.remove('active', 'asc');

            // Reset the arrow indicator
            const arrowSpan = head.querySelector('span.icon-arrow');
            if (arrowSpan) {
                arrowSpan.style.transform = '';
                arrowSpan.classList.remove('active');
            }
        });

        if ($('#btn-multiple').hasClass('active')) {
            $('.row-checkbox').css('display', 'block');
        } else {
            $('.row-checkbox').css('display', 'none');
        }
    }

    const refreshButton = document.getElementById('refreshEmployeeBtn');
    refreshButton.addEventListener('click', refreshEmployeeList);

    //View Employee
    $(document).on('click', '.view-employee', function () {
        let employeeID = $(this).data('employee-id');

        $.ajax({
            url: '/Employee/GetEmployeeDetails',
            type: 'GET',
            data: { id: employeeID },
            success: function (data) {
                $('#employeeDetails').html(data);
                $('#viewEmployeeModal').modal('show');
            },
            error: function () {
                let errorMessage = 'An error occurred while retrieving employee details.';
                $('#employeeDetails').html('<p>' + errorMessage + '</p>');
                $('#viewEmployeeModal').modal('show');
            }
        });
    });

    //View Edit Employee Modal
    $(document).on('click', '.edit-employee', function () {
        let employeeID = $(this).data('employee-id');
        $.ajax({
            url: '/Employee/GetEmployeeEdit',
            type: 'GET',
            data: { id: employeeID },
            success: function (data) {
                $('#viewEmployeeModal').modal('hide');
                $('#editEmployee').html(data);
                $('#editEmployeeModal').modal('show');
                getPositionOnOpen("editEmployeeForm");
                getGenderOptions("genderUpdate");
                getPositionbyDepartment("editEmployeeForm");
                imageUpdateChange("imageFileUpdate", "avatarImageUpdate");
            },
            error: function () {
                let errorMessage = 'An error occurred while retrieving employee details.';
                $('#employeeDetails').html('<p>' + errorMessage + '</p>');
                $('#editEmployeeModal').modal('show');
            }
        });
    });

    function imageUpdateChange (fileId, avaId) {
        document.getElementById(fileId).onchange = function () {
            let reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById(avaId).src = e.target.result; // get loaded data and render thumbnail.
            };
            reader.readAsDataURL(this.files[0]); // read the image file as a data URL.
        };
    }

    $('#editEmployeeForm').on('submit', function (e) {
        e.preventDefault();

        let formData = new FormData(this);

        let positionID = $('#updateDpPs [name=positionName]').val();
        let genderName = $('#genderUpdate').val();
        formData.append('positionID', positionID); // Append position ID
        formData.append('gender', genderName);

        $.ajax({
            url: '/Employee/Update',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                $('#updateSuccess').modal('show');
                refreshEmployeeList();
            },
            error: function () {
                alert('Error');
            }
        });
    });

    let employeeID;
    let button;
    //Delete employee
    $(document).off('click', '.delete-employee').on('click', '.delete-employee', function () {
        employeeID = $(this).data('employee-id');
        let firstName = $(this).closest('tr').find('.employee-firstname').text() || $('.employee-firstname-view').text();
        let lastName = $(this).closest('tr').find('.employee-lastname').text() || $('.employee-lastname-view').text();
        button = $(this);
        $('#deleteEmployeeModal').modal('show');
        $(document).off('click', '#deleteConfirm').on('click', '#deleteConfirm', function () {
            $.ajax({
                url: '/Employee/Delete',
                type: 'GET',
                data: { id: employeeID },
                success: function () {
                    button.closest('tr').remove();
                    $('#deleteEmployeeModal').modal('hide');
                    $('#deleteSuccess').modal('show');
                    $('#deleteSuccess .modal-body h4').text('Deleted Successfully');
                    $('#deleteSuccess .modal-body p').text(firstName + ' ' + lastName + ' (' + employeeID + ')');
                    $('#viewEmployeeModal').modal('hide');
                    $('#editEmployeeModal').modal('hide');
                    refreshEmployeeList();
                },
                error: function () {
                    alert('Error deleting');
                }
            });
        });
    });

    // Bulk Action Dropdown
    document.getElementById("dropdownBulkAction").onclick = function () {
        var menuBulkAction = document.getElementById("menuBulkAction");
        menuBulkAction.classList.toggle("show");

        // Check if the dropdown is not visible and remove focus from the button
        if (!menuBulkAction.classList.contains('show')) {
            this.blur();
        }
    }

    $('#btn-multiple').on('click', function () {
        $(this).toggleClass('active');

        const dropdown = document.querySelector('.dropdown');
        if (dropdown.hasAttribute('hidden')) {
            dropdown.removeAttribute('hidden');
        } else {
            dropdown.setAttribute('hidden', 'true');
        }

        if ($(this).hasClass('active')) {
            $('.row-checkbox').css('display', 'block');
        } else {
            $('.row-checkbox').css('display', 'none');
        }
    });

    // Select All & Unselect All
    $('.select-all').on('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
    });
    $('.unselect-all').on('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    });


    // Close the dropdown if the user clicks outside of it
    window.onclick = function (event) {
        if (!event.target.matches('.dropdown-bulk-action')) {
            var dropdowns = document.getElementsByClassName("bulk-action-menu");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    // Remove focus from the button when dropdown is closed
                    document.getElementById("dropdownBulkAction").blur();
                }
            }
        }
    }

    // Bulk Delete Employee
    $('.bulk-del').on('click', function (e) {
        e.preventDefault();

        let selectedIDs = [];
        $('.row-checkbox:checked').each(function () {
            let id = $(this).closest('tr').find('.employee-id').text();
            selectedIDs.push(id);
        });

        if (selectedIDs.length === 0) {
            alert('No employee selected');
            return;
        }

        if (confirm('Are you sure you want to delete these employees?')) {
            $.ajax({
                url: '/Employee/BulkDelete',
                type: 'POST',
                data: { ids: selectedIDs },
                success: function (response) {
                    if (response.success) {
                        alert('Employees deleted successfully');
                        refreshEmployeeList();
                    } else {
                        alert('Error deleting employees');
                    }
                },
                error: function () {
                    alert('Error deleting employees');
                }
            });
        }
    });

    //Create Employee
    imageUpdateChange("imageFile", "avatarImage");
    $(function () {
        // Show the modal when the button is clicked
        $('#createEmployeeModalBtn').on('click', function () {
            $('#createEmployeeModal').modal('show');
        });
    });

    getGenderOptions("genderCreate");
    getPositionbyDepartment("createEmployeeForm");

    $('#createEmployeeForm').off('submit').on('submit', function (e) {
        e.preventDefault();

        let formData = new FormData(this);
        formData.append('imageFile', $('#imageFile')[0].files[0]); // Append imageFile element

        let positionID = $('#createDpPs [name=positionName]').val();
        let genderName = $('#genderCreate').val();
        formData.append('positionID', positionID); // Append position ID
        formData.append('gender', genderName);

        if (document.querySelector('.id-right').hidden) {
            $('#createErrorModal').modal('show');
            return false;
        }

        $.ajax({
            url: '/Employee/Create',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                let firstName = $('#firstName').val();
                let lastName = $('#lastName').val();
                let id = $('#ID').val();
                
                $('#createSuccess').modal('show');
                $('#createSuccess .modal-body h4').text(firstName + ' ' + lastName + ' (' + id + ')');
                $('#createSuccess .modal-body p').text('has been created successfully!');
                document.querySelector('.id-right').hidden = true;
                document.querySelector('.id-wrong').hidden = false;
                refreshEmployeeList();
            },
            error: function () {
                alert('Error creating employee');
            }
        });
    });

    $(document).on('click', '#createEmployeeForm .btn-clear', function () {
        document.getElementById('createEmployeeForm').reset();
        document.getElementById('avatarImage').src = "/images/ava-default.png";
        document.getElementById('imageFile').value = "";
        document.getElementById("createDpPs").querySelector("#positionLabel").hidden = true;
        document.getElementById("createDpPs").querySelector("#positionName").hidden = true;
        document.querySelector('.id-right').hidden = true;
        document.querySelector('.id-wrong').hidden = true;

    });
    $('#ID').on('input', function () {
        iDCheck();
    });

    function iDCheck() {
        const currentId = $('#createEmployeeForm [name=ID]').val();
        $.ajax({
            url: '/Employee/GetEmployeeDetails',
            type: 'GET',
            data: { id: currentId },
            success: function (response) {
                if (response.error) {
                    document.querySelector('.id-right').hidden = false;
                    document.querySelector('.id-wrong').hidden = true;
                }
                else {
                    document.querySelector('.id-right').hidden = true;
                    document.querySelector('.id-wrong').hidden = false;
                }
            },
            error: function () {
                document.querySelector('.id-right').hidden = true;
                document.querySelector('.id-wrong').hidden = true;
            }
        });
    }

    //Get Positions by Department
    function getPositionOnOpen(divName) {
        let departmentID = document.getElementById(divName).querySelector("#departmentName").value;
        //let departmentID = $('#updateDpPs [name=departmentName]').val();
        let positionDropdown = document.getElementById(divName).querySelector("#positionName");
        positionDropdown.innerHTML = "";

        if (departmentID !== "") {
            $.ajax({
                url: '/Employee/GetPositionsByDepartment?departmentID=' + departmentID,
                type: 'GET',
                success: function (data) {
                    document.getElementById(divName).querySelector("#positionLabel").hidden = false;
                    document.getElementById(divName).querySelector("#positionName").hidden = false;

                    let positionValue = $("#positionValue").attr('value');

                    let defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.style = "color: gray"
                    defaultOption.text = "Select...";
                    positionDropdown.appendChild(defaultOption);

                    data.forEach(position => {
                        let option = document.createElement("option");
                        option.value = position.positionID;
                        option.text = position.positionName;
                        if (positionValue === position.positionID) {
                            option.selected = true;
                        }

                        positionDropdown.appendChild(option);
                    });
                },
                error: function (error) {
                    console.log(error);
                }
            });
        } else {
            document.getElementById(divName).querySelector("#positionLabel").hidden = true;
            document.getElementById(divName).querySelector("#positionName").hidden = true;
        }
    }

    function getPositionbyDepartment(divName) {
        document.getElementById(divName).querySelector("#positionLabel").hidden = true;
        document.getElementById(divName).querySelector("#positionName").hidden = true;
        document.getElementById(divName).querySelector("#departmentName").onchange = function () {
            let departmentID = this.value;
            let positionDropdown = document.getElementById(divName).querySelector("#positionName");
            positionDropdown.innerHTML = "";

            if (departmentID !== "") {
                $.ajax({
                    url: '/Employee/GetPositionsByDepartment?departmentID=' + departmentID,
                    type: 'GET',
                    success: function (data) {
                        document.getElementById(divName).querySelector("#positionLabel").hidden = false;
                        document.getElementById(divName).querySelector("#positionName").hidden = false;

                        let positionValue = $("#positionValue").attr('value');

                        let defaultOption = document.createElement("option");
                        defaultOption.value = "";
                        defaultOption.style = "color: gray"
                        defaultOption.text = "Select...";
                        positionDropdown.appendChild(defaultOption);

                        data.forEach(position => {
                            let option = document.createElement("option");
                            option.value = position.positionID;
                            option.text = position.positionName;
                            if (positionValue === position.positionID && divName !== "createDpPs") {
                                option.selected = true;
                            }

                            positionDropdown.appendChild(option);
                        });
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            } else {
                document.getElementById(divName).querySelector("#positionLabel").hidden = true;
                document.getElementById(divName).querySelector("#positionName").hidden = true;
            }
        }
    }
    

    //Render gender options
    function getGenderOptions(genderOptionId) {
        let genderDropdown = document.getElementById(genderOptionId);
        let genderOptions = [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" }
        ];

        let genderVal = $("#genderValue").attr('value');

        while (genderDropdown.options.length > 0) {
            genderDropdown.remove(0);
        }

        let defaultGender = document.createElement("option");
        defaultGender.value = "";
        defaultGender.style = "color: gray"
        defaultGender.text = "Select...";
        genderDropdown.appendChild(defaultGender);

        
        genderOptions.forEach(option => {
            let genderDropdownOption = document.createElement("option");
            genderDropdownOption.value = option.value;
            genderDropdownOption.text = option.label;
            if (genderVal === option.value && genderOptionId !== "genderCreate") {
                genderDropdownOption.selected = true;
            }

            genderDropdown.appendChild(genderDropdownOption);
        });
    }

    // Searching for specific data of HTML table

    function searchTableList() {
        const search = document.querySelector('.input-group input');
        const table_rows = document.querySelectorAll('#employeeTableBody tr');

        search.addEventListener('input', function () {
            searchTable(search, table_rows);
        });

        searchTable(search, table_rows);
    }

    function searchTable(search, table_rows) {
        let visibleRowIndex = 0;
        const searchTerms = search.value.toLowerCase().split(' ').filter(term => term.trim() !== '');

        table_rows.forEach(row => {
            let table_data = row.textContent.toLowerCase(),
                search_data = search.value.toLowerCase();

            // Determine if the row should be visible (contains all search terms)
            let isVisible = searchTerms.every(term => table_data.includes(term));

            // Set display property based on search match
            row.style.display = isVisible ? '' : 'none';

            // Update row color based on its new index position
            if (isVisible) {
                row.style.backgroundColor = (visibleRowIndex % 2 === 0) ? 'transparent' : '#0000000b';
                visibleRowIndex++;
            }
        });
    }

    searchTableList();

    //Sorting | Ordering data of HTML table

    function bindSortingEvent() {
        const table_headings = document.querySelectorAll('.tablehead th');
        const table_rows = document.querySelectorAll('#employeeTableBody tr');

        table_headings.forEach((head, i) => {
            let sort_asc = true;
            head.onclick = () => {
                table_headings.forEach(head => head.classList.remove('active'));
                head.classList.add('active');

                document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
                table_rows.forEach(row => {
                    row.querySelectorAll('td')[i].classList.add('active');
                })

                head.classList.toggle('asc', sort_asc);
                sort_asc = head.classList.contains('asc') ? false : true;

                sortTable(i, sort_asc);
            }
        })
    }

    bindSortingEvent();

    function sortTable(column, sort_asc) {
        const table_rows = document.querySelectorAll('#employeeTableBody tr');
        [...table_rows].sort((a, b) => {
            let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
                second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

            return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
        })
            .forEach(sorted_row => document.querySelector('#employeeTableBody').appendChild(sorted_row));
    }

    //Import Employee Data
    const eUploadBtn = document.getElementById('uploadEmpFile');
    const eFileInput = document.getElementById('employeeFile');

    eUploadBtn.addEventListener('click', function () { 
        eFileInput.click();
    });

    eFileInput.addEventListener('change', function () {
        const eFile = this.files[0];
        const formData = new FormData();
        formData.append('eFile', eFile);

        $.ajax({
            url: "/Employee/ImportEmployees",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.success) {
                    alert('Imported successfully');
                    refreshEmployeeList();
                } else {
                    if (data.duplicates) {
                        $('#uploadDuplication .modal-body').html(data.html);
                        $('#uploadDuplication').modal('show');
                    }
                }
            },
            error: function (error) {
                alert('Error importing employees');
                console.log(error);
            }
        });
    });

    //Update Employee from Duplication
    function updateEmployee(employee) {
        // Prepare the data object to send to the server
        var data = {
            ID: employee.ID,
            FirstName: employee.FirstName,
            MiddleName: employee.MiddleName,
            LastName: employee.LastName,
            Gender: employee.Gender,
            DateOfBirth: employee.DateOfBirth,
            PhoneNumber: employee.PhoneNumber,
            Email: employee.Email,
            LocalAddress: employee.LocalAddress,
            PositionID: employee.PositionID,
            Salary: employee.Salary,
            StartDate: employee.StartDate,
            EndDate: employee.EndDate,
            AvaName: employee.AvaName
        };

        // Send an AJAX request to the server to update the employee record
        $.ajax({
            url: '/Employee/UpdateEmployee', // URL to the server-side method for updating employees
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                // Handle the result of the update operation
                if (result.success) {
                    alert('Employee updated successfully');
                } else {
                    alert('Error updating employee: ' + result.message);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Handle any errors that occurred during the request
                alert('Error updating employee: ' + textStatus + ', ' + errorThrown);
            }
        });
    }

    // Upload Employee Images

    //Open Upload Image Modal
    const eIUploadBtn = document.getElementById('uploadImageFile');
    const eIFileInput = document.getElementById('uploadEmployeeImages');
    eIUploadBtn.addEventListener('click', function () {
        eIFileInput.click();
    });

    //Upload Folder
    document.getElementById('uploadImageFolder').addEventListener('change', function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            // Create a FormData object to hold the file
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('employeeImages', files[i]);
            }
            //Send the file to the server using AJAX
            fetch('/Employee/UploadEmployeeImagesFolder', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(result => {
                    alert('Upload images successfully');
                })
                .catch(error => {
                    alert('Error uploading images');
                    console.error('Error:', error);
                });
        }
    });

    document.getElementById('zipimageFilesInput').addEventListener('change', function (event) {
        const files = this.files;
        if (files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            $.ajax({
                url: '/Employee/UploadEmployeeImagesZip',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    alert('Upload images successfully');
                },
                error: function (error) {
                    alert('Error uploading images');
                    console.log(error);
                }
            });
        }
    });
});