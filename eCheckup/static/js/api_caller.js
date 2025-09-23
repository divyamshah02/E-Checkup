async function callApi(method, url, bodyData = null, csrfToken = '', media_upload=false) {
    toggle_loader()
    try {
        // Validate method and URL
        if (typeof method !== 'string' || typeof url !== 'string') {
            throw new Error("Invalid method or URL");
        }

        let headers_data = {}

        if (media_upload){
            headers_data = {
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            };
        }
        else {
            headers_data = {
                'Content-Type': 'application/json',
                ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            };
        }
            
        // Prepare request options
        const options = {
            method: method.toUpperCase(),
            headers: headers_data
        };

        // Add bodyData for non-GET requests
        if (method.toUpperCase() !== 'GET' && bodyData) {
            if (media_upload){
                options.body = bodyData;            
            }
            else {
                options.body = JSON.stringify(bodyData);
            }
        }

        // Make the fetch request
        const response = await fetch(url, options);
        // console.log(response)

        // Check for HTTP errors
        // if (!response.ok) {
        //     throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        // }


        try {
            const data = await response.json();
            toggle_loader()
            return [true, data];
        }
        catch(error) {
            console.log('Error in parsing JSON:', error);
            window.location.href=`/login/`;            
        }
        
        // Parse the JSON response
        // data = await response.json();

        // Return success flag and data
        
    } catch (error) {
        // Log and return failure flag with error
        console.error("API Call Error:", error);
        toggle_loader()
        return [false, error.message || "An unknown error occurred"];
    }
}

function toQueryString(params) {
    return Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');
}


// Example Usage of api caller function
async function exampleApiCallerPOST() {
    const bodyData = {
        email: "divyamshah1234@gmail.com",
        password: "divym",
    };

    const url = "{% url 'login-api-list' %}";
    const [success, result] = await callApi("POST", url, bodyData, "{{csrf_token}}");
    if (success) {
        console.log("Result:", result);
    } else {
        console.error("Login User Failed:", result);
    }
}


async function exampleApiCallerGET() {
    const Params = {
        user_id: "IO7169754192",
    };

    const url = "{% url 'user-list' %}?" + toQueryString(Params); // Construct the full URL with query params
    const [success, result] = await callApi("GET", url);
    if (success) {
        console.log("GET User Success:", result);
    } else {
        console.error("GET User Failed:", result);
    }
}

function toggle_loader() {
    let existingLoader = document.getElementById('dynamic-page-loader');

    if (existingLoader) {
        // If loader exists, remove it
        existingLoader.remove();
    } else {
        // Create loader container
        const loader = document.createElement('div');
        loader.id = 'dynamic-page-loader';
        loader.style.position = 'fixed';
        loader.style.top = 0;
        loader.style.left = 0;
        loader.style.width = '100%';
        loader.style.height = '100%';
        loader.style.background = 'rgba(255, 255, 255, 0.7)';
        loader.style.display = 'flex';
        loader.style.justifyContent = 'center';
        loader.style.alignItems = 'center';
        loader.style.zIndex = 9999;

        // Create spinner
        const spinner = document.createElement('div');
        spinner.style.width = '3rem';
        spinner.style.height = '3rem';
        spinner.style.border = '6px solid #ccc';
        spinner.style.borderTop = '6px solid #1e40af';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';

        // Inject keyframe animation (once)
        if (!document.getElementById('loader-spin-style')) {
            const style = document.createElement('style');
            style.id = 'loader-spin-style';
            style.innerHTML = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        loader.appendChild(spinner);
        document.body.appendChild(loader);
    }
}
