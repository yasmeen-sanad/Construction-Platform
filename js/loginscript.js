import { api } from './api.js';

document.addEventListener("DOMContentLoaded", () => {

  // --------------------- Tabs Switch ---------------------
  const signupTab = document.getElementById("signup-tab");
  const loginTab = document.getElementById("login-tab");
  const signupSection = document.getElementById("signup-section");
  const loginSection = document.getElementById("login-section");
  const signupSteps = document.getElementById("signup-steps");
  const mainTitle = document.getElementById("main-title");
  const mainSubtitle = document.getElementById("main-subtitle");

  signupTab.addEventListener("click", () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupSection.classList.add("active");
    loginSection.classList.remove("active");
    signupSteps.classList.remove("active");
    mainTitle.textContent = "إنشاء حساب";
    mainSubtitle.textContent = "اختر نوع المستخدم الذي تريده";
  });

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginSection.classList.add("active");
    signupSection.classList.remove("active");
    signupSteps.classList.remove("active");
    mainTitle.textContent = "مرحبا بك";
    mainSubtitle.textContent = "اختر الطريقة التي تناسبك لتسجيل الدخول";
  });

  // --------------------- Dynamic Login Input ---------------------
  const phoneRadio = document.getElementById("phone-radio");
  const emailRadio = document.getElementById("email-radio");
  const loginInput = document.getElementById("login-input");
  const loginPassInput = document.getElementById("pass-input");
  const inputIcon = document.getElementById("input-icon");

  emailRadio.addEventListener("change", () => {
    loginInput.placeholder = "أدخل البريد الإلكتروني";
    loginInput.type = "email";
    inputIcon.className = "input-icon fa-solid fa-envelope";
  });

  phoneRadio.addEventListener("change", () => {
    loginInput.placeholder = "059xxxxxxx";
    loginInput.type = "text";
    inputIcon.className = "input-icon fa-solid fa-phone";
  });

  // --------------------- Login ---------------------
  const loginBtn = document.getElementById("login-btn");
  loginBtn.addEventListener("click", async () => {
    const loginValue = loginInput.value.trim();
    const passwordValue = loginPassInput.value.trim();

    if (!loginValue || !passwordValue) {
      return alert("الرجاء إدخال جميع الحقول");
    }

    if (emailRadio.checked) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginValue)) return alert("البريد الإلكتروني غير صالح");
    }

    if (phoneRadio.checked) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(loginValue)) return alert("رقم الهاتف يجب أن يكون 10 أرقام");
    }

    try {
      const credentials = emailRadio.checked
        ? { email: loginValue, password: passwordValue }
        : { phone: loginValue, password: passwordValue };

      const response = await api.login(credentials);

     if (response.success) {
  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user)); 
  }
        const role = response.user.role;
        if (role === "customer") {
          window.location.href = "/index.html";
        } else if (role === "seller" || role === "admin") {
          window.location.href = "/seller-homepage.html";
        } else {
          alert("تم تسجيل الدخول، لكن الدور غير معروف.");
        }
      } else {
        alert(response.message || "البريد الإلكتروني أو كلمة المرور خاطئة");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال بالخادم");
    }
  });

  // --------------------- password eye icon ---------------------
  const loginWrapper = loginPassInput.parentElement;
  const eyeIconLogin = document.createElement("i");
  eyeIconLogin.className = "input-icon fa-solid fa-eye toggle-pass-login";
  loginWrapper.appendChild(eyeIconLogin);

  eyeIconLogin.addEventListener("click", () => {
    loginPassInput.type = loginPassInput.type === "password" ? "text" : "password";
    eyeIconLogin.classList.toggle("fa-eye");
    eyeIconLogin.classList.toggle("fa-eye-slash");
  });

  // --------------------- Multi-step Signup ---------------------
  const optionButtons = document.querySelectorAll(".option");
  const stepsIndicator = document.querySelectorAll(".step");
  const stepContents = document.querySelectorAll(".step-content");
  let currentStep = 1;
  let selectedUser = "";

  optionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedUser = btn.getAttribute("data-user");
      signupSection.classList.remove("active");
      loginSection.classList.remove("active");
      signupSteps.classList.add("active");
      signupTab.style.display = "none";
      loginTab.style.display = "none";
      mainTitle.textContent = "إنشاء حساب";
      mainSubtitle.textContent = "";

      const sellerFields = document.getElementById("seller-fields");
      if (selectedUser === "seller") {
        sellerFields.style.display = "block";
        document.getElementById("companyName").required = true;
        document.getElementById("commercialRecord").required = true;
      } else {
        sellerFields.style.display = "none";
        document.getElementById("companyName").required = false;
        document.getElementById("commercialRecord").required = false;
      }

      showStep(1);
    });
  });

  function showStep(step) {
    currentStep = step;
    stepContents.forEach(content => content.classList.toggle("active", parseInt(content.getAttribute("data-step")) === step));
    stepsIndicator.forEach((circle, i) => circle.classList.toggle("active", i === step - 1));
  }

  // --------------------- Next Buttons ---------------------
  const nextButtons = document.querySelectorAll(".next-btn");
  nextButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (currentStep === 1) {
        const stepEmail = document.getElementById("step-email").value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!stepEmail || !emailRegex.test(stepEmail)) {
          return alert("الرجاء إدخال بريد إلكتروني صالح");
        }
        document.getElementById("email").value = stepEmail;
        document.getElementById("email").readOnly = true;
      }

      if (currentStep === 2) {
        const otp = document.getElementById("step-otp").value.trim();
        if (!otp) return alert("الرجاء إدخال رمز التحقق");
      }

      if (currentStep === 3) {
        const pass = document.getElementById("step-pass").value.trim();
        const confirm = document.getElementById("step-pass-confirm").value.trim();
        const passRegex = /^(?=.*[A-Z]).{8,}$/;
        if (!passRegex.test(pass)) return alert("كلمة المرور ضعيفة");
        if (pass !== confirm) return alert("كلمتا المرور غير متطابقتين");

        document.getElementById("step-pass-final").value = pass;
      }

      if (currentStep < 4) showStep(currentStep + 1);
    });
  });

  // --------------------- Signup password toggle ---------------------
  const togglePassIcons = document.querySelectorAll(".toggle-pass");
  togglePassIcons.forEach(icon => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

  // --------------------- Country/City ---------------------
  const countrySelect = document.getElementById("country");
  const citySelect = document.getElementById("city");
  const cities = {
    sa: ["الرياض", "جدة", "الدمام"],
    ae: ["دبي", "أبوظبي", "الشارقة"],
    kw: ["الكويت", "الأحمدي", "الفروانية"]
  };
  citySelect.disabled = true;

  countrySelect.addEventListener("change", function () {
    citySelect.innerHTML = '<option value="">اختر المدينة</option>';
    if (cities[this.value]) {
      citySelect.disabled = false;
      cities[this.value].forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    } else citySelect.disabled = true;
  });

  // --------------------- Final Signup ---------------------
  const finalForm = document.getElementById("finalForm");
  finalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("step-pass-final").value.trim();

    // Validate phone
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return alert("رقم الهاتف يجب أن يكون 10 أرقام");
    }

    const userData = {
      name: firstName + " " + lastName,
      email,
      password,
      phone,
      role: selectedUser === "seller" ? "admin" : "customer"
    };

    try {
      const response = await api.register(userData);

      if (response.success) {
        localStorage.setItem("token", response.token);
        alert("تم إنشاء الحساب بنجاح");
        window.location.href = selectedUser === "seller" ? "/seller-homepage.html" : "/index.html";
      } else {
        alert(response.message || "حدث خطأ أثناء التسجيل");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال بالخادم");
    }
  });

});
