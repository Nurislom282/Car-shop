
        // entrance animations
        anime({ targets: '.glass-header', translateY: [-18, 0], opacity: [0, 1], duration: 700, easing: 'easeOutExpo' });
  // softer, lower-amplitude motion for background blobs to reduce visual noise
  anime({ targets: '.bg-blobs .blob', translateY: [-10, 10], translateX: [-4, 4], loop: true, direction: 'alternate', duration: 12000, easing: 'easeInOutSine', delay: anime.stagger(400) });
        anime({ targets: '.car-card', translateY: [18, 0], opacity: [0, 1], delay: anime.stagger(80), duration: 650, easing: 'easeOutCubic' });

        // hover tilt effect for cards (subtle)
        document.querySelectorAll('.car-card').forEach(card => {
          card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            anime.remove(card);
            anime({ targets: card, rotateY: px * 4, rotateX: py * -4, scale: 1.01, duration: 200, easing: 'spring(1,80,10,0)' });
          });
          card.addEventListener('mouseleave', () => anime({ targets: card, rotateY: 0, rotateX: 0, scale: 1, duration: 250, easing: 'easeOutExpo' }));
        });

        // modal logic
        const processBtn = document.getElementById('process-btn');
        const newModal = document.getElementById('newCarModal');
        const backdrop = document.getElementById('modalBackdrop');
        const cancelModal = document.getElementById('cancelModal');
        if (processBtn) {
          processBtn.addEventListener('click', () => {
            backdrop.hidden = false; backdrop.style.display = 'block'; newModal.classList.add('show'); newModal.setAttribute('aria-hidden', 'false');
            anime({ targets: newModal, translateY: [40, 0], opacity: [0, 1], duration: 420, easing: 'easeOutCubic' });
          });
        }
        function closeModal() { newModal.classList.remove('show'); newModal.setAttribute('aria-hidden', 'true'); backdrop.hidden = true; backdrop.style.display = 'none'; }
        cancelModal?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        // delete button (front-end prompt, then post)
        document.querySelectorAll('.action-btn.del').forEach(btn => {
          btn.addEventListener('click', () => {
            if (confirm('Delete this car?')) {
              const id = btn.dataset.id;
              fetch('/admin/car/' + id + '/delete', { method: 'POST', credentials: 'same-origin' })
                .then(async (r) => {
                  if (r.ok) return location.reload();
                  let body = {};
                  try { body = await r.json(); } catch (e) {}
                  alert(body.message || 'Delete failed');
                })
                .catch(() => alert('Network error'));
            }
          });
        });

        // search filter: submit page reload with query param on Enter or blur
        const search = document.getElementById('searchInput');
        function buildUrlFromParams(params){
          const keys = Object.keys(params).filter(k=>params[k] !== undefined && params[k] !== null && params[k] !== '');
          if (!keys.length) return '/admin/car/all';
          return '/admin/car/all?' + keys.map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
        }
        if (search) {
          // submit when user presses Enter
          search.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              const q = search.value.trim();
              const params = Object.fromEntries(new URLSearchParams(window.location.search));
              params.search = q;
              params.page = 1;
              location.href = buildUrlFromParams(params);
            }
          });
          // optional: on blur also apply
          search.addEventListener('blur', () => {
            const q = search.value.trim();
            const params = Object.fromEntries(new URLSearchParams(window.location.search));
            params.search = q;
            params.page = 1;
            // don't navigate if unchanged
            const target = buildUrlFromParams(params);
            if (target !== window.location.pathname + window.location.search) location.href = target;
          });
        }

        // brand filter (client-side) — buttons have server-side active class; clicking navigates preserving params
        const brandItems = Array.from(document.querySelectorAll('.brand-item'));
        if (brandItems.length) {
          brandItems.forEach(btn => {
            btn.addEventListener('click', (ev) => {
              ev.preventDefault();
              // navigate to server with brand param, preserving other params
              const params = Object.fromEntries(new URLSearchParams(window.location.search));
              params.brand = btn.dataset.brand || '';
              params.page = 1;
              location.href = buildUrlFromParams(params);
            });
          });
        }

        // motion toggle (reduce motion)
        const motionToggle = document.getElementById('motionToggle');
        motionToggle?.addEventListener('click', () => {
          const off = motionToggle.getAttribute('aria-pressed') === 'true';
          motionToggle.setAttribute('aria-pressed', String(!off));
          if (!off) { // turn off
            document.querySelectorAll('[data-anim]').forEach(el => el.style.opacity = 1);
            anime.running.forEach(a => anime.remove(a));
          } else { // re-run
            anime({ targets: '.car-card', translateY: [0, 0], opacity: [0, 1], delay: anime.stagger(80), duration: 650, easing: 'easeOutCubic' });
          }
        });

        // New Brand modal handlers
        const newBrandBtn = document.getElementById('newBrandBtn');
        const newBrandModal = document.getElementById('newBrandModal');
        const cancelBrand = document.getElementById('cancelBrand');
        const brandFileInput = newBrandModal && newBrandModal.querySelector('input[type=file]');
        const brandImgPlaceholder = document.getElementById('brandImgPlaceholder');

        newBrandBtn && newBrandBtn.addEventListener('click', () => {
          backdrop.hidden = false; backdrop.style.display = 'block'; newBrandModal.classList.add('show'); newBrandModal.setAttribute('aria-hidden', 'false');
        });
        cancelBrand && cancelBrand.addEventListener('click', () => {
          newBrandModal.classList.remove('show'); newBrandModal.setAttribute('aria-hidden', 'true'); backdrop.hidden = true; backdrop.style.display = 'none';
        });

        brandFileInput && brandFileInput.addEventListener('change', () => {
          const f = brandFileInput.files && brandFileInput.files[0];
          if (f) {
            const url = URL.createObjectURL(f);
            brandImgPlaceholder.src = url;
          } else {
            brandImgPlaceholder.src = '/img/upload.svg';
          }
        });

        // Brand edit/delete handlers
        document.querySelectorAll('.btn-delete-brand').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('Delete this brand? This will fail if any car uses this brand.')) return;
            const id = btn.dataset.id;
            fetch('/admin/brand/' + id + '/delete', { method: 'POST', credentials: 'same-origin' })
              .then(async (r) => {
                if (r.ok) return location.reload();
                let body = {};
                try { body = await r.json(); } catch (e) {}
                alert(body.message || 'Delete failed');
              })
              .catch(() => alert('Network error'));
          });
        });

        document.querySelectorAll('.btn-edit-brand').forEach(btn => {
          btn.addEventListener('click', (ev) => {
            ev.preventDefault();
            const id = btn.dataset.id;
            if (!id) return;
            // fetch brand data and populate newBrandModal for editing
            fetch('/admin/brand/' + id, { method: 'GET', credentials: 'same-origin' })
              .then(r => {
                if (!r.ok) throw new Error('Network');
                return r.json();
              })
              .then(json => {
                const b = json && json.data ? json.data : json;
                if (!b) { alert('Brand not found'); return; }
                // set form action to edit endpoint and attach hidden id
                const form = newBrandModal.querySelector('form');
                form.setAttribute('action', '/admin/brand/edit');
                let hidden = form.querySelector('input[name="_id"]');
                if (!hidden) { hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = '_id'; form.appendChild(hidden); }
                hidden.value = b._id;
                // populate name and image placeholder
                try { if (form.elements['BrandName']) form.elements['BrandName'].value = b.BrandName || ''; } catch(e){}
                try { const img = b.BrandImages && b.BrandImages[0] ? ('/uploads/' + String(b.BrandImages[0]).replace(/^\/+/, '').replace(/^uploads\//,'')) : '/img/upload.svg'; brandImgPlaceholder.src = img; } catch(e){}
                // open modal
                backdrop.hidden = false; backdrop.style.display = 'block'; newBrandModal.classList.add('show'); newBrandModal.setAttribute('aria-hidden', 'false');
              })
              .catch(() => alert('Failed to load brand data'));
          });
        });

        // Image preview for each file input in the new-car modal
        document.querySelectorAll('#newCarModal input[type=file]').forEach((input) => {
          input.addEventListener('change', (ev) => {
            const file = input.files && input.files[0];
            const slot = input.closest('.upload-slot');
            if (!slot) return;
            const placeholder = slot.querySelector('.slot-placeholder');
            const previewWrap = slot.querySelector('.slot-preview');
            const previewImg = previewWrap && previewWrap.querySelector('img');
            if (file && previewImg) {
              const url = URL.createObjectURL(file);
              previewImg.src = url;
              previewWrap.style.display = 'block';
              if (placeholder) placeholder.style.display = 'none';
            } else {
              if (previewImg) { previewImg.src = ''; }
              if (previewWrap) previewWrap.style.display = 'none';
              if (placeholder) placeholder.style.display = 'block';
            }
          });
        });

        // Edit flow: intercept admin edit links, fetch car data and populate the new-car modal
        (function(){
          const editLinks = Array.from(document.querySelectorAll('a.action-btn'))
            .filter(a => a.getAttribute('href') && a.getAttribute('href').startsWith('/admin/car/'));
          if (!editLinks.length) return;

          const form = newModal && newModal.querySelector('form');
          if (!form) return;
          const submitBtn = form.querySelector('button[type=submit]');
          const defaultAction = form.getAttribute('action') || '/admin/car/create';
          const defaultSubmitText = submitBtn ? submitBtn.textContent : 'Create';

          function openEditModal(car, id) {
            // set form to update mode
            form.setAttribute('action', '/admin/car/' + id);
            if (submitBtn) submitBtn.textContent = 'Update';

            // ensure hidden _id exists
            let hidden = form.querySelector('input[name="_id"]');
            if (!hidden) {
              hidden = document.createElement('input');
              hidden.type = 'hidden'; hidden.name = '_id';
              form.appendChild(hidden);
            }
            hidden.value = id;

            // populate simple inputs/selects if present
            try { if (form.elements['carName']) form.elements['carName'].value = car.carName || ''; } catch(e){}
            try { if (form.elements['carBrand']) form.elements['carBrand'].value = car.carBrand || ''; } catch(e){}
            try { if (form.elements['carType']) form.elements['carType'].value = car.carType || ''; } catch(e){}
            try { if (form.elements['carPrice']) form.elements['carPrice'].value = car.carPrice ?? ''; } catch(e){}
            try { if (form.elements['carLeftCount']) form.elements['carLeftCount'].value = car.carLeftCount ?? ''; } catch(e){}
            try { if (form.elements['carEngine']) form.elements['carEngine'].value = car.carEngine ?? ''; } catch(e){}
            try { if (form.elements['carTransmission']) form.elements['carTransmission'].value = car.carTransmission || ''; } catch(e){}
            try { if (form.elements['carFuel']) form.elements['carFuel'].value = car.carFuel || ''; } catch(e){}
            try { if (form.elements['carColor']) form.elements['carColor'].value = car.carColor || ''; } catch(e){}
            try { if (form.elements['carState']) form.elements['carState'].value = car.carState || ''; } catch(e){}
            // year needs YYYY-MM-DD
            try {
              if (form.elements['carYear'] && car.carYear) {
                const d = new Date(car.carYear);
                if (!isNaN(d.getTime())) form.elements['carYear'].value = d.toISOString().slice(0,10);
              }
            } catch(e){}

            // show first existing image in the first upload slot preview (if any)
            try {
              const slots = newModal.querySelectorAll('.upload-slot');
              // clear previous previews
              slots.forEach(s => {
                const placeholder = s.querySelector('.slot-placeholder');
                const previewWrap = s.querySelector('.slot-preview');
                const previewImg = previewWrap && previewWrap.querySelector('img');
                if (previewImg) previewImg.src = '';
                if (previewWrap) previewWrap.style.display = 'none';
                if (placeholder) placeholder.style.display = 'block';
              });
              if (car.carImages && car.carImages.length) {
                const imgPath = String(car.carImages[0]).replace(/^\/+/, '').replace(/^uploads\//, '');
                const url = '/uploads/' + imgPath;
                const first = slots[0];
                if (first) {
                  const placeholder = first.querySelector('.slot-placeholder');
                  const previewWrap = first.querySelector('.slot-preview');
                  const previewImg = previewWrap && previewWrap.querySelector('img');
                  if (previewImg) previewImg.src = url;
                  if (previewWrap) previewWrap.style.display = 'block';
                  if (placeholder) placeholder.style.display = 'none';
                }
              }
            } catch(e){}

            // open modal
            backdrop.hidden = false; backdrop.style.display = 'block'; newModal.classList.add('show'); newModal.setAttribute('aria-hidden', 'false');
            anime({ targets: newModal, translateY: [40, 0], opacity: [0, 1], duration: 420, easing: 'easeOutCubic' });
          }

          function resetToCreate() {
            form.setAttribute('action', defaultAction);
            if (submitBtn) submitBtn.textContent = defaultSubmitText;
            const hidden = form.querySelector('input[name="_id"]');
            if (hidden) hidden.remove();
            // clear file previews
            document.querySelectorAll('#newCarModal .upload-slot .slot-preview img').forEach(img => img.src = '');
            document.querySelectorAll('#newCarModal .upload-slot .slot-preview').forEach(w => w.style.display = 'none');
            document.querySelectorAll('#newCarModal .upload-slot .slot-placeholder').forEach(p => p.style.display = 'block');
            // optionally clear other inputs if you want
          }

          // attach listeners
          editLinks.forEach(a => {
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              const href = a.getAttribute('href');
              const id = href.split('/').pop();
              if (!id) return;
              // call admin JSON endpoint which returns car data for editing
              fetch('/admin/car/' + id + '/data', { method: 'GET', credentials: 'same-origin' })
                .then(r => {
                  if (!r.ok) throw new Error('Network');
                  return r.json();
                })
                .then(json => {
                  // controller returns { data: result }
                  const car = json && json.data ? json.data : json;
                  if (!car) { alert('Car data not found'); return; }
                  openEditModal(car, id);
                })
                .catch(() => alert('Failed to load car data'));
            });
          });

          // ensure reset when modal closed
          const origClose = closeModal;
          if (cancelModal) {
            cancelModal.addEventListener('click', () => { resetToCreate(); });
          }
          if (backdrop) {
            backdrop.addEventListener('click', () => { resetToCreate(); });
          }
        })();
