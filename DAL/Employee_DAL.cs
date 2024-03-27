using ManagerWebApplication.Models;
using Npgsql;
using System.Reflection;
using System.ComponentModel;
using ExcelDataReader;
using System.Data;
using System.Text.RegularExpressions;
using NPOI.SS.UserModel;
using NPOI.HSSF.UserModel;
using NPOI.XSSF.UserModel;

namespace ManagerWebApplication.DAL
{
    public class Employee_DAL
    {
        private readonly string? _connectionString;

        public Employee_DAL(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("conn");
        }

        public List<Employee> GetAllEmployees()
        {
            List<Employee> employeeList = new List<Employee>();

            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetEmployee()";

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        Employee employee = new Employee();
                        employee.EmployeeID = reader["EmployeeID"].ToString();
                        employee.FirstName = reader["FirstName"].ToString();
                        employee.MiddleName = reader["MiddleName"].ToString();
                        employee.LastName = reader["LastName"].ToString();
                        employee.Gender = reader["Gender"].ToString();
                        DateTime tempDate;

                        DateTime? dateOfBirth = DateTime.TryParse(reader["DateOfBirth"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.DateOfBirth = dateOfBirth;
                        employee.PhoneNumber = reader["PhoneNumber"].ToString();
                        employee.Email = reader["Email"].ToString();
                        employee.LocalAddress = reader["LocalAddress"].ToString();
                        employee.PositionID = reader["PositionID"].ToString();
                        employee.PositionName = reader["PositionName"].ToString();
                        employee.DepartmentID = reader["DepartmentID"].ToString();
                        employee.DepartmentName = reader["DepartmentName"].ToString();
                        DateTime? startDate = DateTime.TryParse(reader["StartDate"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.StartDate = startDate;
                        DateTime? endDate = DateTime.TryParse(reader["EndDate"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.EndDate = endDate;
                        employee.AvatarName = reader["AvatarName"].ToString();
                        employeeList.Add(employee);
                    }
                }
            }

            return employeeList;
        }

        public Employee? GetEmployeeByID(string id)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetbyID(@ID)";
                    command.Parameters.AddWithValue("ID", id);

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    if (reader.Read())
                    {
                        Employee employee = new Employee();
                        employee.EmployeeID = reader["EmployeeID"].ToString();
                        employee.FirstName = reader["FirstName"].ToString();
                        employee.MiddleName = reader["MiddleName"].ToString();
                        employee.LastName = reader["LastName"].ToString();
                        employee.Gender = reader["Gender"].ToString();
                        DateTime tempDate;

                        DateTime? dateOfBirth = DateTime.TryParse(reader["DateOfBirth"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.DateOfBirth = dateOfBirth;
                        employee.PhoneNumber = reader["PhoneNumber"].ToString();
                        employee.Email = reader["Email"].ToString();
                        employee.LocalAddress = reader["LocalAddress"].ToString();
                        employee.PositionID = reader["PositionID"].ToString();
                        employee.PositionName = reader["PositionName"].ToString();
                        employee.DepartmentID = reader["DepartmentID"].ToString();
                        employee.DepartmentName = reader["DepartmentName"].ToString();
                        DateTime? startDate = DateTime.TryParse(reader["StartDate"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.StartDate = startDate;
                        DateTime? endDate = DateTime.TryParse(reader["EndDate"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.EndDate = endDate;
                        employee.AvatarName = !string.IsNullOrEmpty(reader["AvatarName"].ToString()) ? reader["AvatarName"].ToString() : "/hr_images/avatar/ava-default.png";

                        return employee;
                    }
                }
            }

            return null;
        }

        public Employee? GetEmployeeByEmail(string email)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetbyEmail(@Email)";
                    command.Parameters.AddWithValue("Email", email);

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    if (reader.Read())
                    {
                        Employee employee = new Employee();
                        employee.EmployeeID = reader["EmployeeID"].ToString();
                        employee.FirstName = reader["FirstName"].ToString();
                        employee.MiddleName = reader["MiddleName"].ToString();
                        employee.LastName = reader["LastName"].ToString();
                        employee.Gender = reader["Gender"].ToString();
                        DateTime tempDate;

                        DateTime? dateOfBirth = DateTime.TryParse(reader["DateOfBirth"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.DateOfBirth = dateOfBirth;
                        employee.PhoneNumber = reader["PhoneNumber"].ToString();
                        employee.Email = reader["Email"].ToString();
                        employee.LocalAddress = reader["LocalAddress"].ToString();
                        employee.PositionID = reader["PositionID"].ToString();
                        employee.PositionName = reader["PositionName"].ToString();
                        employee.DepartmentID = reader["DepartmentID"].ToString();
                        employee.DepartmentName = reader["DepartmentName"].ToString();
                        DateTime? startDate = DateTime.TryParse(reader["StartDate"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.StartDate = startDate;
                        DateTime? endDate = DateTime.TryParse(reader["EndDate"].ToString(), out tempDate) ? tempDate : (DateTime?)null;
                        employee.EndDate = endDate;
                        employee.AvatarName = !string.IsNullOrEmpty(reader["AvatarName"].ToString()) ? reader["AvatarName"].ToString() : "/hr_images/avatar/ava-default.png";

                        return employee;
                    }
                }
            }

            return null;
        }

        public int GetEmployeeAccountByEmail(EmployeeAccount account)
        {
            int count = 0;
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT GetAccountbyEmail(@Email)";
                    command.Parameters.AddWithValue("Email", account.Email_A ?? (object)DBNull.Value);

                    using (NpgsqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            count = reader.GetInt32(0);
                        }
                    }
                }
            }
            return count;
        }

        public int GetAccountLogin(EmployeeAccount account)
        {
            int count = 0;
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT GetAccount(@Email, @Password)";
                    command.Parameters.AddWithValue("Email", account.Email_A ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Password", account.Password ?? (object)DBNull.Value);

                    using (NpgsqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            count = reader.GetInt32(0);
                        }
                    }
                }
            }
            return count;
        }

        public void UpdateAccount(EmployeeAccount account)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT UpdateAccount(@Email, @Password)";
                    command.Parameters.AddWithValue("Email", account.Email_A ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Password", account.Password ?? (object)DBNull.Value);

                    command.ExecuteNonQuery();
                }
            }
        }

