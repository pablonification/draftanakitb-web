// Change to CommonJS exports since Next.js API routes use CommonJS by default
const ADMIN_CREDENTIALS = {
  admins: [
    {
      username: 'admin1',
      password: 'draftanakitb2024_1', // In production, use hashed passwords
      name: 'Arqila Surya Putra'
    },
    {
      username: 'admin2',
      password: 'draftanakitb2024_2',
      name: 'Wisa Ahmaduta'
    }
  ]
};

module.exports = { ADMIN_CREDENTIALS };
