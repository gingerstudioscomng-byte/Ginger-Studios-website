'use strict';
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu';}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);toggle.textContent=open?'Close':'Menu';});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){closeMenu();toggle.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
window.matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
for (const form of document.querySelectorAll('.enquiry-form')) {
  const choice = form.elements.project;
  const other = form.elements.other;
  choice.addEventListener('change', () => {
    const active = choice.value === 'Other';
    other.closest('label').hidden = !active;
    other.disabled = !active;
    other.required = active;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const interest = choice.value === 'Other' ? String(values.get('other')).trim() : choice.value;
    const body = ['Name: ' + values.get('name'), 'Email: ' + values.get('email'), 'Phone: ' + values.get('phone'), 'Location: ' + values.get('location'), 'Interested in: ' + interest, '', 'Message:', values.get('message')].join('\n');
    const email = 'mailto:' + form.dataset.recipient + '?subject=' + encodeURIComponent('Ginger enquiry: ' + interest) + '&body=' + encodeURIComponent(body);
    window.location.href = email;
    form.querySelector('.form-status').textContent = 'Your email draft is ready. Please review and send it in your email app. If your app did not open, use the email address alongside this form.';
  });
}
