console.log("Products frontend javascript file");

document.addEventListener('DOMContentLoaded', () => {
  const collectionSelect = document.querySelector('.product-collection');
  const productCollectionEl = document.getElementById('product-collection');
  const productVolumeEl = document.getElementById('product-volume');
  const processBtn = document.getElementById('process-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const dishContainer = document.querySelector('.dish-container');

  if (collectionSelect) {
    collectionSelect.addEventListener('change', () => {
      const selectedValue = collectionSelect.value;
      if (selectedValue === 'DRINK') {
        if (productCollectionEl) productCollectionEl.style.display = 'none';
        if (productVolumeEl) productVolumeEl.style.display = 'block';
      } else {
        if (productVolumeEl) productVolumeEl.style.display = 'none';
        if (productCollectionEl) productCollectionEl.style.display = 'block';
      }
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', () => {
      if (dishContainer) {
        dishContainer.style.display = dishContainer.style.display === 'block' ? 'none' : 'block';
        processBtn.style.display = 'none';
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (dishContainer) dishContainer.style.display = 'none';
      if (processBtn) processBtn.style.display = 'flex';
    });
  }

  // status change listener (for dynamically generated selects too)
  document.querySelectorAll('.new-product-status').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.id;
      const productStatus = e.target.value;
      try {
        const response = await axios.post(`/admin/product/${id}`, { productStatus });
        if (response && response.data) {
          console.log('Product updated!', id);
          e.target.blur();
        } else {
          alert('Product update failed!');
        }
      } catch (err) {
        console.error(err);
        alert('Product update failed!');
      }
    });
  });
});

function validateForm() {
  const productName = document.querySelector('.product-name')?.value ?? '';
  const productPrice = document.querySelector('.product-price')?.value ?? '';
  const productLeftCount = document.querySelector('.product-left-count')?.value ?? '';
  const productCollection = document.querySelector('.product-collection')?.value ?? '';
  const productDesc = document.querySelector('.product-desc')?.value ?? '';
  const productStatus = document.querySelector('.product-status')?.value ?? '';

  if (!productName || !productPrice || !productLeftCount || !productCollection || !productDesc || !productStatus) {
    alert('Please insert all details!');
    return false;
  }
  return true;
}

function previewFileHandler(input, order) {
  const file = input.files && input.files[0];
  if (!file) return;
  const fileType = file.type;
  const validImageType = ['image/jpg', 'image/jpeg', 'image/png'];
  if (!validImageType.includes(fileType)) {
    alert('Please insert only jpeg,jpg and png!');
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    const img = document.getElementById(`image-section-${order}`);
    if (img) img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
