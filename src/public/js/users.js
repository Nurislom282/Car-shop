console.log('Users frontend javascript file');

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.member-status').forEach(select => {
    select.addEventListener('change', (e) => {
      const id = e.target.id;
      const memberStatus = e.target.value;
      axios.post('/admin/user/edit', { _id: id, memberStatus })
        .then(response => {
          const result = response.data;
          if (result && result.data) {
            console.log('User updated!', id);
            e.target.blur();
          } else {
            alert('User update failed!');
          }
        })
        .catch(err => {
          console.error(err);
          alert('User update failed!');
        });
    });
  });
});
