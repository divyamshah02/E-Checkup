// Global variables for API endpoints and CSRF token
let csrf_token = null
let login_api_url = null
let logout_api_url = null


// Initialize login page with API endpoints
async function InitializeLogin(csrf_token_param, login_api_url_param, logout_api_url_param) {
  csrf_token = csrf_token_param
  login_api_url = login_api_url_param
  logout_api_url = logout_api_url_param

  let = passwordToggle = document.getElementById("passwordToggle")
  passwordToggle.addEventListener("click", () => togglePassword())

}

async function LoginUser(username, password) {
    const loginUserData = {
        email: username,
        password: password,
    };

    const url = login_api_url;
    const [success, result] = await callApi("POST", url, loginUserData, csrf_token);
    if (success) {
        console.log("Login User Success:", result);

        if (result.success) {
            let user_id = result.data.user_id;
            window.location.href = `/dashboard/?user_id=${user_id}`;
        }

        else if (result.user_does_not_exist) {
            document.getElementById('error-user-not-found').style.display = '';
        }

        else if (result.wrong_password) {
            document.getElementById('error-wrong-password').style.display = '';
        }

        else {
            document.getElementById('error-unexpected').style.display = '';
        }

    } else {
        console.error("Login User Failed:", result);
        document.getElementById('error-unexpected').style.display = '';
    }
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    console.log("🔐 Login form submitted");
    // toggle_loader();
    document.getElementById('error-wrong-password').style.display = 'none';
    document.getElementById('error-user-not-found').style.display = 'none';
    document.getElementById('error-unexpected').style.display = 'none';

    const form = event.target;

    // Prevent the form from submitting
    event.preventDefault();

    // Check form validity
    if (!form.checkValidity()) {
        // Trigger the browser's built-in validation tooltips
        form.reportValidity();
        return;
    }

    // Get form values
    const username = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Call the login API
    await LoginUser(username, password);
    // toggle_loader();

});


function togglePassword() {
    let passwordInput = document.getElementById("password")
    const type = passwordInput.type === "password" ? "text" : "password"
    passwordInput.type = type

    const icon = passwordToggle.querySelector("i")
    icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash"
  }
