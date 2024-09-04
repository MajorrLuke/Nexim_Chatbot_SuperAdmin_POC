/** @type {import("next").NextConfig} */
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signin',
        permanent: true,
      },
    ];
  },
  output: "standalone",
}