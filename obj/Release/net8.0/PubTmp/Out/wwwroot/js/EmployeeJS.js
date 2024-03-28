$(function () {
    function checkUserActivity() {
        let userFullName = sessionStorage.getItem('userFullName');
        let userID = sessionStorage.getItem('userID');
        let userEmail = sessionStorage.getItem('userEmail');

        // Get the timestamp for the user's last activity
        let lastActivity = sessionStorage.getItem('lastActivity');

        let currentTime = Date.now();
        let timeDifference = currentTime - lastActivity;
        const inactiveThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (userEmail && userID && userFullName && timeDifference <= inactiveThreshold) {
            document.getElementById('user-fullname-display').textContent = userFullName;
            $('#employee-table-index').show();

            // Update the timestamp for the user's last activity
            sessionStorage.setItem('lastActivity', Date.now());
        } else if (userEmail && (!userID || !userFullName) && timeDifference <= inactiveThreshold) {
            $('#addEmployeeBtn').trigger('click');
            $('#email').val(userEmail);
        } else {
            window.location.href = 'Login';
        }
    }
    checkUserActivity();

    const logOutBtn = document.getElementById('usermenu-logout');
    logOutBtn.addEventListener('click', function () {
        sessionStorage.clear();
        window.location.href = '/';
    });

    const privacyBtn = document.getElementById('usermenu-privacy');
    privacyBtn.addEventListener('click', function () {
        $('#recentPassword').val('');
        $('#newPassword').val('');
        $('#reNewPassword').val('');
        document.getElementById('userPrivacyBtn').click();
    });

    $('#changePassword').off('click').on('click', function () {
        const recentPassword = $('#recentPassword').val();
        const newPassword = $('#newPassword').val();
        const reNewPassword = $('#reNewPassword').val();

        if (newPassword !== reNewPassword) {
            alert('New password does not match.');
            return;
        }

        const account = { Email_A: userEmail, Password: reNewPassword };

        $.ajax({
            type: 'POST',
            url: '/Employee/UpdateAccount',
            data: JSON.stringify(account),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    alert('Password changed successfully');
                    $('#changePasswordModal').modal('hide');
                } else {
                    alert('Error changing password');
                }
            },
            error: function () {
                alert('Error changing password');
            }
        });
    });

    /*Show the whole employee list*/
    function refreshEmployeeList() {
        $.ajax({
            url: '/Employee/GetEmployeeList',
            type: 'GET',
            success: function (data) {
                $('#employeeTableBody').html(data);
                columnDefault();
                resetTableSorting();
                sortTable(1, false);
                bindSortingEvent();
                searchTableList();
                $("#button-header").load(location.href + " #button-header");
                displayTable();
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
    $(document).off('click', '.view-employee').on('click', '.view-employee', function () {
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
    $(document).off('click', '.edit-employee').on('click', '.edit-employee', function () {
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

    $(document).off('click', '#usermenu-edit').on('click', '#usermenu-edit', function () {
        let userID = sessionStorage.getItem('userID');
        let employeeID = userID;
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
    })

    function imageUpdateChange (fileId, avaId) {
        document.getElementById(fileId).onchange = function () {
            let reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById(avaId).src = e.target.result; // get loaded data and render thumbnail.
            };
            reader.readAsDataURL(this.files[0]); // read the image file as a data URL.
        };
    }

    $('#editEmployeeForm').off('submit').on('submit', function (e) {
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
                buttonMultiple();
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
        let menuBulkAction = document.getElementById("menuBulkAction");
        menuBulkAction.classList.toggle("show");

        // Check if the dropdown is not visible and remove focus from the button
        if (!menuBulkAction.classList.contains('show')) {
            this.blur();
        }
    }

    function buttonMultiple() {
        $('#btn-multiple').off('click').on('click', function () {
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
    }

    buttonMultiple();

    // Select All & Unselect All
    $('.select-all').off('click').on('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
    });
    $('.unselect-all').off('click').on('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    $(document).off('click', '.row-dup-checkbox-all').on('click', '.row-dup-checkbox-all', function () {
        const isChecked = this.checked;
        document.querySelectorAll('.row-dup-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
    $(document).off('click', '.row-dup-checkbox').on('click', '.row-dup-checkbox', function () {
        const allCheckboxes = document.querySelectorAll('.row-dup-checkbox:checked').length === document.querySelectorAll('.row-dup-checkbox').length;
        document.querySelector('.row-dup-checkbox-all').checked = allCheckboxes;
    });

    // Close the dropdown if the user clicks outside of it
    window.onclick = function (event) {
        if (!event.target.matches('.dropdown-bulk-action')) {
            let dropdowns = document.getElementsByClassName("bulk-action-menu");
            for (let i = 0; i < dropdowns.length; i++) {
                let openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    // Remove focus from the button when dropdown is closed
                    document.getElementById("dropdownBulkAction").blur();
                }
            }
        }
    }

    //Hide import/export options when clicking outside
    document.addEventListener('click', function (event) {
        const input = document.getElementById('import-file');
        const importDiv = document.querySelector('.import__file');

        if (!importDiv.contains(event.target)) {
            input.checked = false;
        }
    });

    document.addEventListener('click', function (event) {
        const input = document.getElementById('export-file');
        const exportDiv = document.querySelector('.export__file');

        if (!exportDiv.contains(event.target)) {
            input.checked = false;
        }
    });

    document.addEventListener('click', function (event) {
        const input = document.getElementById('user-menu');
        const exportDiv = document.querySelector('.usermenu');

        if (!exportDiv.contains(event.target)) {
            input.checked = false;
        }
    });


    // Bulk Delete Employee
    $('.bulk-del').off('click').on('click', function (e) {
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
        $('#createEmployeeModalBtn').off('click').on('click', function () {
            $('#createEmployeeModal').modal('show');
        });
    });
    $('#closeCreateModalBtn').off('click').on('click', function () {
        clearCreateForm();
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
                let middleName = $('#middleName').val();
                let lastName = $('#lastName').val();
                let id = $('#employeeID').val();

                let fullName = firstName + ' ' + (middleName ? middleName + ' ' : '') + lastName;

                let userID = sessionStorage.getItem('userID');
                if (!userID) {
                    sessionStorage.setItem('userFullName', fullName);
                    sessionStorage.setItem('userID', id);
                    sessionStorage.setItem('lastActivity', Date.now());
                    checkUserActivity();
                }
                $('#createSuccess').modal('show');
                $('#createSuccess .modal-body h4').text(fullName + ' (' + id + ')');
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

    function clearCreateForm() {
        document.getElementById('createEmployeeForm').reset();
        document.getElementById('avatarImage').src = "/hr_images/avatar/ava-default.png";
        document.getElementById('imageFile').value = "";
        document.getElementById("createDpPs").querySelector("#positionLabel").hidden = true;
        document.getElementById("createDpPs").querySelector("#positionName").hidden = true;
        document.querySelector('.id-right').hidden = true;
        document.querySelector('.id-wrong').hidden = true;
    }

    $(document).off('click', '#createEmployeeForm .btn-clear').on('click', '#createEmployeeForm .btn-clear', function () {
        clearCreateForm();
    });
    $('#employeeID').on('input', function () {
        iDCheck();
    });

    function iDCheck() {
        const currentId = $('#createEmployeeForm [name=employeeID]').val();
        if (currentId !== null && currentId !== "") {
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
        } else {
            document.querySelector('.id-right').hidden = true;
            document.querySelector('.id-wrong').hidden = true;
        }
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

    sortTable(1, false);
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
    const eUploadBtn = $('#uploadEmpFile');
    const eFileInput = $('#employeeFile');
    let nonDuplicates = [];

    eUploadBtn.off('click').on('click', function () {
        eFileInput.trigger('click');
    });

    eFileInput.off('change').on('change', function () {
        const input = document.getElementById('import-file');
        input.checked = false;
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
                    $('#importEmployeesSuccess').modal('show');
                    refreshEmployeeList();
                } else {
                    if (data.duplicates) {
                        nonDuplicates = data.nonDuplicates;
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
        this.value = "";
    });

    //View Duplication
    $(document).off('click', '.view-dup-employee').on('click', '.view-dup-employee', function () {
        let employeeDupId = $(this).data('dup-employee-id');
        let dupFullName = $(this).closest('tr').find('.employee-dup-fullname').text();
        let dupGender = $(this).closest('tr').find('.employee-dup-gender').text();
        let dupDateOfBirth = $(this).closest('tr').find('.employee-dup-dateofbirth').text();
        let dupPhoneNumber = $(this).closest('tr').find('.employee-dup-phonenumber').text();
        let dupEmail = $(this).closest('tr').find('.employee-dup-email').text();
        let dupDepartmentName = $(this).closest('tr').find('.employee-dup-departmentname').text();
        let dupPositionName = $(this).closest('tr').find('.employee-dup-positionname').text();
        let dupLocalAddress = $(this).closest('tr').find('.employee-dup-localaddress').text();
        let dupStartDate = $(this).closest('tr').find('.employee-dup-startdate').text();
        let dupEndDate = $(this).closest('tr').find('.employee-dup-enddate').text();

        $.ajax({
            url: '/Employee/GetEmployeeFromId',
            type: 'GET',
            data: { id: employeeDupId },
            success: function (data) {
                const fullName = data.firstName + " " + (data.middleName ? data.middleName + " " : "") + data.lastName;

                const dOB = data.dateOfBirth ? new Date(data.dateOfBirth) : "";
                const sD = data.startDate ? new Date(data.startDate) : "";
                const eD = data.endDate ? new Date(data.endDate) : "";

                const formatDate = (date) => {
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${month}/${day}/${year}`;
                };

                const dateOfBirth = dOB ? formatDate(dOB) : "";
                const startDate = sD ? formatDate(sD) : "";
                const endDate = eD ? formatDate(eD) : "";

                if (fullName !== dupFullName) {
                    $('.id-dup-fullname').addClass('dup-different');
                };
                $('.id-original-fullname').text(fullName);
                if (data.gender !== dupGender) {
                    $('.id-dup-gender').addClass('dup-different');
                };
                $('.id-original-gender').text(data.gender);
                if (dateOfBirth !== dupDateOfBirth) {
                    $('.id-dup-dateofbirth').addClass('dup-different');
                };
                $('.id-original-dateofbirth').text(dateOfBirth);
                if (data.phoneNumber !== dupPhoneNumber) {
                    $('.id-dup-phonenumber').addClass('dup-different');
                };
                $('.id-original-phonenumber').text(data.phoneNumber);
                if (data.email !== dupEmail) {
                    $('.id-dup-email').addClass('dup-different');
                };
                $('.id-original-email').text(data.email);
                if (data.departmentName !== dupDepartmentName) {
                    $('.id-dup-departmentname').addClass('dup-different');
                };
                $('.id-original-departmentname').text(data.departmentName);
                if (data.positionName !== dupPositionName) {
                    $('.id-dup-positionname').addClass('dup-different');
                };
                $('.id-original-positionname').text(data.positionName);
                if (data.localAddress !== dupLocalAddress) {
                    $('.id-dup-localaddress').addClass('dup-different');
                };
                $('.id-original-localaddress').text(data.localAddress);
                if (startDate !== dupStartDate) {
                    $('.id-dup-startdate').addClass('dup-different');
                };
                $('.id-original-startdate').text(startDate);
                if (endDate !== dupEndDate) {
                    $('.id-dup-enddate').addClass('dup-different');
                };
                $('.id-original-enddate').text(endDate);
            },
            error: function () {
                let errorMessage = 'An error occurred while retrieving employee details.';
            }
        });
        $('.id-dup-properties h4 strong').text(employeeDupId);
        $('.id-dup-fullname').text(dupFullName);
        $('.id-dup-gender').text(dupGender);
        $('.id-dup-dateofbirth').text(dupDateOfBirth);
        $('.id-dup-phonenumber').text(dupPhoneNumber);
        $('.id-dup-email').text(dupEmail);
        $('.id-dup-departmentname').text(dupDepartmentName);
        $('.id-dup-positionname').text(dupPositionName);
        $('.id-dup-localaddress').text(dupLocalAddress);
        $('.id-dup-startdate').text(dupStartDate);
        $('.id-dup-enddate').text(dupEndDate);
        $('#employeeDuplicationModal').modal('show');

        $('.btn-dup-close').off('click').on('click', function () {
            $('.id-dup-fullname').removeClass('dup-different');
            $('.id-dup-gender').removeClass('dup-different');
            $('.id-dup-dateofbirth').removeClass('dup-different');
            $('.id-dup-phonenumber').removeClass('dup-different');
            $('.id-dup-email').removeClass('dup-different');
            $('.id-dup-departmentname').removeClass('dup-different');
            $('.id-dup-positionname').removeClass('dup-different');
            $('.id-dup-localaddress').removeClass('dup-different');
            $('.id-dup-startdate').removeClass('dup-different');
            $('.id-dup-enddate').removeClass('dup-different');
        })
    });

    $(document).off('click', "#updateSelectedEmployeesBtn").on('click', "#updateSelectedEmployeesBtn", function () {
        let selectedEmployeeIDs = $(".row-dup-checkbox:checked").map(function () {
            return $(this).val();
        }).get();

        let employeesToUpdate = [];
        let completedRequests = 0;
        if (selectedEmployeeIDs.length > 0) {
            selectedEmployeeIDs.forEach(function (id) {
                $.ajax({
                    url: '/Employee/GetEmployeeFromId',
                    type: 'GET',
                    data: { id: id },
                    success: function (data) {
                        let $row = $('.emp-dup-row').has('input[value="' + id + '"]');
                        let avatarName = $row.find('.employee-dup-avatarname').text();
                        if (!avatarName.trim()) {
                            avatarName = data.avatarName;
                        } else {
                            avatarName = '/hr_images/avatar/' + avatarName;
                        }
                        // Check if the date is null or in an invalid format
                        let dateOfBirth = $row.find('.employee-dup-dateofbirth').text();
                        let startDate = $row.find('.employee-dup-startdate').text();
                        let endDate = $row.find('.employee-dup-enddate').text();

                        if (!isNaN(Date.parse(dateOfBirth))) {
                            dateOfBirth = new Date(dateOfBirth).toISOString();
                        } else {
                            dateOfBirth = null; // or handle the invalid date as needed
                        }

                        if (!isNaN(Date.parse(startDate))) {
                            startDate = new Date(startDate).toISOString();
                        } else {
                            startDate = null; // or handle the invalid date as needed
                        }

                        if (!isNaN(Date.parse(endDate))) {
                            endDate = new Date(endDate).toISOString();
                        } else {
                            endDate = null; // or handle the invalid date as needed
                        }

                        let employee = {
                            EmployeeID: id,
                            FirstName: $row.find('.employee-dup-firstname').text(),
                            MiddleName: $row.find('.employee-dup-middlename').text(),
                            LastName: $row.find('.employee-dup-lastname').text(),
                            Gender: $row.find('.employee-dup-gender').text(),
                            DateOfBirth: dateOfBirth,
                            PhoneNumber: $row.find('.employee-dup-phonenumber').text(),
                            Email: $row.find('.employee-dup-email').text(),
                            LocalAddress: $row.find('.employee-dup-localaddress').text(),
                            PositionID: $row.find('.employee-dup-positionid').text(),
                            StartDate: startDate,
                            EndDate: endDate,
                            AvatarName: avatarName
                        };
                        employeesToUpdate.push(employee);
                        completedRequests++;

                        if (completedRequests === selectedEmployeeIDs.length) {
                            $.ajax({
                                type: 'POST',
                                url: '/Employee/UpdateDuplicatedEmployees',
                                data: JSON.stringify({ employees: employeesToUpdate, filename: 'duplicates' }),
                                contentType: 'application/json',
                                success: function (response) {
                                    if (nonDuplicates.length > 0) {
                                        $.ajax({
                                            type: 'POST',
                                            url: '/Employee/UpdateDuplicatedEmployees',
                                            data: JSON.stringify({ employees: nonDuplicates, filename: 'nonDuplicates' }),
                                            contentType: 'application/json',
                                            success: function (response) {
                                                $('#updateDuplicateSuccess').modal('show');
                                                $('.btn-duplicate-done').off('click').on('click', function () {
                                                    $('#updateDuplicateSuccess').modal('hide');
                                                    $('#uploadDuplication').modal('hide');
                                                });
                                                refreshEmployeeList();
                                            },
                                            error: function () {
                                                alert("An error occurred. Please try again.");
                                            }
                                        });
                                    } else {
                                        $('#updateDuplicateSuccess').modal('show');
                                        $('.btn-duplicate-done').off('click').on('click', function () {
                                            $('#updateDuplicateSuccess').modal('hide');
                                            $('#uploadDuplication').modal('hide');
                                        });
                                        refreshEmployeeList();
                                    }
                                },
                                error: function () {
                                    alert("An error occurred. Please try again.");
                                }
                            });
                        }
                    },
                    error: function () {
                        alert("An error occurred while fetching employee data.");
                    }
                });
            });
        } else if (nonDuplicates.length > 0) {
            $.ajax({
                type: 'POST',
                url: '/Employee/UpdateDuplicatedEmployees',
                data: JSON.stringify({ employees: nonDuplicates, filename: 'nonDuplicates' }),
                contentType: 'application/json',
                success: function (response) {
                    $('#updateDuplicateSuccess').modal('show');
                    $('.btn-duplicate-done').off('click').on('click', function () {
                        $('#updateDuplicateSuccess').modal('hide');
                        $('#uploadDuplication').modal('hide');
                    });
                    refreshEmployeeList();
                },
                error: function () {
                    alert("An error occurred. Please try again.");
                }
            });
        } else {
            $('#uploadDuplication').modal('hide');
        }
    });

    // Download Templates
    const eTemplateBtn = document.getElementById('downloadTempFile');
    const eTemplateClick = document.getElementById('downloadTemplateFile');
    eTemplateBtn.addEventListener('click', function () {
        eTemplateClick.click();
    });

    // Upload Employee Images

    //Open Upload Image Modal
    const eIUploadBtn = $('#uploadImageFile');
    const eIFileInput = $('#uploadEmployeeImages');
    eIUploadBtn.off('click').on('click', function () {
        eIFileInput.trigger('click');
    });

    //Upload Folder
    const eIUploadFolder = $('#uploadImageFolder');
    eIUploadFolder.off('change').on('change', function (event) {
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

    const eIUploadZip = $('#zipimageFilesInput');
    eIUploadZip.off('change').on('change', function (event) {
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

    const empTable = document.getElementById('emp-index-table-main');
    //Export Employee Data To PDF

    const exportToPDF = (empTable, columns) => {
        let clonedTable = empTable.cloneNode(true);
        let clonedTableBody = clonedTable.querySelector("#employeeTableBody");
        let selectedColumns = [];

        clonedTable.querySelectorAll("td, th").forEach(cell => {
            cell.style.display = "none";
        });

        columns.forEach(columnClass => {
            let firstCell = clonedTableBody.querySelector(`.${columnClass}`);
            if (firstCell) {
                let headerTitle = firstCell.getAttribute('data-title');
                selectedColumns.push({ class: columnClass, title: headerTitle });
            }
        });

        let idOrder = clonedTableBody.querySelectorAll('[id^="employee-"]');
        let classOrder = [];
        for (let i = 0; i < idOrder.length; i++) {
            let idC = idOrder[i].id;
            idC = idC.replace(/-td/g, '');
            if (!classOrder.includes(idC)) {
                classOrder.push(idC);
            }
        }

        let selectedColumnsInOrder = [];
        classOrder.forEach(column => {
            let checkColumn = selectedColumns.find(e => e.class === column);
            if (checkColumn) {
                selectedColumnsInOrder.push({ class: column, title: checkColumn.title });
            }
        });

        let newTableHeader = document.createElement("thead");
        let newTableRow = document.createElement("tr");
        selectedColumnsInOrder.forEach(column => {
            let newHeaderCell = document.createElement("th");
            newHeaderCell.textContent = column.title;
            newTableRow.appendChild(newHeaderCell);
        });
        newTableHeader.appendChild(newTableRow);
        clonedTable.insertBefore(newTableHeader, clonedTableBody);

        selectedColumnsInOrder.forEach(column => {
            clonedTable.querySelectorAll(`.${column.class}`).forEach(cell => {
                cell.style.display = "table-cell";
            });
        });

        const html_code = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Employee Data</title>
            <style>
            @media print {
                table, table td, table th {
                    border: 1px solid #000;
                    border-collapse: collapse;
                }
                table {
                    width: 100%;
                }
                table th, td {
                    padding: 2px 1px;
                }
                .employee-firstname, .employee-middlename, .employee-lastname, .employee-fullname, .employee-localaddress {
                    padding: 2px 0px 2px 10px !important;
                }
                .employee-id, .employee-gender, .employee-dateofbirth, .employee-phonenumber, .employee-email, .employee-departmentname, .employee-positionname, .employee-startdate, .employee-enddate {
                    text-align: center;
                }
            }
            </style>
        </head>
        <body>
            <table id="emp-index-table-main" class="tablehead"">${clonedTable.innerHTML}</table>
        </body>
        </html>`;

        const pdfWindow = window.open("", "PDF_Window", "width=800,height=600,left=100,top=100,resizable,scrollbars");
        pdfWindow.document.write(html_code);
        pdfWindow.document.close();


        pdfWindow.onload = () => {
            setTimeout(() => {
                if (!pdfWindow.closed) {
                    pdfWindow.focus();
                    pdfWindow.print();
                    pdfWindow.close();
                }
            }, 250);
        };
    };

    document.getElementById('toPDF').addEventListener('click', () => {
        columnDefault();
        document.querySelector('.columnToggle[value="employee-fullname"]').parentElement.style.display = "";
        $('#exportWarnings').modal({
            keyboard: false,
            backdrop: 'static'
        });
        $('#exportWarnings').modal('show');
        $('#continue-export-btn').one('click', function () {
            $('#selectColumnModal').modal({
                keyboard: false,
                backdrop: 'static'
            });
            $('#selectColumnModal').modal('show');
            $('#select-column-done-btn').one('click', function () {
                let columns = Array.from(document.querySelectorAll('.columnToggle:checked')).map(el => el.value);
                exportToPDF(empTable, columns);
            });
        });
    });

    //Export EXCEL

    //const exportToXLS = (empTable, columns) => {
    //    let clonedTable = empTable.cloneNode(true);
    //    let selectedColumns = [];

    //    columns.forEach(columnClass => {
    //        let columnId = columnClass + '-td';
    //        let firstCell = clonedTable.querySelector(`#${columnId}`);
    //        if (firstCell) {
    //            let headerTitle = firstCell.getAttribute('data-title');
    //            selectedColumns.push({ id: columnId, title: headerTitle });
    //        }
    //    });

    //    let idOrder = clonedTable.querySelectorAll('[id^="employee-"]');
    //    let unSelectedColumns = [];
    //    let selectedColumnsInOrder = [];
    //    for (let i = 0; i < idOrder.length; i++) {
    //        let idC = idOrder[i].id;
    //        if (!selectedColumns.find(e => e.id === idC) && !unSelectedColumns.includes(idC)) {
    //            unSelectedColumns.push(idC);
    //        } else if (selectedColumns.find(e => e.id === idC) && !selectedColumnsInOrder.find(e => e.id === idC)) {
    //            let headerTitle = idOrder[i].getAttribute('data-title');
    //            selectedColumnsInOrder.push({ id: idC, title: headerTitle });
    //        }
    //    }

    //    while (clonedTable.querySelector('[id="index-row-check"]')) {
    //        clonedTable.querySelector('[id="action-in-table"]').remove();
    //        clonedTable.querySelector('[id="index-row-check"]').remove();
    //    }

    //    unSelectedColumns.forEach(id => {
    //        while (clonedTable.querySelector(`#${id}`)) {
    //            clonedTable.querySelector(`#${id}`).remove();
    //        }
    //    });

    //    if (clonedTable.querySelector('thead')) {
    //        clonedTable.querySelector('thead').remove();
    //    }

    //    let clonedTableBody = clonedTable.querySelector("#employeeTableBody");
    //    let newTableHeader = document.createElement("thead");
    //    let newTableRow = document.createElement("tr");
    //    selectedColumnsInOrder.forEach(column => {
    //        let newHeaderCell = document.createElement("th");
    //        newHeaderCell.textContent = column.title;
    //        newTableRow.appendChild(newHeaderCell);
    //    });
    //    newTableHeader.appendChild(newTableRow);
    //    clonedTable.insertBefore(newTableHeader, clonedTableBody);


    //    const blob = new Blob([clonedTable.outerHTML], { type: 'application/vnd.ms-excel' });

    //    const link = document.createElement('a');
    //    link.href = URL.createObjectURL(blob);
    //    link.download = 'EmployeeData.xls';
    //    document.body.appendChild(link);
    //    link.click();
    //    document.body.removeChild(link);
    //};

    //xlsExportBtn.addEventListener('click', () => {
    //    $('#selectColumnModal').modal('show');
    //    $('#select-column-done-btn').one('click', function () {
    //        let columns = Array.from(document.querySelectorAll('.columnToggle:checked')).map(el => el.value);
    //        exportToXLS(empTable, columns);
    //    });
    //});

    function GetEmployeeFromTable(columns) {
        const o_table = document.getElementById('emp-index-table-main');
        const table = o_table.cloneNode(true);
        const rows = Array.from(document.getElementById('employeeTableBody').querySelectorAll('tr')).filter(row => row.style.display !== 'none');
        const heads = table.querySelectorAll('thead th');
        let headers = [];
        heads.forEach(head => {
            let spanTag = head.querySelector('span');
            if (spanTag) {
                head.removeChild(spanTag);
            }
            headers.push({ [head.getAttribute('data-title')]: head.textContent.trim() });
        })

        let sColumns = [];
        columns.forEach(column => {
            column = column + '-td';
            sColumns.push(table.querySelector(`#${column}`).getAttribute('data-title'));
        });

        let sColumnsInOrder = [];
        headers.forEach(header => {
            let headerVal = Object.values(header)[0];
            if (sColumns.includes(headerVal)) {
                let headerKey = Object.keys(header)[0];
                sColumnsInOrder.push({ key: headerKey, value: headerVal });
            }
        });
        const employeeList = [];

        rows.forEach(row => {
            const employee = {};
            sColumnsInOrder.forEach((column, i) => {
                const cell = row.querySelector(`td[data-title="${column.value}"]`);
                if (cell) {
                    let cellValue = cell.textContent;
                    if (['DateOfBirth', 'StartDate', 'EndDate'].includes(column.key)) {
                        if (!isNaN(Date.parse(cellValue))) {
                            const date = new Date(cellValue);
                            cellValue = date.toISOString();
                        } else {
                            cellValue = null;
                        }
                    }
                    employee[column.key] = cellValue;
                }
            });
            employeeList.push(employee);
        });
        return employeeList;
    }

    //function GetEmployeeFromTable() {
    //    const table = document.getElementById('emp-index-table-main');
    //    const rows = Array.from(document.getElementById('employeeTableBody').querySelectorAll('tr'));
    //    const heads = table.querySelectorAll('thead th');
    //    let headers = [];
    //    heads.forEach(head => {
    //        let spanTag = head.querySelector('span');
    //        if (spanTag) {
    //            head.removeChild(spanTag);
    //        }
    //        headers.push({ [head.getAttribute('data-title')]: head.textContent.trim() });
    //    });
    //    headers.shift();
    //    headers.pop();
    //    console.log(headers);
    //    let employeeList = [];
    //    rows.forEach(row => {
    //        const employee = {};
    //        headers.forEach(header => {
    //            const headerKey = Object.keys(header)[0];
    //            const headerVal = Object.values(header)[0];
    //            const cell = row.querySelector(`td[data-title="${headerVal}"]`);
    //            if (cell) {
    //                let cellValue = cell.textContent;
    //                if (['DateOfBirth', 'StartDate', 'EndDate'].includes(headerKey)) {
    //                    if (!isNaN(Date.parse(cellValue))) {
    //                        const date = new Date(cellValue);
    //                        cellValue = date.toISOString();
    //                    } else {
    //                        cellValue = null;
    //                    }
    //                }
    //                employee[headerKey] = cellValue;
    //            }
    //        });
    //        console.log(employee);
    //        employeeList.push(employee);
    //    });
    //    return employeeList;
    //}

    function employeeToCSV(empList) {
        let csvRows = [];
        let headerRow = Object.keys(empList[0]).join(',');
        csvRows.push(headerRow);

        empList.forEach(employee => {
            let row = [];
            for (let key in employee) {
                let cellValue = employee[key];
                if (["DateOfBirth", "StartDate", "EndDate"].includes(key)) {
                    if (cellValue) {
                        cellValue = new Date(cellValue).toLocaleDateString();
                    }
                }
                cellValue = `"${cellValue.replace(/"/g, '""')}"`;
                row.push(cellValue);
            }
            csvRows.push(row);
        });
        return csvRows.join('\n');
    }

    document.getElementById('toCSV').addEventListener('click', function () {
        columnDefault();
        let fullNameChecked = document.querySelector('.columnToggle[value="employee-fullname"]').checked;
        document.querySelector('.columnToggle[value="employee-fullname"]').checked = false;
        document.querySelector('.columnToggle[value="employee-fullname"]').parentElement.style.display = "none";
        $('#exportWarnings').modal({
            keyboard: false,
            backdrop: 'static'
        });
        $('#exportWarnings').modal('show');
        $('#continue-export-btn').one('click', function () {
            $('#selectColumnModal').modal({
                keyboard: false,
                backdrop: 'static'
            });
            $('#selectColumnModal').modal('show');
            $('#select-column-done-btn').one('click', function () {
                const columns = Array.from(document.querySelectorAll('.columnToggle:checked')).map(el => el.value);
                let sColumns = [];
                columns.forEach(column => {
                    column = 'th-' + column;
                    sColumns.push(document.getElementById('emp-index-table-main').querySelector(`#${column}`).getAttribute('data-title'));
                });
                const csvEmpList = GetEmployeeFromTable(columns);
                const csvData = employeeToCSV(csvEmpList);
                const csvBlob = new Blob([csvData], { type: 'text/csv' });
                const csvUrl = URL.createObjectURL(csvBlob);

                const link = document.createElement('a');
                link.href = csvUrl;
                link.download = 'EmployeeData.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(csvUrl);

                document.querySelector('.columnToggle[value="employee-fullname"]').checked = fullNameChecked;
                columnDefault();
            });
        });
    });

    document.getElementById('toXLS').addEventListener('click', function () {
        columnDefault();
        let fullNameChecked = document.querySelector('.columnToggle[value="employee-fullname"]').checked;
        document.querySelector('.columnToggle[value="employee-fullname"]').checked = false;
        document.querySelector('.columnToggle[value="employee-fullname"]').parentElement.style.display = "none";
        $('#exportWarnings').modal({
            keyboard: false,
            backdrop: 'static'
        });
        $('#exportWarnings').modal('show');
        $('#continue-export-btn').one('click', function () {
            $('#selectColumnModal').modal({
                keyboard: false,
                backdrop: 'static'
            });
            $('#selectColumnModal').modal('show');
            $('#select-column-done-btn').one('click', function () {
                const columns = Array.from(document.querySelectorAll('.columnToggle:checked')).map(el => el.value);
                let sColumns = [];
                columns.forEach(column => {
                    column = 'th-' + column;
                    sColumns.push(document.getElementById('emp-index-table-main').querySelector(`#${column}`).getAttribute('data-title'));
                });
                exportExcel(GetEmployeeFromTable(columns), 'EmployeeData.xls', sColumns);
                document.querySelector('.columnToggle[value="employee-fullname"]').checked = fullNameChecked;
                columnDefault();
            });
        });
    });
    document.getElementById('toXLSX').addEventListener('click', function () {
        columnDefault();
        document.querySelector('.columnToggle[value="employee-fullname"]').checked = false;
        document.querySelector('.columnToggle[value="employee-fullname"]').parentElement.style.display = "none";
        $('#exportWarnings').modal({
            keyboard: false,
            backdrop: 'static'
        });
        $('#exportWarnings').modal('show');
        $('#continue-export-btn').one('click', function () {
            $('#selectColumnModal').modal({
                keyboard: false,
                backdrop: 'static'
            });
            $('#selectColumnModal').modal('show');
            $('#select-column-done-btn').one('click', function () {
                const columns = Array.from(document.querySelectorAll('.columnToggle:checked')).map(el => el.value);
                let sColumns = [];
                columns.forEach(column => {
                    column = 'th-' + column;
                    sColumns.push(document.getElementById('emp-index-table-main').querySelector(`#${column}`).getAttribute('data-title'));
                });
                exportExcel(GetEmployeeFromTable(columns), 'EmployeeData.xlsx', sColumns);
                document.querySelector('.columnToggle[value="employee-fullname"]').checked = fullNameChecked;
                columnDefault();
            });
        });
    });

    function columnDefault() {
        let visibleColumns = $("#emp-index-table-main thead th:visible");
        $('.column-options').find('input').prop('checked', false);
        visibleColumns.each(function () {
            let columnClass = '';
            // Check if the element exists before trying to access its properties
            if ($(this).attr('id')) {
                columnClass = $(this).attr('id').replace('th-', '');
            }
            $('.column-options').find(`input[value="${columnClass}"]`).prop('checked', true);
        });
    }
    columnDefault();

    function displayTable() {
        const columns = Array.from(document.querySelectorAll('.columnToggle:checked')).map(el => el.value);
        $('#employeeTableBody').find('td[id^="employee-"]').attr('hidden', true);
        $('#emp-index-table-main').find('th[id^="th-"]').attr('hidden', true);
        columns.forEach(column => {
            let columnTh = 'th-' + column;
            let columnTd = column + '-td';
            $('#emp-index-table-main').find(`th[id="${columnTh}"]`).removeAttr('hidden');
            $('#employeeTableBody').find(`td[id="${columnTd}"]`).removeAttr('hidden');
        });
    }

    document.getElementById('columnSelect').addEventListener('click', function () {
        document.querySelector('.columnToggle[value="employee-fullname"]').parentElement.style.display = "";
        columnDefault();
        $('#select-column-done-btn').one('click', function () {
            displayTable();
        });
    });
    function exportExcel(empList, filename, columns) {
        $.ajax({
            url: '/Employee/ExportToExcel',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ employees: empList, filename: filename, columns: columns }),
            success: function (data) {
                downloadExcel(data);
            },
            error: function () {
                alert('Error exporting');
            }
        });
    }

    function downloadExcel(filePath) {
        var link = document.createElement('a');
        link.href = '/Employee/DownloadExcelFile?filePath=' + encodeURIComponent(filePath);
        link.download = filePath.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

function signUp() {
    var email = $("#signemail").val();
    var password = $("#signpassword").val();
    var repassword = $("#signrepassword").val();

    if (password != repassword) {
        alert("Passwords do not match!");
        return;
    }

    $.ajax({
        type: "GET",
        url: "/Employee/GetEmployeeFromEmail?email=" + email,
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            if (response.error) {
                var account = {
                    Email_A: email,
                    Password: repassword
                };
                $.ajax({
                    type: "POST",
                    url: "/Employee/CreateAccount",
                    data: JSON.stringify(account),
                    contentType: "application/json",
                    success: function (response) {
                        if (response.success) {
                            sessionStorage.setItem('userEmail', email);
                            sessionStorage.setItem('lastActivity', Date.now());

                            $('#signUpSuccess').modal('show');
                            $('#signUpSuccessClose').off('click').on('click', function () {
                                window.location.href = 'Index';
                            });
                            
                        } else {
                            alert("Account creation failed: " + response.message);
                        }
                    },
                    failure: function (response) {
                        alert("Account creation failed: " + response.message);
                    },
                    error: function (response) {
                        alert("Account creation failed: " + response.message);
                    }
                });
            } else {
                alert("Account with this email already exists!");
            }
        },
        failure: function (response) {
            alert("Account creation failed: " + response.message);
        },
        error: function (response) {
            alert("Account creation failed: " + response.message);
        }
    });
};

function signIn() {
    var email = $("#logemail").val();
    var password = $("#logpass").val();
    var account = {Email_A: email, Password: password};

    $.ajax({
        type: "POST",
        url: "/Employee/Login",
        contentType: "application/json",
        data: JSON.stringify(account),
        success: function (response) {
            if (response.success) {
                if (response.employee !== null) {
                    employeeSignIn = response.employee;

                    sessionStorage.setItem('userFullName', response.employee.fullName);
                    sessionStorage.setItem('userID', response.employee.employeeID);
                    sessionStorage.setItem('userEmail', response.employee.email);
                } else {
                    sessionStorage.setItem('userEmail', email);
                }

                // Set a timestamp for the user's last activity
                sessionStorage.setItem('lastActivity', Date.now());

                window.location.href = 'Index';
            } else {
                alert(response.message);
            }
        },
        failure: function (response) {
            alert("Login failed: " + response.message);
        },
        error: function (response) {
            alert("Login failed: " + response.message);
        }
    });
};

function redirectToHR() {
    const userFullName = sessionStorage.getItem('userFullName');
    if (userFullName) {
        window.location.href = '/Employee/Index';
    } else {
        window.location.href = '/Employee/Login';
    }
}