console.log('Users frontend javascript file');

document.addEventListener('DOMContentLoaded', () => {
  // highlight active filter link
  document.querySelectorAll('.filter-link').forEach(link => {
    // links already have 'active' class server-side, but ensure client handles it after navigation
    link.addEventListener('click', () => {
      document.querySelectorAll('.filter-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // status select change (existing functionality)
  function bindStatusSelects() {
    document.querySelectorAll('.member-status').forEach(select => {
      select.removeEventListener('change', select._changeHandler);
      const handler = (e) => {
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
      };
      select.addEventListener('change', handler);
      // keep reference so we can remove later if rebinding
      select._changeHandler = handler;
    });
  }

  bindStatusSelects();

  // Edit / Delete buttons
  document.querySelectorAll('.user-row').forEach(row => {
    const id = row.dataset.id;

    const btnEdit = row.querySelector('.btn-edit');
    const btnDelete = row.querySelector('.btn-delete');
    const inline = row.querySelector('.inline-edit');
    const btnSave = row.querySelector('.btn-save');
    const btnCancel = row.querySelector('.btn-cancel');

    if (btnEdit) {
      btnEdit.addEventListener('click', () => {
        // toggle inline edit
        if (inline.style.display === 'none' || inline.style.display === '') {
          inline.style.display = 'block';
        } else {
          inline.style.display = 'none';
        }
      });
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        inline.style.display = 'none';
      });
    }

    if (btnSave) {
      btnSave.addEventListener('click', (e) => {
        const _id = e.target.dataset.id;
        const nick = row.querySelector('.edit-nick').value.trim();
        const phone = row.querySelector('.edit-phone').value.trim();
        // minimal validation
        if (!nick) return alert('Nickname is required');
        axios.post('/admin/user/edit', { _id, memberNick: nick, memberPhone: phone })
          .then(res => {
            if (res.data && res.data.data) {
              // update display
              row.querySelector('.user-name').textContent = nick;
              row.querySelector('.user-phone').textContent = phone;
              inline.style.display = 'none';
              bindStatusSelects();
            } else {
              alert('Update failed');
            }
          })
          .catch(err => {
            console.error(err);
            alert('Update failed');
          });
      });
    }

    if (btnDelete) {
      btnDelete.addEventListener('click', (e) => {
        const _id = e.target.dataset.id;
        if (!confirm('Do you really want to delete this user? This will set their status to DELETE.')) return;
        axios.post('/admin/user/edit', { _id, memberStatus: 'DELETE' })
          .then(res => {
            if (res.data && res.data.data) {
              // remove row from DOM or mark as deleted
              row.remove();
            } else {
              alert('Delete failed');
            }
          })
          .catch(err => {
            console.error(err);
            alert('Delete failed');
          });
      });
    }
  });
});
