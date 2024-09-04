/** @type {import("next").NextConfig} */
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/api/auth/signin?callbackUrl=/dashboard',
        permanent: true,
      },
      {
        source: '/auth/signin',
        destination: '/api/auth/signin?callbackUrl=/dashboard',
        permanent: true,
      },
    ];
  },
  output: "standalone",
}