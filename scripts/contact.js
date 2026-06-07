let confirmedDate = '';
let confirmedTime = '';

document.addEventListener('DOMContentLoaded', () => {
    // Botão Confirm (date/time)
    const confirmBtn = document.querySelector('.confirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function (e) {
            e.preventDefault();
            confirmedDate = document.getElementById('date').value;
            confirmedTime = document.getElementById('time').value;
            if (confirmedDate && confirmedTime) {
                alert(`Date and time confirmed:\n${confirmedDate} at ${confirmedTime}`);
            } else {
                alert('Please select both date and time.');
            }
        });
    }

    // Botão Submit (formulário)
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.querySelector('button[type="submit"][form="contactForm"]');
    if (contactForm && submitBtn) {
        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const formData = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                phone: contactForm.phone.value,
                services: Array.from(contactForm.querySelectorAll('input[name="service"]:checked')).map(cb => cb.value),
                date: confirmedDate || document.getElementById('date').value,
                time: confirmedTime || document.getElementById('time').value,
                address: contactForm.address.value,
                number: contactForm.number.value,
                neighborhood: contactForm.neighborhood.value,
                city: contactForm.city.value
            };

            fetch('http://localhost:3000/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                contactForm.reset();
            })
            .catch(error => {
                alert('Erro ao enviar formulário!');
                console.error(error);
            });
        });
    }
});