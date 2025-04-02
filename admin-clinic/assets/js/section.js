
// const API_BASE_URL = 'https://user-api-server.onrender.com';
// const API_BASE_URL = 'http://localhost:3000';

// const token = localStorage.getItem('token');
// if (!token) {
//   alert('Unauthorized! Please login first.');
//   window.location.href = 'index.html';
// }
// $('#addArticleBtn').click(function () {
//   $('#addArticlePopup').modal('show');
// });
// $('#newCategoryContentEs').summernote({
//     toolbar: [
//       ['style', ['bold', 'italic', 'underline', 'clear']],
//       ['font', ['strikethrough', 'superscript', 'subscript']],
//       ['color', ['color']],
//       ['para', ['ul', 'ol', 'paragraph']],
//       ['table', ['table']],
//       ['insert', ['link', 'picture', 'video']],
//       ['view', ['fullscreen', 'codeview', 'help']],
//       ['insert', ['hr', 'removeFormat']], // تأكد أن hr و removeFormat هنا
//       ['style', ['h1', 'h2', 'h3', 'p']] // إضافة العناوين والفقرات
//     ]
//   });

$(document).ready(function () {


    $('#newSectionsLink').on('click', function () {
        loadNewSections();
      });

    loadNewSections1();
    //NEW HANDLE FOR SECTION
    $("#newSectionSelect").change(function () {
      let sectionId = $(this).val();
      console.log("sectionSelect sectionId:", sectionId);
      if (sectionId) {
        hideNewNewSectionInputs(); // Hide fields for adding a new section
      } else {
        $("#categorySelect").html('<option value="">Choose a category...</option>');
        showNewSectionInputs(); // Show fields if no section is selected
      }
    });
  
    //NEW HANDLE FOR SECTION
    $("#addNewSectionForm").submit(function (e) {
      e.preventDefault();
  
      let sectionId = $("#newSectionSelect").val();
  
      let newSectionTitle = $("#newSectionTitleEs").val();
      let newSectionImage = $("#newSectionImage").val();
      let newCategoryTitle = $("#newCategoryTitleEs").val();
      let newCategoryImage = $("#newCategoryImage").val();
      let newCategoryContent = $("#newCategoryContentEs").val();
  
      if (!sectionId && newSectionTitle) {
        // 🟢 Create a new section with a category and subcategory
        const sectionData = {
          title: { es: newSectionTitle },
          imageUrl: newSectionImage,
        };
  
        const categoryData = {
          title: { es: newCategoryTitle },
          imageUrl: newCategoryImage,
          content: { es: newCategoryContent },
        };
  
  
        newCreateSectionWithCategoryAndSubcategory(sectionData, categoryData);
      } else if (sectionId && newCategoryTitle) {
        // 🟢 Add a new category inside an existing section
  
        const categoryData = {
          title: { es: newCategoryTitle },
          imageUrl: newCategoryImage,
          content: { es: newCategoryContent }
        };
  
        newCreateCategory(sectionId, categoryData);
      } else {
        alert("Please fill in the required fields.");
      }
    });
  
    //NEW HANDLE FOR SECTION
    function hideNewNewSectionInputs() {
      $("#newSectionTitleEs, #newSectionImage").val("").removeAttr("required").parent().hide();
    }
  
    //NEW HANDLE FOR SECTION
    function showNewSectionInputs() {
      $("#newSectionTitleEs, #newSectionImage").attr("required", "required").parent().show();
    }
  
  });
  
  
