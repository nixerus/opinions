module.exports = {
    adminPassword: "aaa",
    port: 2928,
    mongoAddress: "localhost",
    mongoDatabase: "test",
    mongoPrefix: "",
    allowCloudflare: true, // Warning! Turning this on allows anyone to fake requests from any IP if they have direct access to the site's IP. Proceed with caution.
    twitterEnabled: true,
    twitterConfig: {
        consumer_key: "",
        consumer_secret: "",
        access_token_key: "",
        access_token_secret: ""
    },
    localUrl: "https://feedback.netx.dev/"
}