console.log('Signup frontend javascript file');

document.addEventListener('DOMContentLoaded', () => {
  const fileTarget = document.querySelector('.file-box .upload-hidden');
  if (fileTarget) {
    fileTarget.addEventListener('change', function () {
      if (window.FileReader) {
        const uploadFile = this.files[0];
        if (!uploadFile) return;
        const fileType = uploadFile.type;
        const validImageType = ['image/jpg', 'image/jpeg', 'image/png'];
        if (!validImageType.includes(fileType)) {
          alert('Please insert only jpeg,jpg and png!');
          return;
        }
        console.log(URL.createObjectURL(uploadFile));
        const frame = document.querySelector('.upload-img-frame');
        if (frame) {
          frame.src = URL.createObjectURL(uploadFile);
          frame.classList.add('success');
        }
        const siblings = this.parentElement.querySelectorAll('.upload-name');
        if (siblings && siblings.length) siblings.forEach(el => el.value = uploadFile.name);
      }
    });
  }
});

function validateSignupForm() {
  const memberNick = document.querySelector('.member-nick')?.value ?? '';
  const memberPhone = document.querySelector('.member-phone')?.value ?? '';
  const memberPassword = document.querySelector('.member-password')?.value ?? '';
  const confirmPassword = document.querySelector('.confirm-password')?.value ?? '';

  if (!memberNick || !memberPhone || !memberPassword || !confirmPassword) {
    alert('Please insert all required inputs!');
    return false;
  }
  if (memberPassword !== confirmPassword) {
    alert('Password differs, please check!');
    return false;
  }

  const imageInput = document.querySelector('.member-image');
  const memberImage = imageInput && imageInput.files && imageInput.files[0] ? imageInput.files[0].name : null;
  if (!memberImage) {
    alert('Please insert restaurant image!');
    return false;
  }
  return true;
}
