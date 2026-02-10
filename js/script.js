// Contact Manager - stores contacts in localStorage
let contacts = [];

function loadContacts() {
  const raw = localStorage.getItem('contacts');
  contacts = raw ? JSON.parse(raw) : [];
}

function saveContacts() {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

function renderContacts() {
  const tbody = document.getElementById('contactsTableBody');
  tbody.innerHTML = '';
  if (!contacts.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" class="no-contacts">No contacts yet. Add one using the form.</td>';
    tbody.appendChild(tr);
    return;
  }

  contacts.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone || '')}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${c.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${c.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addContact(contact) {
  contacts.push(contact);
  saveContacts();
  renderContacts();
}

function updateContact(id, updates) {
  const idx = contacts.findIndex(c => c.id === id);
  if (idx === -1) return false;
  contacts[idx] = Object.assign({}, contacts[idx], updates);
  saveContacts();
  renderContacts();
  return true;
}

function deleteContact(id) {
  contacts = contacts.filter(c => c.id !== id);
  saveContacts();
  renderContacts();
}

document.addEventListener('DOMContentLoaded', () => {
  loadContacts();
  renderContacts();

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    if (!name || !email) return;
    const contact = { id: String(Date.now()), name, email, phone, address };
    addContact(contact);
    form.reset();
  });

  // Delegated click handling for edit/delete
  document.getElementById('contactsTable').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'edit') openEditModal(id);
    if (action === 'delete') {
      if (confirm('Delete this contact?')) deleteContact(id);
    }
  });

  // Edit modal handling
  const editModalEl = document.getElementById('editModal');
  const editModal = new bootstrap.Modal(editModalEl);
  const saveBtn = document.getElementById('saveEditBtn');

  window.openEditModal = function (id) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    document.getElementById('editId').value = c.id;
    document.getElementById('editName').value = c.name;
    document.getElementById('editEmail').value = c.email;
    document.getElementById('editPhone').value = c.phone || '';
    document.getElementById('editAddress').value = c.address || '';
    editModal.show();
  };

  saveBtn.addEventListener('click', () => {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    if (!name || !email) return alert('Name and email are required.');
    updateContact(id, { name, email, phone, address });
    editModal.hide();
  });
});