        public void DeleteEmployee(string ID)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT DeleteEmployee(@ID);";
                    command.Parameters.AddWithValue("ID", ID);

                    connection.Open();
                    command.ExecuteNonQuery();
                }
            }
        }

        public void CreateEmployee(Employee employee)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT CreateEmployee(@EmployeeID, @FirstName, @MiddleName, @LastName, @Gender, @DateOfBirth, @PhoneNumber, @Email, @LocalAddress, @PositionID, @StartDate, @EndDate, @AvatarName)";

                    command.Parameters.AddWithValue("EmployeeID", employee.EmployeeID);
                    command.Parameters.AddWithValue("FirstName", employee.FirstName ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("MiddleName", employee.MiddleName ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("LastName", employee.LastName ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Gender", employee.Gender ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("DateOfBirth", employee.DateOfBirth.HasValue ? DateOnly.FromDateTime(employee.DateOfBirth.Value) : (object)DBNull.Value);
                    command.Parameters.AddWithValue("PhoneNumber", employee.PhoneNumber ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Email", employee.Email ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("LocalAddress", employee.LocalAddress ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("PositionID", employee.PositionID ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("StartDate", employee.StartDate.HasValue ? DateOnly.FromDateTime(employee.StartDate.Value) : (object)DBNull.Value);
                    command.Parameters.AddWithValue("EndDate", employee.EndDate.HasValue ? DateOnly.FromDateTime(employee.EndDate.Value) : (object)DBNull.Value);
                    command.Parameters.AddWithValue("AvatarName", employee.AvatarName ?? (object)DBNull.Value);

                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
            }
        }

        public void CreateAccount(EmployeeAccount account)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT CreateAccount(@Email_A, @Password)";

                    command.Parameters.AddWithValue("Email_A", account.Email_A ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Password", account.Password ?? (object)DBNull.Value);

                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
            }
        }

        public void GetAccount (EmployeeAccount account)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetAccount(@Email_A)";

                    command.Parameters.AddWithValue("Email_A", account.Email_A ?? (object)DBNull.Value);

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    if (reader.Read())
                    {
                        account.Email_A = reader["Email_A"].ToString();
                        account.Password = reader["Password"].ToString();
                    }
                }
            }
        }

        public void UpdateEmployee(Employee employee)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT UpdateEmployee(@EmployeeID, @FirstName, @MiddleName, @LastName, @Gender, @DateOfBirth, @PhoneNumber, @Email, @LocalAddress, @PositionID, @StartDate, @EndDate, @AvatarName)";

                    command.Parameters.AddWithValue("EmployeeID", employee.EmployeeID);
                    command.Parameters.AddWithValue("FirstName", employee.FirstName ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("MiddleName", employee.MiddleName ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("LastName", employee.LastName ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Gender", employee.Gender ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("DateOfBirth", employee.DateOfBirth.HasValue ? DateOnly.FromDateTime(employee.DateOfBirth.Value) : (object)DBNull.Value);
                    command.Parameters.AddWithValue("PhoneNumber", employee.PhoneNumber ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("Email", employee.Email ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("LocalAddress", employee.LocalAddress ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("PositionID", employee.PositionID ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("StartDate", employee.StartDate.HasValue ? DateOnly.FromDateTime(employee.StartDate.Value) : (object)DBNull.Value);
                    command.Parameters.AddWithValue("EndDate", employee.EndDate.HasValue ? DateOnly.FromDateTime(employee.EndDate.Value) : (object)DBNull.Value);
                    command.Parameters.AddWithValue("AvatarName", employee.AvatarName ?? (object)DBNull.Value);

                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
            }
        }

        public List<Employee> ReadEmployeeFile(string filePath)
        {
            List<Employee> employeeList = new List<Employee>();
            string fileExtension = Path.GetExtension(filePath).ToLowerInvariant(); // Case insensitive
            try
            {
                if (fileExtension == ".csv")
                {
                    using (var reader = new StreamReader(filePath))
                    {
                        string? line = reader.ReadLine();
                        if (line == null) return employeeList;

                        //string[] headers = line.Split(',');
                        string[] headers = ParseCsvLine(line);
                        PropertyInfo[] properties = typeof(Employee).GetProperties();

                        while (!reader.EndOfStream)
                        {
                            line = reader.ReadLine();
                            if (string.IsNullOrWhiteSpace(line)) continue;
                            //if (line == null) continue;

                            //var values = line.Split(',');
                            var values = ParseCsvLine(line);
                            //if (values.All(string.IsNullOrWhiteSpace)) continue;
                            if (values.Length == 0) continue;
                            Employee employee = new Employee();
                            for (int i = 0; i < headers.Length; i++)
                            {
                                string? headerName = i < headers.Length ? headers[i].Trim() : null;
                                if (string.IsNullOrWhiteSpace(headerName)) continue;

                                PropertyInfo? property = properties.FirstOrDefault(p => p.Name.Equals(headers[i].Trim(), StringComparison.InvariantCultureIgnoreCase));
                                if (property != null && i < values.Length && !string.IsNullOrWhiteSpace(values[i]))
                                {
                                    object? value = null;

                                    if (property.PropertyType == typeof(DateTime?))
                                    {
                                        DateTime dateValue;
                                        if (DateTime.TryParse(values[i], out dateValue))
                                        {
                                            value = dateValue;
                                        }
                                        else
                                        {
                                            value = null;
                                        }
                                    }
                                    else
                                    {
                                        // For other property types, use Convert.ChangeType.
                                        value = Convert.ChangeType(values[i], property.PropertyType);
                                    }
                                    property.SetValue(employee, value);
                                }
                            }
                            employeeList.Add(employee);
                        }
                    }
                }
                else if (fileExtension == ".xls" || fileExtension == ".xlsx")
                {
                    System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
                    using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                    {
                        using (var reader = ExcelReaderFactory.CreateReader(stream))
                        {
                            var headers = reader.Read() ? Enumerable.Range(0, reader.FieldCount).Select(i => reader.GetString(i)).ToArray() : null;
                            if (headers == null) return employeeList;

                            Dictionary<string, PropertyInfo> headertoPropertyMap = new Dictionary<string, PropertyInfo>();
                            PropertyInfo[] properties = typeof(Employee).GetProperties();
                            foreach (var property in properties)
                            {
                                string? headerName = headers.FirstOrDefault(h => h != null && h.Trim().Equals(property.Name, StringComparison.InvariantCultureIgnoreCase));
                                if (headerName != null)
                                {
                                    headertoPropertyMap.Add(headerName, property);
                                }
                            }

                            while (reader.Read())
                            {
                                if (Enumerable.Range(0, reader.FieldCount).All(i => reader.IsDBNull(i))) continue; // Skip empty rows (all columns are null)
                                Employee employee = new Employee();
                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    string? headerName = i < headers.Length && headers[i] != null ? headers[i].Trim() : null;
                                    if (string.IsNullOrWhiteSpace(headerName)) continue;
                                    //PropertyInfo? property = properties.FirstOrDefault(p => p.Name.Equals(headerName, StringComparison.InvariantCultureIgnoreCase));
                                    PropertyInfo? property = headertoPropertyMap.GetValueOrDefault(headerName);
                                    if (property != null && !reader.IsDBNull(i))
                                    {
                                        object? value = null;

                                        if (property.PropertyType == typeof(DateTime?))
                                        {
                                            DateTime dateValue;
                                            if (DateTime.TryParse(reader.GetValue(i).ToString().AsSpan(), out dateValue))
                                            {
                                                value = dateValue;
                                            }
                                            else
                                            {
                                                value = null;
                                            }
                                        }
                                        else
                                        {
                                            // For other property types, use Convert.ChangeType.
                                            value = Convert.ChangeType(reader.GetValue(i), property.PropertyType);
                                        }
                                        
                                        property.SetValue(employee, value);
                                    }
                                }
                                employeeList.Add(employee);
                            }
                        }
                    }
                }
            }
            catch
            {
                throw;
            }
            return employeeList;
        }

        private string[] ParseCsvLine(string line)
        {
            Regex csvFieldPattern = new Regex(",(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))");
            return csvFieldPattern.Split(line);
        }

        public List<Employee> GetDuplicateEmployees(List<Employee> employees)
        {
            var duplicates = new List<Employee>();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                foreach (var employee in employees)
                {
                    using (NpgsqlCommand checkCommand = connection.CreateCommand())
                    {
                        checkCommand.CommandType = System.Data.CommandType.Text;
                        checkCommand.CommandText = "SELECT * FROM GetbyID(@ID)";
                        checkCommand.Parameters.AddWithValue("ID", employee.EmployeeID);

                        using (var reader = checkCommand.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    employee.PositionName = reader["PositionName"].ToString();
                                    employee.DepartmentID = reader["DepartmentID"].ToString();
                                    employee.DepartmentName = reader["DepartmentName"].ToString();
                                    duplicates.Add(employee);
                                }
                            }
                        }
                    }
                }
                connection.Close();
            }
            return duplicates;
        }

        public List<string> InsertEmployees(List<Employee> employees)
        {
            var duplicates = new List<string>();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var employee in employees)
                        {
                            using (NpgsqlCommand checkCommand = connection.CreateCommand())
                            {
                                checkCommand.Transaction = transaction;
                                checkCommand.CommandType = CommandType.Text;
                                checkCommand.CommandText = "SELECT CountDuplicate(@ID)";
                                checkCommand.Parameters.AddWithValue("ID", employee.EmployeeID);

                                int count = Convert.ToInt32(checkCommand.ExecuteScalar());
                                if (count == 0) // No duplicate
                                {
                                    if (!string.IsNullOrEmpty(employee.AvatarName))
                                    {
                                        employee.AvatarName = "/hr_images/avatar/" + employee.AvatarName;
                                    }
                                    using (NpgsqlCommand command = connection.CreateCommand())
                                    {
                                        command.Transaction = transaction;
                                        command.CommandType = System.Data.CommandType.Text;
                                        command.CommandText = "SELECT CreateEmployee(@EmployeeID, @FirstName, @MiddleName, @LastName, @Gender, @DateOfBirth, @PhoneNumber, @Email, @LocalAddress, @PositionID, @StartDate, @EndDate, @AvatarName)";

                                        command.Parameters.AddWithValue("EmployeeID", employee.EmployeeID);
                                        command.Parameters.AddWithValue("FirstName", employee.FirstName ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("MiddleName", employee.MiddleName ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("LastName", employee.LastName ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("Gender", employee.Gender ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("DateOfBirth", employee.DateOfBirth.HasValue ? DateOnly.FromDateTime(employee.DateOfBirth.Value) : (object)DBNull.Value);
                                        command.Parameters.AddWithValue("PhoneNumber", employee.PhoneNumber ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("Email", employee.Email ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("LocalAddress",employee.LocalAddress != null && employee.LocalAddress.StartsWith("\"") && employee.LocalAddress.EndsWith("\"") ? employee.LocalAddress.Trim('\"') : employee.LocalAddress ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("PositionID", employee.PositionID ?? (object)DBNull.Value);
                                        command.Parameters.AddWithValue("StartDate", employee.StartDate.HasValue ? DateOnly.FromDateTime(employee.StartDate.Value) : (object)DBNull.Value);
                                        command.Parameters.AddWithValue("EndDate", employee.EndDate.HasValue ? DateOnly.FromDateTime(employee.EndDate.Value) : (object)DBNull.Value);
                                        command.Parameters.AddWithValue("AvatarName", employee.AvatarName ?? (object)DBNull.Value);

                                        command.ExecuteNonQuery();
                                    }
                                }
                                else
                                {
                                    duplicates.Add($"Duplicate employee detected with ID: {employee.EmployeeID}");
                                }
                            }  
                        }
                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                        transaction.Rollback();
                        throw;
                    }
                }
                connection.Close();
            }
            return duplicates;
        }

        public List<Employee> GetAllDepartments()
        {
            List<Employee> departmentList = new List<Employee>();
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetDepartment()";

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        Employee department = new Employee();
                        department.DepartmentID = reader["DepartmentID"].ToString();
                        department.DepartmentName = reader["DepartmentName"].ToString();

                        departmentList.Add(department);
                    }
                }
            }
            return departmentList;
        }

        public List<Employee> GetAllPositions()
        {
            List<Employee> positionList = new List<Employee>();
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetPosition()";

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        Employee position = new Employee();
                        position.PositionID = reader["PositionID_P"].ToString();
                        position.PositionName = reader["PositionName"].ToString();
                        position.DepartmentID = reader["DepartmentID_P"].ToString();

                        positionList.Add(position);
                    }
                }
            }
            return positionList;
        }

        public List<Employee> GetPositionByDepartment(string departmentID)
        {
            List<Employee> positionByDepartment = new List<Employee>();
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                using (NpgsqlCommand command = connection.CreateCommand())
                {
                    command.CommandType = System.Data.CommandType.Text;
                    command.CommandText = "SELECT * FROM GetPositionbyDepartment(@departmentID)";
                    command.Parameters.AddWithValue("departmentID", departmentID);

                    connection.Open();
                    NpgsqlDataReader reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        Employee position = new Employee();
                        position.PositionID = reader["PositionID"].ToString();
                        position.PositionName = reader["PositionName"].ToString();

                        positionByDepartment.Add(position);
                    }
                }
            }
            return positionByDepartment;
        }

        public List<Employee> GetPositionForDuplicate(List<Employee> employees)
        {
            var duplicates = new List<Employee>();
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                foreach (var employee in employees)
                {
                    using (NpgsqlCommand command = connection.CreateCommand())
                    {
                        command.CommandType = System.Data.CommandType.Text;
                        command.CommandText = "SELECT * FROM GetDepartmentbyPosition(@psID)";
                        command.Parameters.AddWithValue("psID", employee.PositionID ?? (object)DBNull.Value);

                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    employee.PositionName = reader["PositionName"].ToString();
                                    employee.DepartmentID = reader["DepartmentID"].ToString();
                                    employee.DepartmentName = reader["DepartmentName"].ToString();
                                    duplicates.Add(employee);
                                }
                            }
                        }
                    }
                }
                connection.Close();
            }
            return duplicates;
        }

        public void ExportExcelFile(string filePath, List<Employee> employees, List<string> columns)
        {
            IWorkbook workbook;
            if (Path.GetExtension(filePath).ToLowerInvariant() == ".xlsx")
            {
                workbook = new XSSFWorkbook();
            }
            else if (Path.GetExtension(filePath).ToLowerInvariant() == ".xls")
            {
                workbook = new HSSFWorkbook();
            }
            else
            {
                throw new Exception("Invalid file extension");
            }

            var sheet = workbook.CreateSheet("EmployeeData");

            var employeeProperties = typeof(Employee).GetProperties();
            var propertiesWithValues = employeeProperties
                .Where(p => columns.Contains(p.Name) && p.Name != "AvatarName" && p.Name != "FullName")
                .ToList();

            var headerRow = sheet.CreateRow(0);
            for (int i = 0; i < propertiesWithValues.Count; i++)
            {
                var font = workbook.CreateFont();
                font.IsBold = true;
                var style = workbook.CreateCellStyle();
                style.SetFont(font);
                var property = propertiesWithValues[i];
                var displayName = property.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName ?? property.Name;
                var cell = headerRow.CreateCell(i);
                cell.SetCellValue(displayName);
                cell.CellStyle = style;
            }

            for (int i = 0; i < employees.Count; i++)
            {
                var row = sheet.CreateRow(i + 1);
                for (int j = 0; j < propertiesWithValues.Count; j++)
                {
                    var cell = row.CreateCell(j);
                    var value = propertiesWithValues[j].GetValue(employees[i]);
                    if (value is DateTime dateTimeValue)
                    {
                        cell.SetCellValue(dateTimeValue.ToString("yyyy-MM-dd"));
                    }
                    else
                    {
                        cell.SetCellValue(value?.ToString());
                    }
                }
            }

            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
            {
                workbook.Write(stream);
            }
        }

    }
}