using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ManagerWebApplication.Models
{
    public class Employee
    {
        [Key]
        [DisplayName("Employee ID")]
        [Required]
        public string EmployeeID { get; set; }

        [DisplayName("First Name")]
        [Required]
        public string? FirstName { get; set; }

        [DisplayName("Middle Name")]
        public string? MiddleName { get; set; }

        [DisplayName("Last Name")]
        [Required]
        public string? LastName { get; set; }

        [DisplayName("Gender")]
        public string? Gender { get; set; }

        [DisplayName("Date Of Birth")]
        public DateTime? DateOfBirth { get; set; }

        [DisplayName("Phone Number")]
        public string? PhoneNumber { get; set; }

        [DisplayName("Email")]
        public string? Email { get; set; }

        [DisplayName("Local Address")]
        public string? LocalAddress { get; set; }

        [DisplayName("Position ID")]
        public string? PositionID { get; set; }

        [DisplayName("Position")]
        public string? PositionName { get; set; }

        [DisplayName("Department ID")]
        public string? DepartmentID { get; set; }

        [DisplayName("Department")]
        public string? DepartmentName { get; set; }

        [DisplayName("Start Date")]
        public DateTime? StartDate { get; set; }

        [DisplayName("End Date")]
        public DateTime? EndDate { get; set; }

        public Employee()
        {
            AvatarName = ""; // Initialize UrlImage with an empty string
        }
        [DisplayName("Avatar Name")]
        public string? AvatarName { get; set; }

        [NotMapped]
        [DisplayName("Full Name")]
        public string? FullName
        {
            get { 
                if (MiddleName != null)
                {
                    return FirstName + " " + MiddleName + " " + LastName;
                } else
                {
                    return FirstName + " " + LastName;
                }
            }
        }
    }

    public class EmployeeSubModel
    {
        public List<Employee>? Employees { get; set; }
        public string? Filename { get; set; }
        public List<string>? Columns { get; set; }
    }

    public class EmployeeAccount
    {
        [Required]
        [EmailAddress]
        [DisplayName("Email")]
        public string? Email_A { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [DisplayName("Password")]
        public string? Password { get; set; }

        [DisplayName("Remember me?")]
        public bool RememberMe { get; set; }
    }

    public class EmployeeDepartment
    {
        public string? DepartmentID { get; set; }
        public string? DepartmentName { get; set; }
    }
}
