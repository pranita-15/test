import axios from "axios";

// Correct API URL
const tokenEndpoint = "http://localhost:3400/oidc-token-service/default/token";

const clientId = "MY_WORKSPACE"; // Ensure this is correct

export async function getOidcToken(samlAssertion) {
    if (!samlAssertion) {
        console.error("SAML Assertion is missing!");
        return;
    }

    const payload = new URLSearchParams({
        "grant_type": "urn:ietf:params:oauth:grant-type:saml2-bearer",
        "assertion": samlAssertion, // Ensure this is correctly populated
        "scope": "openid tags content_entitlements",
        "client_id": clientId  // Pass client_id in payload instead of headers
    });

    // Headers without Authorization
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    };

    try {
        console.log("Sending request to:", tokenEndpoint);
        console.log("Payload:", payload.toString());

        const response = await axios.post(tokenEndpoint, payload, { headers });

        console.log("Response received:", response);

        if (response.status === 200) {
            const { id_token, access_token } = response.data;
            console.log("ID Token:", id_token);
            console.log("Access Token:", access_token);
            return { id_token, access_token };
        } else {
            console.error("Failed to fetch token:", response.status, response.data);
        }
    } catch (error) {
        console.error("Error fetching token:", error);
    }
}
