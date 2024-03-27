using ManagerWebApplication.DAL;
using ManagerWebApplication.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.IO.Compression;

namespace ManagerWebApplication.Controllers
{
    public class EmployeeController : Controller
    {
        private readonly Employee_DAL _dal;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly ICompositeViewEngine _viewEngine;

        public EmployeeController(Employee_DAL dal, IWebHostEnvironment hostEnvironment, ICompositeViewEngine viewEngine)
        {
            _dal = dal;
            _hostEnvironment = hostEnvironment;
            _viewEngine = viewEngine;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Index()
        {
            List<Employee> employees = new List<Employee>();
            try
            {
                employees = _dal.GetAllEmployees();
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = ex.Message;
            }

            List<Employee> departments = _dal.GetAllDepartments();
            ViewData["Departments"] = departments;

            List<Employee> positions = _dal.GetAllPositions();
            ViewData["Positions"] = positions;

            return View(employees);
        }

        [HttpGet]
        public IActionResult GetEmployeeList()
        {
            List<Employee> employees = new List<Employee>();
            try
            {
                employees = _dal.GetAllEmployees();
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = ex.Message;
            }

            return PartialView("_EmployeeListPartial", employees);
        }

        [HttpGet]
        public IActionResult GetEmployeeDetails(string id)
        {
            Employee? employee = _dal.GetEmployeeByID(id);
            if (employee != null)
            {
                return PartialView("_EmployeeDetailsPartial", employee);
            }
            return Json(new { error = "Employee not found" });
        }

        [HttpGet]
        public IActionResult GetEmployeeFromId(string id)
        {
            Employee? employee = _dal.GetEmployeeByID(id);
            if (employee != null)
            {
                return Json(employee);
            }
            return Json(new { error = "Employee not found" });
        }

        [HttpGet]
        public IActionResult GetEmployeeFromEmail(string email)
        {
            Employee? employee = _dal.GetEmployeeByEmail(email);
            if (employee != null)
            {
                return Json(employee);
            }
            return Json(new { error = "Employee not found" });
        }

        [HttpGet]
        public IActionResult CreateEmployee()
        {
            List<Employee> departments = _dal.GetAllDepartments();
            ViewData["Departments"] = departments;
            return PartialView("_CreateEmployeePartial");
        }

        [HttpPost]
        public IActionResult Create(Employee employee, IFormFile imageFile)
        {
            try
            {
                if (imageFile != null && imageFile.Length > 0)
                {
                    // Image file name
                    string imageName = employee.EmployeeID + "-" + DateTime.Now.ToString("yyyyMMddHHmmss") + Path.GetExtension(imageFile.FileName);

                    // Path to save image
                    string imagePath = Path.Combine(_hostEnvironment.WebRootPath, "hr_images/avatar", imageName);

                    // Save image to path
                    using (var imageStream = new FileStream(imagePath, FileMode.Create))
                    {
                        imageFile.CopyTo(imageStream);
                    }

                    // Set URL to save
                    employee.AvatarName = "/hr_images/avatar/" + imageName;
                }
                else
                {
                    // No new image selected, retain the existing URL
                    employee.AvatarName = "/hr_images/avatar/ava-default.png";
                }

                if (ModelState.IsValid || (employee.EmployeeID != null && employee.FirstName != null && employee.LastName != null && employee.PositionID != null))
                {
                    _dal.CreateEmployee(employee);
                    ViewBag.SuccessMessage = "Inserted";
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = ex.Message;
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult CreateAccount([FromBody] EmployeeAccount account)
        {
            try
            {
                if (account.Email_A != null && account.Password != null)
                {
                    var count = _dal.GetEmployeeAccountByEmail(account);
                    if (count > 0)
                    {
                        return Json(new { success = false, message = "Email already exists" });
                    }
                    _dal.CreateAccount(account);
                    return Json(new { success = true, message = "Created" });
                }
                else
                {
                    return Json(new { success = false, message = "Email and Password are required" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult Login([FromBody] EmployeeAccount account)
        {
            try
            {
                if (account.Email_A != null && account.Password != null)
                {
                    var count = _dal.GetAccountLogin(account);
                    if (count == 1)
                    {
                        var employee = _dal.GetEmployeeByEmail(account.Email_A);
                        return Json(new { success = true, message = "Login successful", employee });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Invalid email or password" });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Email and Password are required" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult UpdateAccount([FromBody] EmployeeAccount account)
        {
            try
            {
                if (account.Email_A != null && account.Password != null)
                {
                    _dal.UpdateAccount(account);
                    return Json(new { success = true, message = "Updated" });
                }
                else
                {
                    return Json(new { success = false, message = "Email and Password are required" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult ImportEmployees(IFormFile eFile)
        {
            try
            {
                if (eFile != null && eFile.Length > 0)
                {
                    string eFileExtension = Path.GetExtension(eFile.FileName);
                    string tempDirectory = Path.GetTempPath();
                    string tempFileName = Guid.NewGuid().ToString() + eFileExtension;
                    string eFilePath = Path.Combine(tempDirectory, tempFileName);
                    using (var stream = new FileStream(eFilePath, FileMode.Create))
                    {
                        eFile.CopyTo(stream);
                    }

                    var employees = _dal.ReadEmployeeFile(eFilePath);

                    var validEmployees = employees.Where(e => !string.IsNullOrWhiteSpace(e.EmployeeID) && !string.IsNullOrWhiteSpace(e.FirstName) && !string.IsNullOrWhiteSpace(e.LastName) && !string.IsNullOrWhiteSpace(e.PositionID)).ToList();

                    var duplicates_noP = _dal.GetDuplicateEmployees(validEmployees);
                    var duplicates = _dal.GetPositionForDuplicate(duplicates_noP);

                    // Delete the file after importing
                    System.IO.File.Delete(eFilePath);

                    if (duplicates.Any())
                    {
                        var nonDuplicates = validEmployees.Except(duplicates_noP).ToList();

                        string html = this.RenderPartialViewToString("_ConfirmDuplicates", duplicates);
                        return Json(new { success = false, duplicates = true, html = html, nonDuplicates = nonDuplicates });
                    }
                    else
                    {
                        _dal.InsertEmployees(validEmployees);
                        return Json(new { success = true });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "No file uploaded or the file is empty." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        public string RenderPartialViewToString(string viewName, object model)
        {
            ViewData.Model = model;
            using (var writer = new StringWriter())
            {
                ViewEngineResult viewResult = _viewEngine.FindView(ControllerContext, viewName, false);
                if (viewResult.View != null)
                {
                    ViewContext viewContext = new ViewContext(
                        ControllerContext,
                        viewResult.View,
                        ViewData,
                        TempData,
                        writer,
                        new HtmlHelperOptions()
                    );
                    viewResult.View.RenderAsync(viewContext).Wait();
                }
                return writer.GetStringBuilder().ToString();
            }
        }

        //Update employee from Duplicate list
        [HttpPost]
        public IActionResult UpdateDuplicatedEmployees([FromBody] EmployeeSubModel model)
        {
            if (model.Filename == "duplicates")
            {
                try
                {
                    foreach (var employee in model.Employees)
                    {
                        _dal.UpdateEmployee(employee);
                    }
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ex.Message);
                }
            } else if (model.Filename == "nonDuplicates")
            {
                try
                {
                    _dal.InsertEmployees(model.Employees);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ex.Message);
                }
            }
            return Ok();
        }


        [HttpPost]
        public async Task<IActionResult> UploadEmployeeImagesFolder(List<IFormFile> employeeImages)
        {
            var uploadPath = Path.Combine(_hostEnvironment.WebRootPath, "hr_images/avatar");

            foreach (var image in employeeImages)
            {
                if (image != null && image.Length > 0 && new[] { ".jpg", ".jpeg", ".png", ".gif" }.Contains(Path.GetExtension(image.FileName).ToLowerInvariant()))
                {
                    var imageName = Path.GetFileName(image.FileName);
                    var imagePath = Path.Combine(uploadPath, imageName);

                    using (var imageStream = new FileStream(imagePath, FileMode.Create))
                    {
                        await image.CopyToAsync(imageStream);
                    }
                }
            }
            return Json(new { message = "Uploaded!" });
        }

        [HttpPost]
        [RequestFormLimits(MultipartBodyLengthLimit = 52428800)]
        public IActionResult UploadEmployeeImagesZip()
        {
            var files = Request.Form.Files;
            if (files.Count == 0)
            {
                return BadRequest("No file uploaded or the file is empty.");
            }

            var tempPath = Path.Combine(_hostEnvironment.WebRootPath, "temp");
            var uploadPath = Path.Combine(_hostEnvironment.WebRootPath, "hr_images/avatar");

            if (!Directory.Exists(tempPath))
            {
                Directory.CreateDirectory(tempPath);
            }
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    if (Path.GetExtension(formFile.FileName).Equals(".zip", StringComparison.OrdinalIgnoreCase))
                    {
                        var tempZipPath = Path.Combine(_hostEnvironment.WebRootPath, "temp", formFile.FileName);
                        using (var stream = new FileStream(tempZipPath, FileMode.Create))
                        {
                            formFile.CopyTo(stream);
                        }
                        // Open zip file
                        using (var zip = ZipFile.OpenRead(tempZipPath))
                        {
                            foreach (var entry in zip.Entries)
                            {
                                if (new[] {".jpg", ".jpeg", ".png", ".gif"}.Contains(Path.GetExtension(entry.FullName).ToLowerInvariant()))
                                {
                                    var extractPath = Path.Combine(uploadPath, Path.GetFileName(entry.FullName));
                                    entry.ExtractToFile(extractPath, overwrite: true);
                                }
                            }
                        }
                        System.IO.File.Delete(tempZipPath);
                    }
                    else
                    {
                        if (new[] {".jpg", ".jpeg", ".png", ".gif"}.Contains(Path.GetExtension(formFile.FileName).ToLowerInvariant()))
                        {
                            var imagePath = Path.Combine(uploadPath, formFile.FileName);
                            using (var imageStream = new FileStream(imagePath, FileMode.Create))
                            {
                                formFile.CopyTo(imageStream);
                            }
                        }
                    }
                }
            }
            return Json(new { message = "Uploaded!" });
        }

        [HttpGet]
        public IActionResult Delete(string ID)
        {
            try
            {
                _dal.DeleteEmployee(ID);
                TempData["successMessage"] = "Deleted!";
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = ex.Message;
            }

            return RedirectToAction("GetEmployeeList");
        }

        [HttpPost]
        public IActionResult BulkDelete(List<string> IDs)
        {
            try
            {
                if (IDs == null || IDs.Count == 0)
                {
                    TempData["errorMessage"] = "No employee selected";
                    return RedirectToAction("Index");
                }
                
                foreach (var ID in IDs)
                {
                    _dal.DeleteEmployee(ID);
                }
                return Json(new { success = true, message = "Deleted!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetEmployeeEdit(string ID)
        {
            Employee? employee = _dal.GetEmployeeByID(ID);
            List<Employee> departments = _dal.GetAllDepartments();
            ViewData["Departments"] = departments;

            List<Employee> positions = _dal.GetAllPositions();
            ViewData["Positions"] = positions;
            return PartialView("_EditEmployeePartial", employee);
        }

        [HttpPost]
        public IActionResult Update(Employee employee, IFormFile imageFileUpdate)
        {
            try
            {
                if (imageFileUpdate != null && imageFileUpdate.Length > 0)
                {
                    // Image file name
                    string imageName = employee.EmployeeID + "-" + DateTime.Now.ToString("yyyyMMddHHmmss") + Path.GetExtension(imageFileUpdate.FileName);

                    // Path to save image
                    string imagePath = Path.Combine(_hostEnvironment.WebRootPath, "hr_images/avatar", imageName);

                    // Save image to path
                    using (var imageStream = new FileStream(imagePath, FileMode.Create))
                    {
                        imageFileUpdate.CopyTo(imageStream);
                    }

                    // Set URL to save
                    employee.AvatarName = "/hr_images/avatar/" + imageName;
                }
                else
                {
                    // No new image selected, retain the existing URL
                    Employee? existingEmployee = _dal.GetEmployeeByID(employee.EmployeeID!);
                    if (existingEmployee != null)
                    {
                        employee.AvatarName = existingEmployee.AvatarName;
                    }
                }

                if (ModelState.IsValid || (employee.EmployeeID != null && employee.FirstName != null && employee.LastName != null && employee.PositionID != null))
                {
                    _dal.UpdateEmployee(employee);
                    ViewBag.SuccessMessage = "Updated";
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorMessage = ex.Message;
            }

            return RedirectToAction("Index");
        }

        [HttpGet]
        public IActionResult GetPositionsByDepartment(string departmentID)
        {
            List<Employee> positionsbyDepartment = new List<Employee>();
            try
            {
                positionsbyDepartment = _dal.GetPositionByDepartment(departmentID);
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = ex.Message;
            }

            return Json(positionsbyDepartment);
        }

        [HttpGet]
        public IActionResult GetDepartments()
        {
            List<Employee> departments = new List<Employee>();
            try
            {
                departments = _dal.GetAllDepartments();
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = ex.Message;
            }

            return Json(departments);
        }

        [HttpPost]
        public IActionResult ExportToExcel([FromBody] EmployeeSubModel model)
        {
            if (model == null || model.Employees == null || model.Filename == null || model.Columns == null)
            {
                return BadRequest("Error");
            }
            string filePath = Path.Combine(_hostEnvironment.WebRootPath, "temp", model.Filename);
            string? directoryName = Path.GetDirectoryName(filePath);
            if (directoryName != null)
            {
                Directory.CreateDirectory(directoryName);
            }

            _dal.ExportExcelFile(filePath, model.Employees, model.Columns);

            return Ok(filePath);
        }

        [HttpGet]
        public IActionResult DownloadExcelFile(string filePath)
        {
            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                stream.CopyTo(memory);
            }
            memory.Position = 0;
            return File(memory, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", Path.GetFileName(filePath));
        }
    }
}
