//showCreateEmployee();

//$('#employeeID').on('input', function () {
//    iDCheck();
//});

//function iDCheck() {
//    const currentId = $('#createEmployeeAfterSignupForm [name=employeeID]').val();
//    if (currentId !== null && currentId !== "") {
//        $.ajax({
//            url: '/Employee/GetEmployeeDetails',
//            type: 'GET',
//            data: { id: currentId },
//            success: function (response) {
//                if (response.error) {
//                    document.querySelector('.id-right').hidden = false;
//                    document.querySelector('.id-wrong').hidden = true;
//                }
//                else {
//                    document.querySelector('.id-right').hidden = true;
//                    document.querySelector('.id-wrong').hidden = false;
//                }
//            },
//            error: function () {
//                document.querySelector('.id-right').hidden = true;
//                document.querySelector('.id-wrong').hidden = true;
//            }
//        });
//    } else {
//        document.querySelector('.id-right').hidden = true;
//        document.querySelector('.id-wrong').hidden = true;
//    }
//}
//function getDepartments() {
//    let departmentDropdown = document.getElementById('createDpPsAfterSignup').querySelector("#departmentName");
//    departmentDropdown.innerHTML = "";
//    $.ajax({
//        type: "GET",
//        url: "/Employee/GetDepartments",
//        contentType: "application/json",
//        dataType: "json",
//        success: function (data) {

//            let defaultOption = document.createElement("option");
//            defaultOption.value = "";
//            defaultOption.style = "color: gray"
//            defaultOption.text = "Select...";
//            departmentDropdown.appendChild(defaultOption);

//            data.forEach(department => {
//                let option = document.createElement("option");
//                option.value = department.departmentID;
//                option.text = department.departmentName;
                
//                departmentDropdown.appendChild(option);
//            });
//        },
//    })
//}

//function getPositionsbyDepartment() {
//    document.getElementById('createDpPsAfterSignup').querySelector("#positionLabel").hidden = true;
//    document.getElementById('createDpPsAfterSignup').querySelector("#positionName").hidden = true;
//    document.getElementById('createDpPsAfterSignup').querySelector("#departmentName").onchange = function () {
//        let departmentID = this.value;
//        let positionDropdown = document.getElementById('createDpPsAfterSignup').querySelector("#positionName");
//        positionDropdown.innerHTML = "";

//        if (departmentID !== "") {
//            $.ajax({
//                url: '/Employee/GetPositionsByDepartment?departmentID=' + departmentID,
//                type: 'GET',
//                success: function (data) {
//                    document.getElementById('createDpPsAfterSignup').querySelector("#positionLabel").hidden = false;
//                    document.getElementById('createDpPsAfterSignup').querySelector("#positionName").hidden = false;

//                    let defaultOption = document.createElement("option");
//                    defaultOption.value = "";
//                    defaultOption.style = "color: gray"
//                    defaultOption.text = "Select...";
//                    positionDropdown.appendChild(defaultOption);

//                    data.forEach(position => {
//                        let option = document.createElement("option");
//                        option.value = position.positionID;
//                        option.text = position.positionName;

//                        positionDropdown.appendChild(option);
//                    });
//                },
//                error: function (error) {
//                    console.log(error);
//                }
//            });
//        } else {
//            document.getElementById('createDpPsAfterSignup').querySelector("#positionLabel").hidden = true;
//            document.getElementById('createDpPsAfterSignup').querySelector("#positionName").hidden = true;
//        }
//    }
//}

//function getGendersOptions() {
//    let genderDropdown = document.getElementById('genderCreateAfterSignup');
//    let genderOptions = [
//        { label: "Male", value: "Male" },
//        { label: "Female", value: "Female" },
//        { label: "Other", value: "Other" }
//    ];

//    while (genderDropdown.options.length > 0) {
//        genderDropdown.remove(0);
//    }

//    let defaultGender = document.createElement("option");
//    defaultGender.value = "";
//    defaultGender.style = "color: gray"
//    defaultGender.text = "Select...";
//    genderDropdown.appendChild(defaultGender);


//    genderOptions.forEach(option => {
//        let genderDropdownOption = document.createElement("option");
//        genderDropdownOption.value = option.value;
//        genderDropdownOption.text = option.label;

//        genderDropdown.appendChild(genderDropdownOption);
//    });
//}
//function showCreateEmployee() {
//    getDepartments();
//    getPositionsbyDepartment();
//    getGendersOptions();
//};