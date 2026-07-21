const branches = {
  central: { name: 'Casa Central · Garupá', phone: '543764645947' },
  acceso: { name: 'Acceso Sur · Garupá', phone: '3764174928' },
  jardin: { name: 'Jardín América', phone: '3743668272' },
  obera: { name: 'Oberá', phone: '5493755200787' }
};

const form = document.querySelector('#orderForm');
const payment = document.querySelector('#payment');
const transferField = document.querySelector('#transferField');
const transferHolder = document.querySelector('#transferHolder');
const taxId = document.querySelector('#taxId');
const taxIdError = document.querySelector('#taxIdError');
const formMessage = document.querySelector('#formMessage');

payment.addEventListener('change', () => {
  const isTransfer = payment.value === 'Transferencia';
  transferField.hidden = !isTransfer;
  transferHolder.required = isTransfer;
  if (!isTransfer) transferHolder.value = '';
});

taxId.addEventListener('input', () => {
  const digits = taxId.value.replace(/\D/g, '').slice(0, 11);
  taxId.value = digits.length > 10 ? `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}` : digits;
  taxIdError.textContent = '';
});

function validTaxId(value) {
  const digits = value.replace(/\D/g, '');
  if (!/^\d{11}$/.test(digits)) return false;
  const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = factors.reduce((total, factor, index) => total + factor * Number(digits[index]), 0);
  const remainder = 11 - (sum % 11);
  const checkDigit = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder;
  return checkDigit === Number(digits[10]);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.textContent = '';

  if (!form.checkValidity()) {
    formMessage.textContent = 'Revisá los campos marcados antes de continuar.';
    form.reportValidity();
    return;
  }

  if (!validTaxId(taxId.value)) {
    taxIdError.textContent = 'Ingresá un CUIT/CUIL válido de 11 dígitos.';
    taxId.focus();
    return;
  }

  const data = new FormData(form);
  const selectedBranch = branches[data.get('branch')];
  const transferText = data.get('payment') === 'Transferencia' ? `\n🏦 *Titular de la transferencia:* ${data.get('transferHolder')}` : '';
  const offersText = data.get('offers') ? 'Sí, deseo recibir novedades' : 'No';
  const message = `🛒 *SOLICITUD DE PEDIDO DESDE LA WEB*\n\n👤 *Cliente:* ${data.get('customerName')}\n🪪 *CUIT/CUIL:* ${taxId.value}\n🧾 *Tipo de compra:* ${data.get('customerType')}\n🏪 *Sucursal:* ${selectedBranch.name}\n\n📦 *Pedido:*\n${data.get('orderDetail')}\n\n💳 *Pago preferido:* ${data.get('payment')}${transferText}\n🔔 *Recibir ofertas:* ${offersText}\n\nAguardo confirmación de disponibilidad, precio final y horario de retiro. Entiendo que no debo transferir hasta recibir los datos oficiales de la sucursal.`;
  window.open(`https://wa.me/${selectedBranch.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});
