/** @type {import("next").NextConfig} */
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/api/auth/signin?callbackUrl=/superAdmin',
        permanent: true,
      },
      {
        source: '/auth/signin',
        destination: '/api/auth/signin?callbackUrl=/superAdmin',
        permanent: true,
      },
    ];
  },
  output: "standalone",
}