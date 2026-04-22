const header = document.querySelector("[data-header]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const goal = String(formData.get("goal") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !goal || !message) {
      contactForm.reportValidity();
      return;
    }

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Loan goal: ${goal}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const subject = encodeURIComponent(`Home lending review request from ${name}`);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:hello@homelendingadvisor.lol?subject=${subject}&body=${encodedBody}`;
    contactForm.dataset.lastMailto = mailtoUrl;
    window.location.href = mailtoUrl;

    if (formNote) {
      formNote.textContent = "Opening your email app with the request details.";
    }
  });
}