function viewNewCategories(sectionId) {
  console.log("viewCategories sectionId", sectionId);
  $('#content').html('<h3>Loading Categories...</h3>');
  $.ajax({
    url: `${API_BASE_URL}/newsection/section/${sectionId}/categories`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    success: function (response) {
      let categoriesHTML = `<h3>Categories</h3><div class="row">`;

      response.forEach(category => {
        console.log(category);
        const isChecked = category.status === 'Published' ? 'checked' : '';
        const safeCategoryData = JSON.stringify(category).replace(/"/g, '&quot;'); // ✅ Fix issue with passing the object inside `onclick`
        const encodedData = encodeBase64(JSON.stringify(category));
        categoriesHTML += `
          <div class="col-lg-3 mb-4">
            <div class="card">
              <img src="${category.imageUrl || 'default-image.jpg'}" class="card-img-top" alt="${category.title?.es || category.title?.en || "category img"}">
              <div class="card-body">
                <h5 class="card-title">${category.title?.es || category.title?.en || "category title"}</h5>
                
                <button class="btn btn-primary btn-sm" onclick="viewCategoryContent('${encodedData}')">Read More</button>
                
                <button class="btn btn-warning btn-sm" onclick="newOpenEditPopup('category', '${sectionId}', ${safeCategoryData})">Edit</button>

                <button class="btn btn-danger btn-sm" onclick="deleteNewCategory('${sectionId}', '${category.categoryId}')">Delete</button>

                <div class="form-check form-switch mt-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="switch-${category.categoryId}"
                    ${isChecked} onclick="sectionToggleStatus('category', '${category.categoryId}', this.checked)">
                  <label class="form-check-label" for="switch-${category.categoryId}">
                    ${category.status}
                  </label>
                </div>
              </div>
            </div>
          </div>`;
      });

      categoriesHTML += '</div>';
      $('#content').html(categoriesHTML);
    },
    error: function () {
      $('#content').html('<p class="text-danger">Failed to load categories.</p>');
    },
  });
}

// Convert text to Base64 with UTF-8 support
function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// Decode Base64 to text with UTF-8 support
function decodeBase64(str) {
  return decodeURIComponent(escape(atob(str)));
}


function viewCategoryContent(encodedData) {
 let category = JSON.parse(decodeBase64(encodedData)); // ✅ Decode Base64 with UTF-8 support

  let contentHTML = `
    <h3>${category.title?.es || category.title?.en || "subcategory title"}</h3>
    <label for="languageSelect"><strong>Select Language:</strong></label>
    <select id="languageSelect" class="form-select" onchange="updateContent('${encodedData}')">
      <option value="ar" selected>العربية</option>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
    <div id="contentDisplay" class="mt-3">
      <p>${category.content.es}</p>
    </div>`;

  $('#content').html(contentHTML);
}


///////////////////////////////////

  // **Load sections**
  function loadNewSections1() {
    $.ajax({
      url: `${API_BASE_URL}/newsection/sections`,
      type: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (sections) {
        let options = '<option value="">Choose a section...</option>';
        sections.forEach(section => {
          options += `<option value="${section.sectionId}">${section.title.es}</option>`;
        });
        console.log("Loaded sections:", sections);
        console.log("options", options);
        $("#newSectionSelect").html(options);
      },
      error: function () {
        alert("Failed to load sections.");
      }
    });
  }
  
  
  function newCreateSectionWithCategoryAndSubcategory(sectionData, categoryData) {
    // تحضير الفئة الجديدة مع الفئة الفرعية داخلها
    const newCategory = {
      title: { es: categoryData.title.es },
      imageUrl: categoryData.imageUrl,
      content: { es: categoryData.content.es }
  
    };
  
    // إضافة الفئة إلى بيانات القسم
    sectionData.categories = [newCategory]; // إضافة الفئة إلى القسم الجديد
  
    // إرسال القسم الجديد مع الفئة والفئة الفرعية
    $.ajax({
      url: `${API_BASE_URL}/newsection/form/sections`,
      type: "POST",
      headers: { Authorization: `Bearer ${token}` },
      contentType: "application/json",
      data: JSON.stringify(sectionData), // إرسال البيانات مع الفئة والفئة الفرعية
      success: function () {
        alert("Section with Category and Subcategory added successfully!");
        loadNewSections1(); // إعادة تحميل الأقسام بعد إضافة القسم الجديد
      },
      error: function () {
        alert("Failed to add section with category and subcategory.");
      }
    });
  }
  
  function newCreateCategory(sectionId, data) {
    console.log("sectionId in createCategory:", sectionId);
    console.log("data in createCategory:", data);
    $.ajax({
      url: `${API_BASE_URL}/newsection/form/sections/${sectionId}/categories`,
      type: "POST",
      headers: { Authorization: `Bearer ${token}` },
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function () {
        alert("Category added successfully!");
        loadNewCategories1(sectionId);
      },
      error: function () {
        alert("Failed to add category.");
      }
    });
  }



function loadNewCategories1(sectionId) {
  console.log("loadNewCategories1 sectionId:", sectionId);

  $.ajax({
    url: `${API_BASE_URL}/newsection/form/sections/${sectionId}/categories`,
    type: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: function (categories) {
      let options = '<option value="">Choose a category...</option>';
      console.log("Loaded categories:", categories);
      categories.forEach(category => {
        options += `<option value="${category.categoryId}">${category.title.es}</option>`;
      });
      $("#categorySelect").html(options);
    },
    error: function () {
      alert("Failed to load categories.");
    }
  });
}


// Delete item
function deleteNewSection(sectionId) {
    if (confirm('Are you sure you want to delete this section?')) {
      $.ajax({
        url: `${API_BASE_URL}/dashboard/section/${sectionId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          loadSections();
        },
        error: function () {
          alert('Failed to delete section.');
        },
      });
    }
  }
  

  function newSectionToggleStatus(type, id, isChecked) {
    const newStatus = isChecked ? 'Published' : 'Unpublished';
    $.ajax({
      url: `${API_BASE_URL}/newsection/${type}/${id}/status`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: JSON.stringify({ status: newStatus }),
      success: function () {
        $(`#switch-${id}`).next().text(newStatus);
        alert(type + ' updated successfully.');
      },
      error: function () {
        alert('Failed to update status.');
      },
    });
  }
  
  function newOpenEditPopup(type, parentId, item) {
    $('#newLblEditContentEs').hide();
    $('#newCategoryEditContentEs').hide();
    console.log("section popup", type, parentId, item);
    $('#newEditId').val(item._id || item.sectionId || item.categoryId || item.subcategoryId);
    $('#newEditType').val(type);
    $('#newEditTitleEs').val(item.title?.es || item.title?.en || '');
    $('#newEditImageUrl').val(item.imageUrl);
  
    if (type == "category") {
      console.log("wwwwww", item);
      $('#newLblEditContentEs').show();
      $('#newCategoryEditContentEs').show();
      $('#newCategoryEditContentEs').val(item.content?.es || item.content?.en || '');
    }
    $('#newEditPopup').modal('show');
    // Store parentId to use it in the update if the edit is on a category or subcategory
    $('#newEditPopup').data('parentId', parentId || null);
  }
  
  function newSaveChanges() {
    const type = $('#newEditType').val();
    const id = $('#newEditId').val();

    console.log("type", type);
    console.log("id", id);

    const parentId = $('#newEditPopup').data('parentId');
  
    const updatedData = {
      title: { es: $('#newEditTitleEs').val() },
      imageUrl: $('#newEditImageUrl').val()
    };
    if (type == "category") {
      updatedData.content = { es: $('#newCategoryEditContentEs').val() }
    }
  
    let url = `${API_BASE_URL}/newsection/${type}/${parentId}`;
  
    if (type === 'category') {
      url = `${API_BASE_URL}/newsection/section/${parentId}/category/${id}`;
    } 


console.log("updatedData", updatedData);

    $.ajax({
      url: url,
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: JSON.stringify(updatedData),
      success: function () {
        $('#newEditPopup').modal('hide');
        alert('Updated successfully!');
  
        // Reload the data based on what was edited
        if (type === 'section') {
          loadNewSections();
        } else if (type === 'category') {
            viewNewCategories(parentId);
        } 
      },
      error: function () {
        alert('Failed to update.');
      }
    });
  }

function loadNewSections() {
    $('#content').html('<h3>Loading Sections...</h3>');
    const lang = 'es'; // أو يمكنك تحديد اللغة من إعدادات المستخدم أو من الصفحة
    $.ajax({
      url: `${API_BASE_URL}/newsection/sections`, // إضافة اللغة في استعلام الـ URL
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (response) {
  
  
        let sectionsHTML = '<h3>Sections</h3><div class="row">';
        console.log(response);
        response.forEach(section => {
          console.log("@@@@",section);
          const isChecked = section.status === 'Published' ? 'checked' : '';
          const safeSectionData = JSON.stringify(section).replace(/"/g, '&quot;'); // ✅ Fix issue with passing the object inside `onclick`
  
          // بناء المحتوى للـ HTML
          sectionsHTML += `
          <div class="col-lg-3 mb-4">
            <div class="card">
              <img src="${section.imageUrl || 'default-image.jpg'}" class="card-img-top" alt=""${section.title?.es || section.title?.en || 'Section Title'}">
              <div class="card-body">
                <h5 class="card-title">${section.title?.es || category.title?.en  || 'Section Title'}</h5>
                
                <button class="btn btn-primary btn-sm" onclick="viewNewCategories('${section.sectionId}')">Read More</button>
  
                <button class="btn btn-warning btn-sm" onclick="newOpenEditPopup('section', '${section.sectionId}', ${safeSectionData})">Edit</button>
  
                <button class="btn btn-danger btn-sm" onclick="deleteNewSection('${section.sectionId}')">Delete</button>
  
                <!-- Switch Toggle for Publish/Unpublish -->
                <div class="form-check form-switch mt-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="switch-${section.sectionId}"
                    ${isChecked} onclick="newSectionToggleStatus('section', '${section.sectionId}', this.checked)">
                  <label class="form-check-label" for="switch-${section.sectionId}">
                    ${section.status}
                  </label>
                </div>
                
                <!-- Loop through categories and display them 
                <div class="categories mt-3">
                  <h6>Categories:</h6>
                  ${section.categories.map(category => `
                    <p><strong>${category.title || 'Category Title'}</strong>: ${category.content || 'No content available'}</p>
                  `).join('')}
                </div>
                -->
              </div>
            </div>
          </div>`;
        });
  
        sectionsHTML += '</div>';
        $('#content').html(sectionsHTML);
      },
      error: function () {
        $('#content').html('<p class="text-danger">Failed to load sections.</p>');
      },
    });
  }
  