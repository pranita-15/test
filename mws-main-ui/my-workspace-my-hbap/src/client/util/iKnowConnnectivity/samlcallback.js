import React, { useEffect } from 'react';
// import { useHistory } from 'react-router-dom';
async function SamlCallback() {
    // const history = useHistory();
    console.log("saml callback");
    // Extract the SAML assertion from the SAML response
    console.log(window.location.search);
    const samlResponse = new URLSearchParams(window.location.search).get('SAMLResponse');
    console.log("saml resp", samlResponse)
    if (samlResponse) {
        // Decode the SAML response (Base64)
        console.log("inside if");
        const decodedResponse = atob(samlResponse);
        // Extract the SAML assertion from the decoded response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(decodedResponse, 'text/xml');
        const samlAssertion = xmlDoc.getElementsByTagName('Assertion')[0].outerHTML;

        sessionStorage.setItem('SAML_ASSERTION',samlAssertion);
        return(samlAssertion);
    } else {
        console.log("SAML response not found in URL");
    }
}
export default SamlCallback;
